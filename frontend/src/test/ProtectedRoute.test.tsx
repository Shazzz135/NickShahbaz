import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import * as authHook from '../hooks/useAuth';
import type { User, Session } from '@supabase/supabase-js';

vi.mock('../hooks/useAuth');

const mockUser = (email: string): User => ({
  id: 'test-user-id',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email,
});

const mockSession: Session = {
  access_token: 'fake-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'fake-refresh-token',
  user: mockUser('test@example.com'),
};

describe('ProtectedRoute', () => {
  it('renders loading spinner when auth is loading', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: true,
      isAdmin: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Verifying Administrator Privileges/i)).toBeDefined();
  });

  it('blocks non-admin users and shows Access Denied', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: mockUser('stranger@example.com'),
      session: mockSession,
      loading: false,
      isAdmin: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Access Denied/i)).toBeDefined();
    expect(screen.getByText(/Unauthorized Account/i)).toBeDefined();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders children when authorized admin is authenticated', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: mockUser('nickshahbaz135@gmail.com'),
      session: mockSession,
      loading: false,
      isAdmin: true,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeDefined();
  });
});
