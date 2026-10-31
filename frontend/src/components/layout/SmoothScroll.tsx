import React, { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import { motion, useScroll, useSpring } from 'motion/react';
import { SmoothScrollContext } from '../../hooks/useSmoothScroll';
import 'lenis/dist/lenis.css';

interface SmoothScrollProps {
  children: React.ReactNode;
  /** Whether to render the customized slim crimson scroll indicator bar */
  showIndicator?: boolean;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({
  children,
  showIndicator = true,
}) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafHandleRef = useRef<number | null>(null);

  // Motion scroll progress hooks
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Instantiate Lenis smooth scrolling engine
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    // Set instance asynchronously to satisfy react-hooks/set-state-in-effect
    queueMicrotask(() => {
      setLenisInstance(lenis);
    });

    // Synchronize requestAnimationFrame loop
    const raf = (time: number) => {
      lenis.raf(time);
      rafHandleRef.current = requestAnimationFrame(raf);
    };

    rafHandleRef.current = requestAnimationFrame(raf);

    // Sync scroll events to window so external motion and window scroll listeners stay in lockstep
    lenis.on('scroll', () => {
      window.dispatchEvent(new Event('scroll'));
    });

    return () => {
      if (rafHandleRef.current !== null) {
        cancelAnimationFrame(rafHandleRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
      queueMicrotask(() => {
        setLenisInstance(null);
      });
    };
  }, []);

  const scrollTo = useCallback(
    (
      target: number | string | HTMLElement,
      options?: { offset?: number; immediate?: boolean; duration?: number }
    ) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, options);
      }
    },
    []
  );

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, scrollTo }}>
      {showIndicator && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#e50914] via-[#ff1e27] to-[#ffffff] origin-left z-50 pointer-events-none shadow-[0_0_12px_rgba(255,30,39,0.8)]"
          style={{ scaleX }}
          aria-hidden="true"
        />
      )}
      <div className="smooth-scroll-wrapper w-full min-h-screen">
        {children}
      </div>
    </SmoothScrollContext.Provider>
  );
};
