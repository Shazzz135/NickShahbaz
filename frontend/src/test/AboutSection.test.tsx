import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AboutSection } from '../components/sections/AboutSection';

describe('AboutSection', () => {
  it('renders section headline and bio narrative', async () => {
    render(<AboutSection />);

    // Wait for hydration
    expect(await screen.findByText(/Nick Shahbaz/i)).toBeDefined();
    expect(screen.getByText(/Engineering Robust Software with Precision/i)).toBeDefined();
    expect(screen.queryByText(/Solutions Architect & Full-Stack Engineer/i)).toBeNull();
    expect(screen.queryByText(/^Lead$/i)).toBeNull();
    expect(screen.getByText(/Toronto, Ontario, Canada/i)).toBeDefined();
  });

  it('renders quick stats telemetry ribbon', async () => {
    render(<AboutSection />);

    expect(await screen.findByText('5+')).toBeDefined();
    expect(screen.getByText(/Years Experience/i)).toBeDefined();
    expect(screen.getByText('30+')).toBeDefined();
    expect(screen.getByText(/Production Apps/i)).toBeDefined();
    expect(screen.getByText('99.9%')).toBeDefined();
    expect(screen.getByText(/System Uptime/i)).toBeDefined();
    expect(screen.getByText('60 FPS')).toBeDefined();
  });

  it('renders all four engineering philosophy principles', async () => {
    render(<AboutSection />);

    expect(await screen.findByText(/Performance as a Core Feature/i)).toBeDefined();
    expect(screen.getByText(/End-to-End Type Safety/i)).toBeDefined();
    expect(screen.getByText(/Modular & Decoupled Systems/i)).toBeDefined();
    expect(screen.getByText(/Aesthetic Precision & Tactile Feedback/i)).toBeDefined();
    expect(screen.getByText('<50ms SLA')).toBeDefined();
    expect(screen.getByText('Zero Runtime Errors')).toBeDefined();
  });

  it('renders skills matrix and filters by category', async () => {
    render(<AboutSection />);

    expect(await screen.findByText(/Categorized Skills Matrix/i)).toBeDefined();
    expect(screen.getByText(/TypeScript/i)).toBeDefined();

    // Click filter pill
    const backendPill = screen.getByRole('button', { name: /Filter skills by Backend & Cloud/i });
    fireEvent.click(backendPill);

    await waitFor(() => {
      expect(screen.getByText(/Node\.js & Express/i)).toBeDefined();
    });
  });
});
