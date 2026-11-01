import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExperienceTimeline } from '../components/sections/ExperienceTimeline';

describe('ExperienceTimeline', () => {
  it('renders section title, subtitle, and all category filter buttons', async () => {
    render(<ExperienceTimeline />);

    expect(screen.getByText(/Engineering Journey &/i)).toBeDefined();
    expect(screen.getByText(/Interactive Milestones/i)).toBeDefined();
    expect(screen.getByText(/02 \/ CAREER TRAJECTORY & MILESTONES/i)).toBeDefined();

    // Category filter pills
    expect(await screen.findByRole('button', { name: /Filter by all milestones/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Filter by experiences/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Filter by education/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Filter by certifications/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Filter by events/i })).toBeDefined();
  });

  it('hydrates experiences, events, certifications, and education milestones', async () => {
    render(<ExperienceTimeline />);

    // Experience item
    expect(
      await screen.findByText(/Lead Application Developer & Solutions Architect/i)
    ).toBeDefined();
    expect(screen.getByText(/Senior Full-Stack Engineer/i)).toBeDefined();

    // Event item
    expect(
      screen.getByText(/Grand Prize Winner & Lead System Architect/i)
    ).toBeDefined();

    // Certification item
    expect(
      screen.getByText(/AWS Certified Solutions Architect & Cloud Practitioner/i)
    ).toBeDefined();

    // Education item
    expect(
      screen.getByText(/B.S. in Computer Science & Software Engineering/i)
    ).toBeDefined();
  });

  it('filters milestones when clicking category pills', async () => {
    render(<ExperienceTimeline />);

    // Wait for hydration
    await screen.findByText(/Lead Application Developer & Solutions Architect/i);

    // Click 'Education' filter pill
    const eduFilterBtn = screen.getByRole('button', { name: /Filter by education/i });
    fireEvent.click(eduFilterBtn);

    // Education should remain visible
    expect(screen.getByText(/B.S. in Computer Science & Software Engineering/i)).toBeDefined();

    // Work / Event items should no longer be rendered
    expect(screen.queryByText(/Lead Application Developer & Solutions Architect/i)).toBeNull();
    expect(screen.queryByText(/Grand Prize Winner & Lead System Architect/i)).toBeNull();

    // Click 'Events' filter pill
    const eventFilterBtn = screen.getByRole('button', { name: /Filter by events/i });
    fireEvent.click(eventFilterBtn);

    expect(screen.getByText(/Grand Prize Winner & Lead System Architect/i)).toBeDefined();
    expect(screen.queryByText(/B.S. in Computer Science & Software Engineering/i)).toBeNull();
  });

  it('allows expanding and collapsing timeline cards to toggle deliverables', async () => {
    render(<ExperienceTimeline />);

    const eduRole = await screen.findByText(
      /B.S. in Computer Science & Software Engineering/i
    );
    expect(eduRole).toBeDefined();

    // Initially collapsed: honors detail is not in the document
    expect(
      screen.queryByText(/Specialized in Software Architecture, Distributed Computing/i)
    ).toBeNull();

    // Click to expand
    fireEvent.click(eduRole);

    // Now expanded: deliverables and coursework are visible
    expect(
      await screen.findByText(/Specialized in Software Architecture, Distributed Computing/i)
    ).toBeDefined();
    expect(screen.getByText(/Core Topics & Coursework/i)).toBeDefined();
    expect(screen.getByText(/Distributed Systems/i)).toBeDefined();

    // Click to collapse
    fireEvent.click(eduRole);

    await waitFor(() => {
      expect(
        screen.queryByText(/Specialized in Software Architecture, Distributed Computing/i)
      ).toBeNull();
    });
  });

  it('toggles all items when using the global Expand/Collapse All button', async () => {
    render(<ExperienceTimeline />);

    await screen.findByText(/Lead Application Developer & Solutions Architect/i);

    const toggleAllBtn = screen.getByRole('button', {
      name: /Expand All Deliverables|Collapse All Cards/i,
    });
    expect(toggleAllBtn).toBeDefined();

    // Click expand all
    fireEvent.click(toggleAllBtn);

    // All highlights should now be visible across all categories
    expect(
      await screen.findByText(/Specialized in Software Architecture, Distributed Computing/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Architected an autonomous multi-agent task resolution engine/i)
    ).toBeDefined();

    // Click collapse all
    fireEvent.click(toggleAllBtn);

    await waitFor(() => {
      expect(
        screen.queryByText(/Specialized in Software Architecture, Distributed Computing/i)
      ).toBeNull();
    });
  });

  it('orders milestones strictly from most recent down to least recent', async () => {
    render(<ExperienceTimeline />);

    await screen.findByText(/Lead Application Developer & Solutions Architect/i);

    // Get all heading elements inside cards
    const headings = screen.getAllByRole('heading', { level: 3 });
    const renderedTitles = headings.map((h) => h.textContent);

    // Most recent (2024 — Present) first, followed by active certification (2023 — Present), down to academic foundation (2018 — 2022) at the bottom
    expect(renderedTitles[0]).toContain('Lead Application Developer & Solutions Architect');
    expect(renderedTitles[1]).toContain('AWS Certified Solutions Architect & Cloud Practitioner');
    expect(renderedTitles[renderedTitles.length - 1]).toContain('B.S. in Computer Science & Software Engineering');
  });
});
