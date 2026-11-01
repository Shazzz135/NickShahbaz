import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AboutSection } from '../components/sections/AboutSection';

describe('AboutSection', () => {
  it('renders section headline and bio narrative', async () => {
    render(<AboutSection />);

    // Wait for hydration
    expect(await screen.findByText(/Nick Shahbaz/i)).toBeDefined();
    expect(screen.getByText(/Engineering Robust Software with Precision/i)).toBeDefined();
    expect(screen.getByText(/Solutions Architect & Full-Stack Engineer/i)).toBeDefined();
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

    // Wait for hydration
    expect(await screen.findByText('TypeScript')).toBeDefined();
    expect(screen.getByText('Three.js / WebGL')).toBeDefined();
    expect(screen.getByText('Docker & Containers')).toBeDefined();
    expect(screen.getByText('GitHub Actions CI/CD')).toBeDefined();

    // Filter to 'Languages'
    const languagesBtn = screen.getByRole('button', { name: /Filter skills by Languages/i });
    fireEvent.click(languagesBtn);

    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('Python')).toBeDefined();
    await waitFor(() => {
      expect(screen.queryByText('Docker & Containers')).toBeNull();
    });

    // Filter to 'Frontend & 3D'
    const frontendBtn = screen.getByRole('button', { name: /Filter skills by Frontend & 3D/i });
    fireEvent.click(frontendBtn);

    expect(screen.getByText('Three.js / WebGL')).toBeDefined();
    expect(screen.getByText('React 19 / Next.js')).toBeDefined();
    await waitFor(() => {
      expect(screen.queryByText('TypeScript')).toBeNull();
    });
  });
});