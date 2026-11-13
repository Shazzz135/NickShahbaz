import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroSpotifyPlayer } from '../components/sections/HeroSpotifyPlayer';

describe('HeroSpotifyPlayer', () => {
  it('renders the Spotify player iframe persistently in DOM', () => {
    render(<HeroSpotifyPlayer playlistId="4kleKCOAl18opaCR30yzL9" />);

    expect(screen.getByTitle(/Curated Spotify Playlist Player/i)).toBeDefined();
    expect(screen.getAllByText(/WebPlaylist/i)[0]).toBeDefined();
  });

  it('allows toggling expand/compact mode on player card', () => {
    render(<HeroSpotifyPlayer playlistId="4kleKCOAl18opaCR30yzL9" />);

    const iframe = screen.getByTitle(/Curated Spotify Playlist Player/i) as HTMLIFrameElement;
    expect(iframe.height).toBe('152');

    // Click expand
    const expandBtn = screen.getByRole('button', { name: /Expand tracklist/i });
    fireEvent.click(expandBtn);
    expect(iframe.height).toBe('352');

    // Click collapse
    const collapseBtn = screen.getByRole('button', { name: /Collapse tracklist/i });
    fireEvent.click(collapseBtn);
    expect(iframe.height).toBe('152');
  });

  it('minimizes player card without unmounting the iframe so music keeps playing', async () => {
    render(<HeroSpotifyPlayer playlistId="4kleKCOAl18opaCR30yzL9" />);

    // Click minimize
    const minimizeBtn = screen.getByRole('button', { name: /Minimize player/i });
    fireEvent.click(minimizeBtn);

    // Desktop pill or mobile launcher appears
    await waitFor(() => {
      const openBtn = screen.getAllByRole('button', { name: /Open curated Spotify playlist|Open Spotify Playlist Popup/i })[0];
      expect(openBtn).toBeDefined();
    });

    // CRITICAL: The iframe must remain mounted in DOM so ongoing audio never stops
    expect(screen.getByTitle(/Curated Spotify Playlist Player/i)).toBeDefined();

    // Click open to restore
    const restoreBtn = screen.getAllByRole('button', { name: /Open curated Spotify playlist|Open Spotify Playlist Popup/i })[0];
    fireEvent.click(restoreBtn);

    // Card is restored
    expect(screen.getByTitle(/Curated Spotify Playlist Player/i)).toBeDefined();
  });

  it('does not display removed external Spotify redirect or footer options', () => {
    render(<HeroSpotifyPlayer playlistId="4kleKCOAl18opaCR30yzL9" />);

    // Ensure "Plays locally" and "Auto-syncs" footer text were removed
    expect(screen.queryByText(/Auto-syncs from Spotify/i)).toBeNull();
    expect(screen.queryByText(/Plays locally/i)).toBeNull();
    // Ensure "Open on Spotify" / ExternalLink was removed
    expect(screen.queryByTitle(/Open on Spotify/i)).toBeNull();
  });
});
