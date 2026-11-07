import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../common/Button';
import { Magnetic } from '../common/Magnetic';
import { FloatingTechChips } from './FloatingTechChips';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { useSiteMeta } from '../../hooks/useSiteMeta';
import { useAuth } from '../../hooks/useAuth';
import { DEFAULT_HERO_META, type HeroMetaConfig } from '../../types/siteMeta';
import { 
  ArrowRight, 
  Sparkles, 
  Lock, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Box 
} from 'lucide-react';

interface HeroSectionProps {
  isSceneReady?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const { scrollTo } = useSmoothScroll();
  const { data: rawHeroData } = useSiteMeta('hero', DEFAULT_HERO_META);
  const hero = { ...DEFAULT_HERO_META, ...rawHeroData } as HeroMetaConfig;
  const { isAdmin } = useAuth();

  const handleScrollToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    const projectsElem = document.getElementById('projects');
    if (projectsElem) {
      scrollTo(projectsElem);
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  const handleScrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      scrollTo(contactElem);
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-16 pb-16 max-w-7xl mx-auto">
      {/* Top Status & Telemetry Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center justify-between gap-3 flex-wrap pb-6 sm:pb-8 border-b border-white/10"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            {hero.isAvailable ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
            <span>{hero.statusText}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#94949e]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#ff1e27]" />
            <span>{hero.location}</span>
          </span>
          <span className="hidden sm:inline-block text-white/20">&bull;</span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Systems Normal</span>
          </span>
        </div>
      </motion.div>

      {/* Main Hero Content */}
      <div className="py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="space-y-4 max-w-4xl">
          {/* High-Impact Typography with Crimson Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
          >
            {hero.headlinePrefix}{' '}
            <span className="bg-gradient-to-r from-white via-[#ff6b72] to-[#e50914] bg-clip-text text-transparent">
              {hero.headlineGradient}
            </span>
          </motion.h1>

          {/* Value Proposition Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-[#94949e] text-base sm:text-xl leading-relaxed max-w-3xl"
          >
            {hero.description}
          </motion.p>
        </div>

        {/* Magnetic CTA Action Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-2 w-full sm:w-auto"
        >
          <Magnetic strength={0.25}>
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleScrollToProjects}
              className="w-full sm:w-auto"
            >
              Explore Engineering Work
            </Button>
          </Magnetic>

          <Magnetic strength={0.25}>
            <Button
              variant="secondary"
              size="lg"
              icon={<Sparkles className="w-4 h-4 text-[#ff1e27]" />}
              onClick={handleScrollToContact}
              className="w-full sm:w-auto"
            >
              Initiate Collaboration
            </Button>
          </Magnetic>

          {isAdmin && (
            <Magnetic strength={0.15}>
            <a
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-mono text-[#94949e] hover:text-white bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </a>
          </Magnetic>
          )}
        </motion.div>

        {/* Interactive 3D Foreground Elements (Physics Tech Chips) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-2 sm:pt-4"
        >
          <div className="flex items-center justify-between pb-2 text-xs font-mono text-[#94949e]">
            <span className="uppercase tracking-widest text-[10px] text-[#ff4d55]">Core Engineering Ecosystem</span>
          </div>
          <FloatingTechChips />
        </motion.div>
      </div>

      {/* Metrics & Performance Ribbon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-3.5 rounded-xl bg-[#0d0d10]/80 border border-white/5 flex items-start gap-3">
          <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] shrink-0">
            <Box className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{hero.metricYears}</p>
            <p className="text-xs text-[#94949e]">Full-Stack Engineering</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d0d10]/80 border border-white/5 flex items-start gap-3">
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{hero.metricUptime}</p>
            <p className="text-xs text-[#94949e]">Production Reliability</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d0d10]/80 border border-white/5 flex items-start gap-3">
          <span className="p-2 rounded-lg bg-[#ff4d55]/10 text-[#ff4d55] shrink-0">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{hero.metricLatency}</p>
            <p className="text-xs text-[#94949e]">Global Edge Routing</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d0d10]/80 border border-white/5 flex items-start gap-3">
          <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] shrink-0">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{hero.metricWebgl}</p>
            <p className="text-xs text-[#94949e]">WebGL Acceleration</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
