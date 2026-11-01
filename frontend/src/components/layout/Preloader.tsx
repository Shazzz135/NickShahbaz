import React, { useEffect, useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PreloaderProps {
  /** Callback fired immediately when preloader exit animation completes */
  onComplete?: () => void;
  /** Force bypass (e.g. for testing) */
  bypass?: boolean;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'last_visited_ns_portfolio';

function hasVisitedWithin24Hours(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const lastVisitStr = localStorage.getItem(STORAGE_KEY);
    if (!lastVisitStr) return false;
    const lastVisit = parseInt(lastVisitStr, 10);
    if (isNaN(lastVisit)) return false;
    return Date.now() - lastVisit < TWENTY_FOUR_HOURS_MS;
  } catch {
    return false;
  }
}

const TELEMETRY_STAGES = [
  'INITIALIZING SYSTEM CORE...',
  'COMPILING SHADER PIPELINES...',
  'GENERATING TOPOLOGICAL TERRAIN...',
  'ESTABLISHING SUPABASE LINK...',
  'CALIBRATING THREE.JS MATRIX...',
  'SYSTEM READY — UNMASKING INTERFACE',
];

export const Preloader: React.FC<PreloaderProps> = ({ onComplete, bypass = false }) => {
  const isBypassed = bypass || hasVisitedWithin24Hours();

  const [progress, setProgress] = useState(isBypassed ? 100 : 0);
  const [stageIndex, setStageIndex] = useState(0);
  const [isReadyToExit, setIsReadyToExit] = useState(isBypassed);
  const [isFinished, setIsFinished] = useState(isBypassed);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const glowFilterId = useId();

  // If already visited within 24 hours or bypassed, complete immediately
  useEffect(() => {
    if (isBypassed) {
      onComplete?.();
      return;
    }

    const targetDuration = 1200; // Fast and cinematic on initial arrival
    const intervalTime = 30;
    const incrementStep = 100 / (targetDuration / intervalTime);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const next = Math.min(100, prev + incrementStep * 1.15);
        
        // Update stage based on progress bracket
        const stage = Math.min(
          TELEMETRY_STAGES.length - 1,
          Math.floor((next / 100) * TELEMETRY_STAGES.length)
        );
        setStageIndex(stage);

        return next;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBypassed, onComplete]);

  // Handle completion side-effects outside of state updater
  useEffect(() => {
    if (progress >= 100 && !isReadyToExit && !isBypassed) {
      if (timerRef.current) clearInterval(timerRef.current);
      const exitTimer = setTimeout(() => {
        setIsReadyToExit(true);
        try {
          localStorage.setItem(STORAGE_KEY, Date.now().toString());
        } catch {
          // Ignore storage errors in private modes
        }
      }, 150);
      return () => clearTimeout(exitTimer);
    }
  }, [progress, isReadyToExit, isBypassed]);

  if (isFinished) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsFinished(true);
        onComplete?.();
      }}
    >
      {!isReadyToExit && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            opacity: 0.9,
            transition: {
              duration: 0.7,
              ease: [0.76, 0, 0.24, 1], // Custom cubic-bezier for snappy shutter open
            },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08080a] text-white overflow-hidden select-none"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        >
          {/* Architectural Background Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* Radial Crimson Background Ambient Flare */}
          <div className="absolute w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-[#e50914]/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Center Stage: Monogram & Audio-Visual Pulsing Halo */}
          <div className="relative flex flex-col items-center justify-center space-y-6 sm:space-y-8 z-10 px-4 w-full max-w-sm sm:max-w-md">
            <div className="relative flex items-center justify-center">
              {/* Radial Ripple Waves (Audio-Visual Pulse) */}
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-[#ff1e27]/30 pointer-events-none"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1.7, 1.2],
                  opacity: [0.15, 0.4, 0.15],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3,
                }}
                className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-[#e50914]/20 pointer-events-none"
              />

              {/* Geometric Branded Monogram [NS] */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0f0f13] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.35)]">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 sm:w-14 sm:h-14"
                  aria-label="Nick Shahbaz Monogram"
                >
                  <defs>
                    <linearGradient id="monogramGrad" x1="0" y1="0" x2="100" y2="100">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#ff1e27" />
                      <stop offset="100%" stopColor="#e50914" />
                    </linearGradient>
                    <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff1e27" floodOpacity="0.8" />
                    </filter>
                  </defs>
                  
                  {/* Outer Diamond / Hex Frame */}
                  <polygon
                    points="50,6 92,28 92,72 50,94 8,72 8,28"
                    stroke="url(#monogramGrad)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.8"
                  />
                  
                  {/* N Geometry */}
                  <path
                    d="M 30,68 V 32 L 50,56 V 32"
                    stroke="url(#monogramGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#${glowFilterId})`}
                  />

                  {/* S Geometry */}
                  <path
                    d="M 68,36 C 68,32 54,32 54,42 C 54,50 68,52 68,60 C 68,70 52,70 52,65"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                  />
                </svg>
              </div>
            </div>

            {/* Telemetry Stage & Live Counter */}
            <div className="w-full space-y-3 text-center">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#94949e] px-1">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff1e27] animate-ping" />
                  <span className="tracking-widest uppercase">System Loading</span>
                </span>
                <span className="text-white font-bold text-sm tracking-wider">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Progress Bar with Glowing Laser Head */}
              <div className="relative w-full h-1.5 bg-[#141419] rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#80070c] via-[#e50914] to-[#ff1e27] relative"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.1 }}
                >
                  {/* Glowing Laser Head */}
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-white shadow-[0_0_10px_#ffffff,0_0_20px_#ff1e27]" />
                </motion.div>
              </div>

              {/* Telemetry Status Message */}
              <p className="text-[10px] sm:text-xs font-mono text-[#94949e] tracking-wider uppercase h-4 truncate">
                {TELEMETRY_STAGES[stageIndex]}
              </p>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="absolute bottom-6 sm:bottom-10 z-10 flex flex-col items-center">
            <span className="text-[10px] font-mono text-[#5a5a66] tracking-widest uppercase">
              Nick Shahbaz &bull; Portfolio 2026
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
