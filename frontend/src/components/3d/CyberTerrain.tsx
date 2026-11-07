import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalPointer, damp } from './pointer';

/**
 * CyberTerrain
 * GPU-driven topological wireframe terrain. Vertices are displaced by layered
 * simplex noise in the vertex shader, with a liquid ripple shockwave that follows
 * the cursor and a forward "flight" speed that accelerates with page scroll.
 */

// Ashima Arts 3D simplex noise (MIT)
const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uTravel;
uniform vec2 uMouse;         // fast-follow cursor point (lift + glow)
uniform vec2 uRippleCenter;  // slow-trailing point (ripple rings) to avoid jitter
uniform float uMouseStrength;

varying float vElevation;
varying float vMouseGlow;
varying float vFog;

${noiseGLSL}

void main() {
  vec3 pos = position;

  // Layered topological noise; uTravel scrolls the terrain toward the camera
  float n1 = snoise(vec3(pos.x * 0.12, (pos.y + uTravel) * 0.12, uTime * 0.08));
  float n2 = snoise(vec3(pos.x * 0.35, (pos.y + uTravel) * 0.35, uTime * 0.15));
  float elevation = n1 * 1.1 + n2 * 0.25;

  // Soft dome that follows the cursor closely
  float dm = distance(pos.xy, uMouse);
  float lift = exp(-dm * dm * 0.045) * 1.3;

  // Gentle concentric rings radiating from a trailing centre
  float dr = distance(pos.xy, uRippleCenter);
  float ripple = sin(dr * 1.8 - uTime * 3.0) * exp(-dr * 0.22) * 0.4;

  pos.z += elevation + (lift + ripple) * uMouseStrength;

  vElevation = elevation;
  vMouseGlow = exp(-dm * dm * 0.025) * uMouseStrength;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vFog = smoothstep(6.0, 34.0, -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uBaseColor;
uniform vec3 uCrimson;
uniform vec3 uHighlight;

varying float vElevation;
varying float vMouseGlow;
varying float vFog;

void main() {
  // Peaks glow crimson; valleys stay charcoal
  float peak = smoothstep(0.15, 1.2, vElevation);
  vec3 color = mix(uBaseColor, uCrimson, peak);

  // Hot white-crimson core near the cursor
  color = mix(color, uHighlight, vMouseGlow * 0.55);

  float alpha = mix(0.22, 0.85, max(peak, vMouseGlow));
  alpha *= 1.0 - vFog; // fade into the horizon

  gl_FragColor = vec4(color, alpha);
}
`;

interface CyberTerrainProps {
  size?: number;
  segments?: number;
}

export const CyberTerrain: React.FC<CyberTerrainProps> = ({ size = 60, segments = 120 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Stable uniforms object so re-renders never reset shader state
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTravel: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uRippleCenter: { value: new THREE.Vector2(0, 0) },
      uMouseStrength: { value: 0 },
      uBaseColor: { value: new THREE.Color('#2a2a35') },
      uCrimson: { value: new THREE.Color('#e50914') },
      uHighlight: { value: new THREE.Color('#ff6b72') },
    }),
    []
  );

  // Mutable scratch objects (refs, so they're safe to mutate in the frame loop)
  const ndc = useRef(new THREE.Vector2());
  const hitPoint = useRef(new THREE.Vector3());
  const localPoint = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector2());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 2.4));
  const travel = useRef(0);
  const elapsedTime = useRef(0);
  const lastScroll = useRef(0);
  const scrollBoost = useRef(0);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    // Clamp delta so a backgrounded tab doesn't cause a huge jump on return
    const dt = Math.min(delta, 0.05);
    elapsedTime.current += dt;
    const u = material.uniforms;
    u.uTime.value = elapsedTime.current;

    // Forward flight: constant cruise + boost from scroll velocity (Lenis drives window.scrollY)
    const scrollY = window.scrollY;
    const velocity = Math.abs(scrollY - lastScroll.current);
    lastScroll.current = scrollY;
    scrollBoost.current += (Math.min(velocity * 0.08, 6) - scrollBoost.current) * damp(5, dt);
    travel.current += dt * (0.6 + scrollBoost.current);
    u.uTravel.value = travel.current;

    // Project the global cursor onto the terrain plane, then into mesh-local XY.
    // If the ray misses (cursor above the horizon) we simply keep the last target,
    // so the effect never snaps away.
    ndc.current.set(globalPointer.x, globalPointer.y);
    state.raycaster.setFromCamera(ndc.current, state.camera);
    const hit = state.raycaster.ray.intersectPlane(groundPlane.current, hitPoint.current);
    if (hit) {
      localPoint.current.copy(hit);
      mesh.worldToLocal(localPoint.current);
      const limit = size * 0.45;
      target.current.set(
        THREE.MathUtils.clamp(localPoint.current.x, -limit, limit),
        THREE.MathUtils.clamp(localPoint.current.y, -limit, limit)
      );
    }

    // Time-based exponential smoothing: dome follows tightly, rings trail softly
    u.uMouse.value.lerp(target.current, damp(7, dt));
    u.uRippleCenter.value.lerp(u.uMouse.value, damp(2.5, dt));

    const strengthTarget = globalPointer.active ? 1 : 0;
    u.uMouseStrength.value += (strengthTarget - u.uMouseStrength.value) * damp(2, dt);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, -8]}>
      <planeGeometry args={[size, size, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        wireframe
        transparent
        depthWrite={false}
        uniforms={uniforms}
      />
    </mesh>
  );
};
