import React, { Suspense, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import { CyberTerrain } from './CyberTerrain';
import { ParticleField } from './ParticleField';

// Cleanly suppress Three.js r187 THREE.Clock deprecation warning triggered by @react-three/fiber internals
if (typeof console !== 'undefined' && console.warn) {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export interface CanvasBackgroundProps {
  showTerrain?: boolean;
  showStars?: boolean;
}

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

// Low-power detection: small screens or <= 4 logical cores
function getSnapshot() {
  if (typeof window === 'undefined') return false;
  const isMobile = window.innerWidth < 768;
  const isLowConcurrency =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  return isMobile || isLowConcurrency;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  showTerrain = true,
  showStars = true,
}) => {
  const isLowPower = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.6, 7], fov: 60 }}
        dpr={isLowPower ? [1, 1.25] : [1, 2]}
        gl={{
          antialias: !isLowPower,
          powerPreference: 'high-performance',
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          {showTerrain && (
            <CyberTerrain segments={isLowPower ? 70 : 120} />
          )}
          {showStars && <ParticleField count={isLowPower ? 120 : 260} />}
        </Suspense>
      </Canvas>

      {/* Vignette keeps foreground text readable over the terrain */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(8,8,10,0.85)_100%)]" />
    </div>
  );
};
