import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, ChevronDown, ChevronUp, X, Minimize2, Radio } from 'lucide-react';

interface HeroSpotifyPlayerProps {
  playlistId?: string;
  className?: string;
}

export const HeroSpotifyPlayer: React.FC<HeroSpotifyPlayerProps> = ({
  playlistId = '4kleKCOAl18opaCR30yzL9',
  className = '',
}) => {
  // Mobile starts minimized as a popup button; Desktop starts open as a small static card
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  // Tracklist expansion (152px compact vs 352px full tracklist)
  const [isExpanded, setIsExpanded] = useState(false);
  // Loading skeleton with timeout safeguard
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Failsafe: ensure loading skeleton clears even if third-party privacy partitions block onLoad
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  return (
    <aside
      aria-label="Spotify Music Player"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] pointer-events-auto select-none ${className}`}
    >
      {/* ======================================================== */}
      {/* 1. MINIMIZED FLOATING DOCK PILL (DESKTOP & MOBILE)       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {/* Desktop Dynamic Island Pill */}
            <button
              onClick={() => setIsMinimized(false)}
              className="hidden sm:inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#09090d]/95 hover:bg-[#121218] border border-white/10 hover:border-[#1DB954]/50 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(29,185,84,0.18)] text-xs font-mono text-white transition-all duration-300 cursor-pointer group"
              aria-label="Open curated Spotify playlist"
            >
              <span className="p-1.5 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] flex items-center justify-center">
                <Music className="w-3.5 h-3.5" />
              </span>

              {/* Animated Equalizer Wave */}
              <span className="flex items-end gap-0.5 h-3.5 w-3 text-[#1DB954]">
                <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-[pulse_0.9s_ease-in-out_infinite]" />
                <span className="w-0.5 h-3.5 bg-[#1DB954] rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.15s]" />
                <span className="w-0.5 h-2.5 bg-[#1DB954] rounded-full animate-[pulse_1.1s_ease-in-out_infinite_0.3s]" />
              </span>

              <span className="text-[#a0a0ae] group-hover:text-white transition-colors flex items-center gap-1.5">
                <span>Soundtrack:</span>
                <span className="text-white font-medium">WebPlaylist</span>
              </span>

              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 font-semibold tracking-wider uppercase">
                Open
              </span>
            </button>

            {/* Mobile Pop-up Floating Action Button */}
            <button
              onClick={() => setIsMinimized(false)}
              className="flex sm:hidden items-center gap-2.5 px-4 py-3 rounded-full bg-[#09090d]/95 border border-[#1DB954]/40 text-white shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(29,185,84,0.2)] text-xs font-mono cursor-pointer active:scale-95 transition-transform"
              aria-label="Open Spotify Playlist Popup"
            >
              <span className="p-1 rounded-full bg-[#1DB954]/20 text-[#1DB954]">
                <Music className="w-4 h-4" />
              </span>
              <span className="flex items-end gap-0.5 h-3 w-2.5 text-[#1DB954]">
                <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                <span className="w-0.5 h-3.5 bg-[#1DB954] rounded-full animate-pulse" />
                <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-pulse" />
              </span>
              <span className="text-[12px] font-medium pr-1">Soundtrack</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 2. PERSISTENT SPOTIFY PLAYER CARD                        */}
      {/* CRITICAL: Stays mounted in DOM when minimized so audio   */}
      {/* continues playing uninterrupted in the background!       */}
      {/* ======================================================== */}
      <div
        className={`transition-all duration-300 transform origin-bottom-right ${
          isMinimized
            ? 'opacity-0 scale-90 pointer-events-none -translate-y-4 absolute bottom-0 right-0 z-[-1]'
            : 'opacity-100 scale-100 pointer-events-auto relative z-[9999]'
        }`}
      >
        <div className="w-[calc(100vw-2rem)] sm:w-[320px] max-w-sm rounded-2xl bg-[#09090d]/98 backdrop-blur-2xl border border-white/10 hover:border-[#1DB954]/40 shadow-[0_0_50px_rgba(29,185,84,0.12),0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden transition-colors duration-500">
          {/* Futuristic Cyber Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.02] border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] flex items-center justify-center">
                <Music className="w-3.5 h-3.5" />
              </span>

              <div className="flex flex-col">
                <span className="text-[9px] font-mono tracking-widest text-[#1DB954] uppercase font-semibold leading-none flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-[#1DB954]" />
                  <span>Curated Music</span>
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-wide pt-0.5 leading-none">
                  WebPlaylist
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand / Compact Tracklist Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Compact mode' : 'Expand playlist tracks'}
                className="p-1.5 rounded-lg text-[#94949e] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={isExpanded ? 'Collapse tracklist' : 'Expand tracklist'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Minimize Player Button (Audio stays playing) */}
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize player (audio keeps playing)"
                className="p-1.5 rounded-lg text-[#94949e] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Minimize player"
              >
                <Minimize2 className="w-3.5 h-3.5 hidden sm:block" />
                <X className="w-3.5 h-3.5 block sm:hidden" />
              </button>
            </div>
          </div>

          {/* Player Body Container */}
          <div
            className="relative w-full bg-[#09090d] transition-all duration-300 overflow-hidden"
            style={{ height: isExpanded ? '352px' : '152px' }}
          >
            {/* Ambient Loading Skeleton */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#09090d] text-[#94949e] text-xs font-mono z-10">
                <div className="w-5 h-5 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                <span>Connecting Spotify...</span>
              </div>
            )}

            {/* Native Spotify Embed IFrame without inner rounded gray edges */}
            <iframe
              title="Curated Spotify Playlist Player"
              src={embedUrl}
              width="100%"
              height={isExpanded ? '352' : '152'}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
              onLoad={() => setIsLoading(false)}
              className="w-full h-full block border-0 rounded-none transform scale-[1.03] origin-top"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
