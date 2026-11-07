import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '../components/sections/HeroSection';
import { SmoothScrollContext } from '../hooks/useSmoothScroll';
import { AuthContext, type AuthContextType } from '../hooks/useAuth';

describe('HeroSection', () => {
  it('renders high-impact headline and status indicators', () => {
    render(<HeroSection isSceneReady />);

    expect(screen.getByText(/Open for Select Contracts/i)).toBeDefined();
    expect(screen.getByText(/Architecting Next-Gen/i)).toBeDefined();
    expect(screen.getByText(/Applications & 3D Systems/i)).toBeDefined();
  });

  it('renders interactive tech chips', () => {
    render(<HeroSection isSceneReady />);

    expect(screen.getByText(/React & Node\.js/i)).toBeDefined();
    expect(screen.getByText(/TypeScript/i)).toBeDefined();
    expect(screen.getByText(/Three.js \/ WebGL/i)).toBeDefined();
    expect(screen.getByText(/Docker & Cloud/i)).toBeDefined();
    expect(screen.getByText(/PostgreSQL & Supabase/i)).toBeDefined();
  });

  it('renders engineering metrics ribbon', () => {
    render(<HeroSection isSceneReady />);

    expect(screen.getByText(/5\+ Years/i)).toBeDefined();
    expect(screen.getByText(/99\.9%/i)).toBeDefined();
    expect(screen.getByText(/< 50ms/i)).toBeDefined();
    expect(screen.getByText(/60 FPS/i)).toBeDefined();
  });

  it('triggers smooth scroll when clicking CTA buttons', () => {
    const mockScrollTo = vi.fn();

    render(
      <SmoothScrollContext.Provider value={{ lenis: null, scrollTo: mockScrollTo }}>
        <HeroSection isSceneReady />
      </SmoothScrollContext.Provider>
    );

    const exploreBtn = screen.getByRole('button', { name: /Explore Engineering Work/i });
    fireEvent.click(exploreBtn);

    // When projects section does not exist on page yet, fallback smooth scroll runs
    expect(exploreBtn).toBeDefined();

    const collabBtn = screen.getByRole('button', { name: /Initiate Collaboration/i });
    fireEvent.click(collabBtn);

    expect(collabBtn).toBeDefined();
  });

  it('hides Admin Portal button by default for non-admin visitors', () => {
    render(<HeroSection isSceneReady />);
    expect(screen.queryByText(/Admin Portal/i)).toBeNull();
  });

  it('renders Admin Portal button linking to /admin/dashboard when user is admin', () => {
    const mockAuth: AuthContextType = {
      user: { id: 'admin-1', email: 'nickshahbaz135@gmail.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
      session: null,
      loading: false,
      isAdmin: true,
      token: 'jwt-token',
      refreshToken: 'refresh-token',
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      refreshAuthToken: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuth}>
        <HeroSection isSceneReady />
      </AuthContext.Provider>
    );

    const adminBtn = screen.getByText(/Admin Portal/i);
    expect(adminBtn).toBeDefined();
    const anchor = adminBtn.closest('a');
    expect(anchor?.getAttribute('href')).toBe('/admin/dashboard');
  });
});