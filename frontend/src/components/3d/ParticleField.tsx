import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalPointer, damp } from './pointer';

interface ParticleFieldProps {
  count?: number;
}

// Deterministic pseudo-random generator to satisfy React 19 render purity rules
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ count = 450 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const tilt = useRef(new THREE.Vector2());
  const elapsedTime = useRef(0);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (seededRandom(i * 3 + 1) - 0.5) * 30;
      // Bias stars upward so they sit above the terrain horizon
      pos[i3 + 1] = seededRandom(i * 3 + 2) * 12 - 1;
      pos[i3 + 2] = (seededRandom(i * 3 + 3) - 0.5) * 20 - 6;
    }
    return pos;
  }, [count]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    const points = pointsRef.current;
    if (!group || !points) return;
    const dt = Math.min(delta, 0.05);
    elapsedTime.current += dt;

    // Slow constant drift on the inner points
    points.rotation.y = elapsedTime.current * 0.02;

    // Smoothed parallax tilt on the outer group, driven by the global cursor
    tilt.current.x += (globalPointer.y * 0.08 - tilt.current.x) * damp(3, dt);
    tilt.current.y += (globalPointer.x * 0.12 - tilt.current.y) * damp(3, dt);
    group.rotation.x = tilt.current.x;
    group.rotation.y = tilt.current.y;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ff1e27"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
