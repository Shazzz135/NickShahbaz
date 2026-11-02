import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Code2, Cpu, Database, Globe, Layers, Sparkles } from 'lucide-react';

interface TechChip {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  accent: string;
}

const TECH_STACK: TechChip[] = [
  { id: 'react', name: 'React & Node.js', role: 'Full-Stack UI', icon: <Layers className="w-4 h-4" />, accent: '#ff1e27' },
  { id: 'ts', name: 'TypeScript', role: 'Strict Type-Safety', icon: <Code2 className="w-4 h-4" />, accent: '#ffffff' },
  { id: 'three', name: 'Three.js / WebGL', role: '3D GPU Shaders', icon: <Sparkles className="w-4 h-4" />, accent: '#e50914' },
  { id: 'docker', name: 'Docker & Cloud', role: 'Isolated Containers', icon: <Cpu className="w-4 h-4" />, accent: '#ff4d55' },
  { id: 'supabase', name: 'PostgreSQL & Supabase', role: 'Relational & RLS', icon: <Database className="w-4 h-4" />, accent: '#3ecf8e' },
  { id: 'edge', name: 'Edge Networking', role: 'Sub-50ms Latency', icon: <Globe className="w-4 h-4" />, accent: '#94949e' },
];

export const FloatingTechChips: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // Mouse physics coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for cursor parallax
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 25);
    mouseY.set(y * 25);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Parallax offsets for chips based on their index
  const chipParallax1 = useTransform(springX, (val) => val * 0.8);
  const chipParallax2 = useTransform(springY, (val) => val * -0.6);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full relative py-6"
    >
      {/* Ambient background glow ring */}
      <div className="absolute inset-0 bg-radial from-[#e50914]/10 via-transparent to-transparent blur-2xl pointer-events-none" />

      {/* Grid of Interactive 3D Physics Chips */}
      <motion.div
        style={{ x: chipParallax1, y: chipParallax2 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 relative z-10"
      >
        {TECH_STACK.map((chip, idx) => {
          const isHovered = activeChip === chip.id;
          return (
            <motion.div
              key={chip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setActiveChip(chip.id)}
              onHoverEnd={() => setActiveChip(null)}
              className="relative p-3.5 sm:p-4 rounded-xl bg-[#0f0f13]/90 hover:bg-[#141419] border border-white/10 hover:border-[#ff1e27]/50 shadow-lg hover:shadow-[0_0_20px_rgba(229,9,20,0.25)] transition-all cursor-pointer backdrop-blur-md group flex flex-col justify-between"
            >
              {/* Subtle top indicator beam */}
              <div
                className="absolute top-0 left-3 right-3 h-[2px] rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: chip.accent }}
              />

              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[#e50914]/15 transition-colors"
                  style={{ color: chip.accent }}
                >
                  {chip.icon}
                </span>
                <span className="text-[10px] font-mono text-[#94949e] group-hover:text-white transition-colors">
                  0{idx + 1}
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-white tracking-tight group-hover:text-white">
                  {chip.name}
                </p>
                <p className="text-[11px] font-mono text-[#94949e] group-hover:text-[#ff4d55] transition-colors truncate">
                  {chip.role}
                </p>
              </div>

              {/* Status pulse when hovered */}
              {isHovered && (
                <motion.div
                  layoutId="chipGlow"
                  className="absolute inset-0 rounded-xl border border-[#ff1e27]/60 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
