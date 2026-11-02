import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Layers, 
  Terminal 
} from 'lucide-react';
import { useAboutMeta } from '../../hooks/useAboutMeta';
import type { SkillCategory, SkillItem } from '../../types/siteMeta';

const SKILL_CATEGORIES: (SkillCategory | 'All')[] = [
  'All',
  'Languages',
  'Frontend & 3D',
  'Backend & Cloud',
  'Systems & DevOps',
];

export const AboutSection: React.FC = () => {
  const { aboutMeta, loading } = useAboutMeta();
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'All'>('All');

  const filteredSkills = aboutMeta.skills.filter((s: SkillItem) => {
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  return (
    <section
      id="about"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute top-1/3 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#e50914]/5 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight"
        >
          {aboutMeta.headlinePrefix || 'Here are some things you want to know'}{' '}
          <span className="bg-gradient-to-r from-[#ff1e27] via-[#ff6b72] to-white bg-clip-text text-transparent">
            {aboutMeta.headlineGradient || 'about me.'}
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-[#94949e] leading-relaxed max-w-2xl mx-auto"
        >
          Bridging high-throughput backend architecture with GPU-accelerated interactive 3D client experiences.
        </motion.p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#94949e]">Syncing engineering profile from database...</p>
        </div>
      ) : (
        <div className="space-y-16 sm:space-y-24">
          {/* =============================================================== */}
          {/* SUBTASK 14.3: QUICK STATS COUNTER RIBBON */}
          {/* =============================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {aboutMeta.stats.map((stat, idx) => (
              <motion.div
                key={stat.label || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * idx }}
                className="relative rounded-2xl bg-[#0f0f13]/90 border border-white/10 p-5 sm:p-6 backdrop-blur-md overflow-hidden group hover:border-[#ff1e27]/40 transition-colors shadow-lg"
              >
                {/* Top ambient highlight */}
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#ff1e27]/40 to-transparent" />

                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight bg-gradient-to-r from-white via-white to-[#ff6b72] bg-clip-text text-transparent group-hover:from-white group-hover:to-[#ff1e27] transition-all">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {stat.label}
                  </div>
                  <div className="text-[11px] font-mono text-[#94949e]">
                    {stat.subtext}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* =============================================================== */}
          {/* SUBTASK 14.1: PERSONAL NARRATIVE & ENGINEERING PHILOSOPHY */}
          {/* =============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Identity & Bio (5 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 space-y-6"
            >
              {/* Profile Card */}
              <div className="rounded-2xl bg-[#0f0f13]/90 border border-white/10 p-6 backdrop-blur-md space-y-5 shadow-lg">
                <div className="flex items-center gap-4">
                  {/* Avatar / Monogram */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-white/10 bg-[#141419] flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
                    {aboutMeta.avatarUrl ? (
                      <img
                        src={aboutMeta.avatarUrl}
                        alt="Nick Shahbaz"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1c24] to-[#0f0f13]">
                        <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-wider">
                          N<span className="text-[#ff1e27]">S</span>
                        </span>
                        <div className="absolute inset-0 bg-[#e50914]/10 rounded-2xl animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                        Nick Shahbaz
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#94949e]">
                      <MapPin className="w-3.5 h-3.5 text-[#ff1e27] shrink-0" />
                      <span className="truncate">{aboutMeta.location}</span>
                    </div>
                  </div>
                </div>

                {/* Bio Paragraphs */}
                <div className="space-y-3.5 pt-2 border-t border-white/5 text-sm text-[#b0b0b8] leading-relaxed">
                  {aboutMeta.bioParagraphs.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Availability Callout Card */}
                {aboutMeta.availabilityNote && (
                  <div className="p-3.5 rounded-xl bg-[#141419] border border-white/10 flex items-start gap-3">
                    <Terminal className="w-4 h-4 text-[#ff1e27] mt-0.5 shrink-0" />
                    <div className="text-xs font-mono text-[#c4c4cc] leading-relaxed">
                      {aboutMeta.availabilityNote}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column: Engineering Philosophy Principles (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7 space-y-4"
            >
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#94949e] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ff1e27]" />
                  <span>Engineering Philosophy & Core Principles</span>
                </h3>
                <span className="text-[10px] font-mono text-[#5a5a66]">4 Tenets</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aboutMeta.principles.map((principle, idx) => (
                  <div
                    key={principle.id || idx}
                    className="relative rounded-2xl bg-[#0f0f13]/90 border border-white/10 p-5 backdrop-blur-md space-y-3 hover:border-[#ff1e27]/40 transition-all duration-300 shadow-md group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#e50914]/15 border border-[#e50914]/30 text-[#ff1e27] text-xs font-mono font-bold flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-white/90">
                        {principle.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-[#ff3b44] transition-colors tracking-tight">
                      {principle.title}
                    </h4>

                    <p className="text-xs text-[#94949e] leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* =============================================================== */}
          {/* SUBTASK 14.2: INTERACTIVE SKILLS MATRIX */}
          {/* =============================================================== */}
          <div className="space-y-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#ff1e27]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Technical Arsenal & Tooling</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Categorized Skills Matrix
                </h3>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
                {SKILL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-label={`Filter skills by ${cat}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#e50914] text-white font-semibold'
                        : 'bg-white/5 text-[#94949e] hover:text-white border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <AnimatePresence mode="popLayout">
                {filteredSkills.map((skill: SkillItem, idx: number) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: 0.02 * idx }}
                    className="relative rounded-xl bg-[#0f0f13]/90 border border-white/10 p-4 backdrop-blur-md space-y-2.5 hover:border-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {skill.featured && (
                          <span title="Featured Core Competency" className="inline-flex shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#ff3b44] transition-colors">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#94949e] shrink-0">
                        {skill.years}
                      </span>
                    </div>

                    {/* Proficiency Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#94949e]">
                        <span>{skill.category}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.03 * idx, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-[#e50914] via-[#ff1e27] to-[#ff6b72]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
