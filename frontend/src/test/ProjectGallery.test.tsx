import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectGallery } from '../components/sections/ProjectGallery';

describe('ProjectGallery', () => {
  it('renders section title, subtitle, and all category filter tabs', () => {
    render(<ProjectGallery />);

    expect(screen.getByText(/My Best Working Projects/i)).toBeDefined();
    expect(screen.getByText(/Learning Process/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /All/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Full-Stack/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Mobile/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /AI\/Cloud/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tools\/Web3/i })).toBeDefined();
  });

  it('filters project cards when clicking category filter tabs', async () => {
    render(<ProjectGallery />);

    // Wait for projects to hydrate from hook
    const project = await screen.findByText(/Enterprise AI Workflow Platform/i);
    expect(project).toBeDefined();
    expect(screen.getByText(/Cross-Platform Fintech Mobile Suite/i)).toBeDefined();

    // Click 'Mobile' tab
    const mobileBtn = screen.getByRole('button', { name: /Mobile/i });
    fireEvent.click(mobileBtn);

    // Only mobile item should remain visible (waiting for AnimatePresence exit)
    expect(screen.getByText(/Cross-Platform Fintech Mobile Suite/i)).toBeDefined();
    await waitFor(() => {
      expect(screen.queryByText(/Kinetic 3D Commerce Engine/i)).toBeNull();
    });
  });

  it('opens and closes project detail modal', async () => {
    render(<ProjectGallery />);

    // Wait for projects to hydrate
    const projectTitle = await screen.findByText(/Enterprise AI Workflow Platform/i);
    fireEvent.click(projectTitle);

    // Modal opens displaying executive overview & architecture
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText(/Executive Overview/i)).toBeDefined();
    expect(screen.getByText(/System Architecture Overview/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Close modal/i })).toBeDefined();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Close modal/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('opens project detail modal with dual-pane layout displaying image left and all data right', async () => {
    render(<ProjectGallery />);

    const projectTitle = await screen.findByText(/Enterprise AI Workflow Platform/i);
    fireEvent.click(projectTitle);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();

    // Ensure raw technical labels are removed from user frontend
    expect(screen.queryByText(/Min ratio: 0.72/i)).toBeNull();
    expect(screen.queryByText(/Landscape Windows Frame/i)).toBeNull();

    // Verify all project details are visible on the right
    expect(screen.getByText(/Executive Overview/i)).toBeDefined();
    expect(screen.getByText(/System Architecture Overview/i)).toBeDefined();
    expect(screen.getByText(/Performance & Key Metrics/i)).toBeDefined();
    expect(screen.getByText(/Technologies Deployed/i)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Launch Live Demo/i })[0]).toBeDefined();
  });

  it('closes modal on Escape key press', async () => {
    render(<ProjectGallery />);

    const projectTitle = await screen.findByText(/Enterprise AI Workflow Platform/i);
    fireEvent.click(projectTitle);

    expect(screen.getByRole('dialog')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('makes two windows items sharing a row split the row equally with 6 columns each', async () => {
    render(<ProjectGallery />);

    // In Full-Stack category, both mock projects are windows (desktop) applications
    const fullStackBtn = screen.getByRole('button', { name: /Full-Stack/i });
    fireEvent.click(fullStackBtn);

    const proj1 = await screen.findByText(/Enterprise AI Workflow Platform/i);
    const proj2 = await screen.findByText(/Kinetic 3D Commerce Engine/i);

    // Both cards should have equal 6-column spans
    const card1 = proj1.closest('.md\\:col-span-6');
    const card2 = proj2.closest('.md\\:col-span-6');

    expect(card1).not.toBeNull();
    expect(card2).not.toBeNull();
    expect(card1?.className).toContain('lg:col-span-6');
    expect(card2?.className).toContain('lg:col-span-6');
  });
});
