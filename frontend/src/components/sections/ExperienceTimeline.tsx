import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  Trophy, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  ChevronDown, 
  Sparkles, 
  Layers 
} from 'lucide-react';
import { useExperiences } from '../../hooks/useExperiences';
import type { ExperienceRow } from '../../lib/mockData';
import { Badge } from '../common/Badge';
import { 
  sortMilestonesReverseChronological, 
  extractMilestoneType, 
  cleanHighlights, 
  deduplicateMilestones 
} from '../../lib/timelineUtils';

interface MilestoneTheme {
  label: string;
  badgeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderClass: string;
  glowClass: string;
  nodeBg: string;
  pillBorder: string;
  bodyIconColor: string;
  highlightLabel: string;
  techLabel: string;
}

const getCategoryTheme = (type?: string): MilestoneTheme => {
  const normalized = type || 'experience';

  switch (normalized) {
    case 'education':
      return {
        label: 'Education',
        badgeLabel: 'Degree & Academia',
        icon: GraduationCap,
        accentColor: '#3b82f6',
        borderClass: 'border-blue-500/60',
        glowClass: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
        nodeBg: 'bg-blue-600',
        pillBorder: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        bodyIconColor: 'text-blue-400',
        highlightLabel: 'Academic Focus & Coursework',
        techLabel: 'Technologies & Frameworks',
      };
    case 'certification':
      return {
        label: 'Certification',
        badgeLabel: 'Accreditation',
        icon: Award,
        accentColor: '#10b981',
        borderClass: 'border-emerald-500/60',
        glowClass: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
        nodeBg: 'bg-emerald-600',
        pillBorder: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        bodyIconColor: 'text-emerald-400',
        highlightLabel: 'Validated Skills & Domains',
        techLabel: 'Technologies & Frameworks',
      };
    case 'event':
      return {
        label: 'Event',
        badgeLabel: 'Hackathon & Sprint',
        icon: Trophy,
        accentColor: '#f59e0b',
        borderClass: 'border-amber-500/60',
        glowClass: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
        nodeBg: 'bg-amber-600',
        pillBorder: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        bodyIconColor: 'text-amber-400',
        highlightLabel: 'Accolades & Deliverables',
        techLabel: 'Technologies & Frameworks',
      };
    default:
      return {
        label: 'Experience',
        badgeLabel: 'Professional Experience',
        icon: Briefcase,
        accentColor: '#ff1e27',
        borderClass: 'border-[#e50914]/60',
        glowClass: 'shadow-[0_0_30px_rgba(229,9,20,0.2)]',
        nodeBg: 'bg-[#e50914]',
        pillBorder: 'bg-[#e50914]/10 text-[#ff1e27] border-[#e50914]/30',
        bodyIconColor: 'text-[#ff1e27]',
        highlightLabel: 'Key Deliverables & Architecture',
        techLabel: 'Technologies & Frameworks',
      };
  }
};

interface TimelineCardProps {
  item: ExperienceRow;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  item,
  index,
  isExpanded,
  onToggle,
}) => {
  const isEven = index % 2 === 0;
  const itemCategory = extractMilestoneType(item);
  const theme = getCategoryTheme(itemCategory);
  const IconComponent = theme.icon;
  const cleanedHighlights = cleanHighlights(item.highlights);

  return (
    <div
      className={`relative flex flex-col md:flex-row items-start mb-12 sm:mb-16 last:mb-0 w-full ${
        isEven ? 'md:flex-row-reverse' : ''
      }`}
    >
      {/* Node Marker on Spine */}
      <div 
        className="absolute left-4 md:left-1/2 -translate-x-1/2 top-4 z-20 flex items-center justify-center cursor-pointer"
        onClick={onToggle}
      >
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-300 shadow-lg ${
            isExpanded
              ? `${theme.nodeBg} border-white text-white ${theme.glowClass} scale-110`
              : 'bg-[#141419] border-white/20 text-[#94949e] hover:border-white/50 hover:text-white hover:scale-105'
          }`}
        >
          <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
      </div>

      {/* Content Card Side */}
      <div
        className={`w-full pl-12 md:pl-0 md:w-[calc(50%-2.5rem)] ${
          isEven ? 'md:pr-0 md:text-left' : 'md:pl-0 md:text-left'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.05 * index }}
          className={`group relative rounded-2xl bg-[#0f0f13]/90 border backdrop-blur-md p-5 sm:p-6 transition-all duration-300 shadow-lg ${
            isExpanded
              ? `${theme.borderClass} ${theme.glowClass} bg-[#121218]`
              : 'border-white/10 hover:border-white/20 hover:bg-[#141419]'
          }`}
        >
          {/* Subtle top edge accent glow */}
          <div
            className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Clickable Header for Expand/Collapse */}
          <div
            onClick={onToggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
              }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={isExpanded}
            className="cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#ff1e27] rounded-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Remove redundant red Experience badge; display category pill for other milestones */}
                  {theme.label !== 'Experience' && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border ${theme.pillBorder}`}
                    >
                      {theme.label}
                    </span>
                  )}
                  {item.is_current && (
                    <Badge variant="emerald" dot>
                      Active
                    </Badge>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-[#ff3b44] transition-colors">
                  {item.role}
                </h3>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#94949e] font-medium flex-wrap">
                  <span className="text-white/90">{item.company}</span>
                  {item.company_url && (
                    <a
                      href={item.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#94949e] hover:text-white transition-colors"
                      title="Visit link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Accordion Chevron Button (Min 44px tap area) */}
              <button
                type="button"
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  isExpanded
                    ? 'bg-white/10 border-white/20 text-white rotate-180'
                    : 'bg-[#141419] border-white/10 text-[#94949e] group-hover:text-white group-hover:border-white/20'
                }`}
                aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Meta Ribbon (Period, Location) */}
            <div className="flex items-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-white/5 text-xs font-mono text-[#94949e] flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#ff1e27]/80" />
                {item.period}
              </span>
              {item.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#94949e]" />
                  {item.location}
                </span>
              )}
            </div>
          </div>

          {/* Quick Preview Chips (Visible when collapsed) */}
          {!isExpanded && item.tech_stack && item.tech_stack.length > 0 && (
            <div className="mt-3.5 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#94949e] flex items-center gap-1.5">
                <Layers className={`w-3 h-3 ${theme.bodyIconColor}`} />
                <span>Technologies & Frameworks</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.tech_stack.slice(0, 5).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-[#16161e] text-[#94949e] border border-white/5"
                  >
                    {tech}
                  </span>
                ))}
                {item.tech_stack.length > 5 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 text-[#94949e]">
                    +{item.tech_stack.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Expandable Body */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                  {/* Highlights / Responsibilities / Accolades */}
                  {cleanedHighlights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#94949e] flex items-center gap-1.5">
                        <Sparkles className={`w-3.5 h-3.5 ${theme.bodyIconColor}`} />
                        <span>{theme.highlightLabel}</span>
                      </h4>
                      <ul className="space-y-2">
                        {cleanedHighlights.map((highlight, hIdx) => (
                          <li
                            key={hIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-[#c4c4cc] leading-relaxed"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.nodeBg} mt-2 shrink-0`} />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technologies & Frameworks Full Stack */}
                  {item.tech_stack && item.tech_stack.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#94949e] flex items-center gap-1.5">
                        <Layers className={`w-3.5 h-3.5 ${theme.bodyIconColor}`} />
                        <span>Technologies & Frameworks</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tech_stack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-[#1a1a24] text-white/90 border border-white/10 hover:border-[#ff1e27]/50 hover:text-white transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export const ExperienceTimeline: React.FC = () => {
  const { experiences, loading } = useExperiences();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLElement>(null);

  // Scroll tracking for glowing spine progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const sortedExperiences = useMemo(() => {
    const deduplicated = deduplicateMilestones(experiences);
    return sortMilestonesReverseChronological(deduplicated);
  }, [experiences]);

  const hasUserToggled = Object.keys(expandedIds).length > 0;

  const isCardExpanded = (id: string, idx: number): boolean => {
    if (expandedIds[id] !== undefined) {
      return expandedIds[id];
    }
    // By default, before user interaction, expand the first card for immediate impact
    return !hasUserToggled && idx === 0;
  };

  const toggleExpand = (id: string, idx: number) => {
    setExpandedIds((prev) => {
      const current = prev[id] !== undefined ? prev[id] : (!hasUserToggled && idx === 0);
      return {
        ...prev,
        [id]: !current,
      };
    });
  };

  const allIds = sortedExperiences.map((e) => e.id);
  const isAllExpanded = allIds.length > 0 && allIds.every((id, idx) => isCardExpanded(id, idx));

  const handleToggleAll = () => {
    if (isAllExpanded) {
      const next: Record<string, boolean> = {};
      allIds.forEach((id) => {
        next[id] = false;
      });
      setExpandedIds(next);
    } else {
      const next: Record<string, boolean> = {};
      allIds.forEach((id) => {
        next[id] = true;
      });
      setExpandedIds(next);
    }
  };

  return (
    <section
      ref={containerRef}
      id="experience"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e50914]/5 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white"
        >
          Engineering Journey & <br />
          <span className="bg-gradient-to-r from-[#ff1e27] via-[#ff6b72] to-white bg-clip-text text-transparent">
            Interactive Milestones
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-[#94949e] leading-relaxed max-w-2xl mx-auto"
        >
          A unified journey tracing professional engineering leadership, competitive hackathons, industry accreditations, and academic foundations.
        </motion.p>

        {/* Global Expand/Collapse Controller */}
        {sortedExperiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-2 flex justify-center"
          >
            <button
              onClick={handleToggleAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141419] hover:bg-[#1a1a24] text-xs font-mono text-[#94949e] hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <span>{isAllExpanded ? 'Collapse All Cards' : 'Expand All Deliverables'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isAllExpanded ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#94949e]">Syncing timeline milestones from database...</p>
        </div>
      ) : sortedExperiences.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0f0f13] border border-white/10 text-center space-y-2 max-w-md mx-auto">
          <p className="text-sm text-white font-medium">No milestones found.</p>
          <p className="text-xs text-[#94949e]">Add entries in the Admin Dashboard to populate the timeline.</p>
        </div>
      ) : (
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Spine Base Guide */}
          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#e50914]/40 via-white/10 to-blue-500/40" />

          {/* Active Glowing Scroll Spine */}
          <motion.div
            style={{ scaleY, originY: 0 }}
            className="absolute left-4 md:left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#ff1e27] via-amber-500 to-blue-500 shadow-[0_0_12px_rgba(255,30,39,0.8)] z-10"
          />

          {/* Unified Continuous Timeline */}
          <div className="relative">
            {sortedExperiences.map((item, idx) => (
              <TimelineCard
                key={item.id}
                item={item}
                index={idx}
                isExpanded={isCardExpanded(item.id, idx)}
                onToggle={() => toggleExpand(item.id, idx)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
