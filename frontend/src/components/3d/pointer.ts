/**
 * Global pointer tracker for WebGL layers.
 *
 * The background canvas uses `pointer-events-none` so the DOM above it stays
 * interactive, which means R3F's built-in pointer never receives events.
 * This module listens on `window` instead and exposes normalized device
 * coordinates (-1..1) that any useFrame loop can read without re-renders.
 */
export const globalPointer = {
  x: 0,
  y: 0,
  active: false,
};

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      globalPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      globalPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      globalPointer.active = true;
    },
    { passive: true }
  );

  document.documentElement.addEventListener('pointerleave', () => {
    globalPointer.active = false;
  });
}

/** Frame-rate independent smoothing factor for exponential damping. */
export function damp(lambda: number, delta: number) {
  return 1 - Math.exp(-lambda * delta);
}
