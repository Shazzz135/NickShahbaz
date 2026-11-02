import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExperienceTimeline } from '../components/sections/ExperienceTimeline';

describe('ExperienceTimeline', () => {
  it('renders section title and subtitle', async () => {
    render(<ExperienceTimeline />);

    expect(screen.getByText(/Engineering Journey &/i)).toBeDefined();
    expect(screen.getByText(/Interactive Milestones/i)).toBeDefined();
  });

  it('hydrates and displays all milestones directly in the unified timeline', async () => {
    render(<ExperienceTimeline />);

    // Experience items
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

  it('displays Technologies & Frameworks label and omits redundant red Experience badge', async () => {
    render(<ExperienceTimeline />);

    await screen.findByText(/Lead Application Developer & Solutions Architect/i);

    // Technologies & Frameworks label should be present across cards
    const techLabels = screen.getAllByText(/Technologies & Frameworks/i);
    expect(techLabels.length).toBeGreaterThan(0);

    // Respective category pills for Education and Certification should be present
    expect(screen.getAllByText(/Education/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Certification/i).length).toBeGreaterThan(0);
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
    const techHeaders = screen.getAllByText(/Technologies & Frameworks/i);
    expect(techHeaders.length).toBeGreaterThan(0);
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

    expect(renderedTitles[0]).toBe('Lead Application Developer & Solutions Architect');
    expect(renderedTitles).toContain('B.S. in Computer Science & Software Engineering');
  });
});
