import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProjects } from '../../hooks/useProjects';
import type { ProjectRow } from '../../lib/mockData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { ProjectDetailModal } from './ProjectDetailModal';
import { AdaptiveProjectImage } from '../common/AdaptiveProjectImage';
import { 
  Layers, 
  ExternalLink, 
  Code, 
  Sparkles, 
  ArrowUpRight, 
  Maximize2,
  Monitor,
  Smartphone,
  Wifi,
  BatteryMedium
} from 'lucide-react';

const BASE_CATEGORIES = [
  'All',
  'Full-Stack',
  'Mobile',
  'AI/Cloud',
  'Tools/Web3',
];

function getInitialScale(project: ProjectRow): 'mobile' | 'desktop' {
  const metricScale = (project.metrics as Record<string, unknown> | null)?.scale_type;
  if (metricScale === 'mobile' || metricScale === 'desktop') return metricScale;
  const cat = (project.category || '').toLowerCase();
  if (cat.includes('mobile') || cat.includes('ios') || cat.includes('android')) return 'mobile';
  const tags = (project.tags || []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes('swift') || t.includes('react native') || t.includes('flutter') || t.includes('ios') || t.includes('android'))) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Arranges projects so naturally mobile projects land in mobile slots and
 * naturally desktop projects land in window slots whenever possible.
 */
function orderProjectsForAlternatingDisplay(
  list: ProjectRow[],
  scales: Record<string, 'mobile' | 'desktop'>
): ProjectRow[] {
  if (list.length <= 1) return list;

  const isMobileProj = (p: ProjectRow) => (scales[p.id] || getInitialScale(p)) === 'mobile';

  const mobiles = list.filter(isMobileProj);
  const desktops = list.filter((p) => !isMobileProj(p));

  // If there are no mobiles or no desktops in this view (e.g. filtered to a specific category),
  // return the list as-is so the alternating visual frames still apply
  if (mobiles.length === 0 || desktops.length === 0) {
    return list;
  }

  const mQueue = [...mobiles];
  const dQueue = [...desktops];
  const ordered: ProjectRow[] = [];

  for (let idx = 0; idx < list.length; idx++) {
    const rowIndex = Math.floor(idx / 2);
    const isEvenRow = rowIndex % 2 === 0;
    // Row 0, 2, 4... (even): 1st is Mobile, 2nd is Window ("mobile window")
    // Row 1, 3, 5... (odd):  1st is Window, 2nd is Mobile ("window mobile")
    const wantsMobile = isEvenRow ? (idx % 2 === 0) : (idx % 2 === 1);

    if (wantsMobile) {
      if (mQueue.length > 0) {
        ordered.push(mQueue.shift()!);
      } else {
        ordered.push(dQueue.shift()!);
      }
    } else {
      if (dQueue.length > 0) {
        ordered.push(dQueue.shift()!);
      } else {
        ordered.push(mQueue.shift()!);
      }
    }
  }

  return ordered;
}

/**
 * Calculates card display mode ('mobile' or 'window') and column spans per row.
 * Alternates rows:
 * - Even rows (0, 2, 4...): Mobile (4 cols) then Window (8 cols) -> "mobile window"
 * - Odd rows (1, 3, 5...):  Window (8 cols) then Mobile (4 cols) -> "window mobile"
 */
function getCardLayout(
  index: number,
  total: number,
  isNaturallyMobile = false
): {
  displayMode: 'mobile' | 'window';
  spanClass: string;
  isWide: boolean;
  isSolo: boolean;
} {
  // If single project in category:
  // If mobile, keep authentic mobile phone size (does not fill); if window, showcase width
  if (total === 1) {
    if (isNaturallyMobile) {
      return {
        displayMode: 'mobile',
        spanClass: 'col-span-1 md:col-span-5 lg:col-span-4',
        isWide: false,
        isSolo: false,
      };
    }
    return {
      displayMode: 'window',
      spanClass: 'col-span-1 md:col-span-12 lg:col-span-12',
      isWide: true,
      isSolo: true,
    };
  }

  const rowIndex = Math.floor(index / 2);
  const isEvenRow = rowIndex % 2 === 0;
  const isFirstInRow = index % 2 === 0;

  // Even row: 1st is Mobile, 2nd is Window ("mobile window")
  // Odd row:  1st is Window, 2nd is Mobile ("window mobile")
  const isMobile = isEvenRow ? isFirstInRow : !isFirstInRow;
  const displayMode: 'mobile' | 'window' = isMobile ? 'mobile' : 'window';

  // Mobile project: ALWAYS stays compact mobile size (does not fill to 12 cols even if on its own row)
  if (displayMode === 'mobile') {
    return {
      displayMode: 'mobile',
      spanClass: 'col-span-1 md:col-span-5 lg:col-span-4',
      isWide: false,
      isSolo: false,
    };
  }

  // Window displayed project stays 8 cols (7 on md)
  return {
    displayMode: 'window',
    spanClass: 'col-span-1 md:col-span-7 lg:col-span-8',
    isWide: true,
    isSolo: false,
  };
}

export const ProjectGallery: React.FC = () => {
  const { projects, loading } = useProjects();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<ProjectRow | null>(null);
  const [detectedScales, setDetectedScales] = useState<Record<string, 'mobile' | 'desktop'>>({});

  // Dynamic category tabs: always includes 'All' and baseline tabs, plus any active custom categories from projects
  const categoryTabs = useMemo(() => {
    const customCats = projects
      .map((p) => p.category)
      .filter((c): c is string => Boolean(c) && !BASE_CATEGORIES.includes(c));
    return Array.from(new Set([...BASE_CATEGORIES, ...customCats]));
  }, [projects]);

  // Filter projects by category, sort featured first, and alternate pairing
  const filteredProjects = useMemo(() => {
    const list = selectedCategory === 'All'
      ? projects
      : projects.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

    const sorted = [...list].sort((a, b) => {
      // Featured / starred projects display first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    return orderProjectsForAlternatingDisplay(sorted, detectedScales);
  }, [projects, selectedCategory, detectedScales]);

  const handleScaleDetected = (projectId: string, scale: 'mobile' | 'desktop') => {
    setDetectedScales((prev) => {
      if (prev[projectId] === scale) return prev;
      return { ...prev, [projectId]: scale };
    });
  };

  return (
    <section id="projects" className="relative z-10 py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/10">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            My Best Working Projects and{' '}
            <span className="bg-gradient-to-r from-white via-[#ff6b72] to-[#e50914] bg-clip-text text-transparent">
              Learning Process
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#94949e] leading-relaxed">
            A curated showcase of scalable web platforms, distributed cloud microservices, 
            interactive WebGL 3D systems, and native mobile applications.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((cat) => {
            const count = cat === 'All' ? projects.length : projects.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#e50914] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]'
                    : 'bg-[#141419] text-[#94949e] hover:text-white border border-white/5'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-[#6c6c78]'}`}>
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Projects Grid: Alternating Mobile / Window Rows */}
      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-[#94949e] space-y-3">
          <div className="w-6 h-6 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Syncing application portfolio from Supabase...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0f0f13] border border-white/5 space-y-3">
          <Layers className="w-8 h-8 text-[#5a5a66] mx-auto" />
          <p className="text-white font-medium text-sm">No applications found in this category.</p>
          <p className="text-xs text-[#94949e]">Select another filter or check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 pt-12 items-stretch">
          <AnimatePresence>
            {filteredProjects.map((project, idx) => {
              const isNaturallyMobile = (detectedScales[project.id] || getInitialScale(project)) === 'mobile';
              const { displayMode, spanClass, isWide, isSolo } = getCardLayout(
                idx,
                filteredProjects.length,
                isNaturallyMobile
              );

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className={`${spanClass} flex flex-col h-auto md:h-full`}
                >
                  <Card className="flex flex-col justify-between group overflow-hidden bg-[#0c0c0f] border-white/10 hover:border-[#e50914]/50 p-4 sm:p-5 md:p-6 transition-all duration-300 h-auto md:h-full w-full">
                    {/* Solo 12-col showcase: dual-pane widescreen presentation */}
                    {isSolo ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 h-auto md:h-full">
                        <div className="lg:col-span-7 w-full rounded-xl overflow-hidden border border-white/10 bg-[#121217] shadow-lg group/img flex flex-col md:h-[380px] lg:h-[420px]">
                          {/* Desktop Window Title Bar */}
                          <div className="flex items-center justify-between px-3.5 py-2 bg-[#121217] border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 border border-purple-500/30 text-purple-300 backdrop-blur-sm shrink-0">
                              <Monitor className="w-3 h-3" />
                              <span className="hidden sm:inline">Windows View</span>
                            </span>
                          </div>

                          <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-auto md:flex-1 w-full overflow-hidden bg-[#0c0c0f]">
                            <AdaptiveProjectImage
                              src={project.thumbnail_url}
                              alt={project.title}
                              minRatio={1.0}
                              onScaleDetected={(s) => handleScaleDetected(project.id, s)}
                              onClick={() => setActiveModalProject(project)}
                              className="cursor-pointer w-full h-full"
                              imgClassName="transition-transform duration-500 group-hover/img:scale-105"
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-60" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <span className="p-2.5 rounded-full bg-[#e50914] text-white shadow-lg">
                                  <Maximize2 className="w-4 h-4" />
                                </span>
                                <span className="text-xs font-mono font-medium text-white">View Deep Dive</span>
                              </div>
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                                <Badge variant="subtle">{project.category}</Badge>
                                {project.featured && <Badge variant="crimson" dot>Featured</Badge>}
                              </div>
                            </AdaptiveProjectImage>
                          </div>
                        </div>

                        {/* Project Details */}
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 h-auto md:h-full">
                          <div className="space-y-2">
                            <h3
                              onClick={() => setActiveModalProject(project)}
                              className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#ff4d55] transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{project.title}</span>
                              <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>

                            {project.subtitle && (
                              <p className="text-sm font-mono text-[#ff4d55]">
                                {project.subtitle}
                              </p>
                            )}

                            <p className="text-sm text-[#c2c2cf] leading-relaxed pt-1">
                              {project.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#181822] text-[#b4b4c0] border border-white/5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3 mt-auto">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setActiveModalProject(project)}
                              icon={<Sparkles className="w-3.5 h-3.5" />}
                            >
                              Deep Dive
                            </Button>

                            <div className="flex items-center gap-2">
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 rounded-lg bg-[#141419] hover:bg-[#1a1a22] text-[#94949e] hover:text-white border border-white/5 transition-colors"
                                  title="Inspect Code"
                                >
                                  <Code className="w-4 h-4" />
                                </a>
                              )}
                              {project.live_url && (
                                <a
                                  href={project.live_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 rounded-lg bg-[#141419] hover:bg-[#1a1a22] text-[#94949e] hover:text-white border border-white/5 transition-colors"
                                  title="Launch Live Application"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Multi-project layout: Mobile or Window device display
                      <div className="flex flex-col justify-between h-auto md:h-full space-y-4">
                        <div className="space-y-4 flex-1 flex flex-col">
                          {displayMode === 'mobile' ? (
                            /* ===== MOBILE DISPLAYED PROJECT (Smartphone Bezel Frame) ===== */
                            <div className="w-full rounded-2xl border border-white/10 bg-[#121217] p-2.5 sm:p-3 shadow-lg group/img flex flex-col items-center justify-between md:h-[400px] lg:h-[420px]">
                              {/* Phone Chassis */}
                              <div className="relative h-[270px] sm:h-[310px] md:h-[330px] lg:h-[350px] aspect-[9/17] rounded-[28px] p-1.5 bg-[#171720] border-2 border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)] shrink-0">
                                {/* Phone Inner Bezel Screen */}
                                <div className="relative rounded-[22px] overflow-hidden bg-black border border-white/10 w-full h-full">
                                  {/* Dynamic Island Status Bar */}
                                  <div className="absolute top-2 inset-x-0 z-20 flex items-center justify-between px-3 pointer-events-none">
                                    <span className="text-[10px] font-mono font-semibold text-white/80">9:41</span>
                                    <div className="w-14 h-3 rounded-full bg-black border border-white/15 flex items-center justify-center shadow-inner">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff1e27]/80" />
                                    </div>
                                    <div className="flex items-center gap-1 text-white/80">
                                      <Wifi className="w-2.5 h-2.5" />
                                      <BatteryMedium className="w-2.5 h-2.5" />
                                    </div>
                                  </div>

                                  {/* Phone Viewport */}
                                  <AdaptiveProjectImage
                                    src={project.thumbnail_url}
                                    alt={project.title}
                                    minRatio={0.5}
                                    onScaleDetected={(s) => handleScaleDetected(project.id, s)}
                                    onClick={() => setActiveModalProject(project)}
                                    className="cursor-pointer w-full h-full pt-6 pb-3"
                                    imgClassName="transition-transform duration-500 group-hover/img:scale-105"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <span className="p-2.5 rounded-full bg-[#e50914] text-white shadow-lg">
                                        <Maximize2 className="w-4 h-4" />
                                      </span>
                                      <span className="text-xs font-mono font-medium text-white">View Mobile App</span>
                                    </div>
                                    <div className="absolute top-8 left-2 flex items-center gap-1 flex-wrap">
                                      <Badge variant="subtle">{project.category}</Badge>
                                      {project.featured && <Badge variant="crimson" dot>Featured</Badge>}
                                    </div>
                                  </AdaptiveProjectImage>

                                  {/* Home Indicator Bar */}
                                  <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none z-20">
                                    <div className="w-14 h-1 rounded-full bg-white/40" />
                                  </div>
                                </div>
                              </div>

                              {/* Mobile View Badge */}
                              <div className="mt-2 md:mt-0 flex items-center justify-center w-full shrink-0">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-950/80 border border-blue-500/30 text-blue-300 backdrop-blur-sm">
                                  <Smartphone className="w-3 h-3" />
                                  <span>Mobile View</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* ===== WINDOW DISPLAYED PROJECT (Desktop Window Frame) ===== */
                            <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-[#121217] shadow-lg group/img flex flex-col md:h-[400px] lg:h-[420px]">
                              {/* Desktop Window Title Bar */}
                              <div className="flex items-center justify-between px-3.5 py-2 bg-[#121217] border-b border-white/10 shrink-0">
                                {/* Traffic Lights */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                </div>

                                {/* Windows View Badge */}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 border border-purple-500/30 text-purple-300 backdrop-blur-sm shrink-0">
                                  <Monitor className="w-3 h-3" />
                                  <span className="hidden sm:inline">Windows View</span>
                                </span>
                              </div>

                              {/* Widescreen Viewport: Natural aspect on mobile screens (shrinks cleanly), fills full height on desktop */}
                              <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-auto md:flex-1 w-full overflow-hidden bg-[#0c0c0f]">
                                <AdaptiveProjectImage
                                  src={project.thumbnail_url}
                                  alt={project.title}
                                  minRatio={1.0}
                                  onScaleDetected={(s) => handleScaleDetected(project.id, s)}
                                  onClick={() => setActiveModalProject(project)}
                                  className="cursor-pointer w-full h-full"
                                  imgClassName="transition-transform duration-500 group-hover/img:scale-105"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-60" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <span className="p-2.5 rounded-full bg-[#e50914] text-white shadow-lg">
                                      <Maximize2 className="w-4 h-4" />
                                    </span>
                                    <span className="text-xs font-mono font-medium text-white">View Architecture</span>
                                  </div>
                                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                                    <Badge variant="subtle">{project.category}</Badge>
                                    {project.featured && <Badge variant="crimson" dot>Featured</Badge>}
                                  </div>
                                </AdaptiveProjectImage>
                              </div>
                            </div>
                          )}

                          {/* Project Meta & Headlines */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3
                                onClick={() => setActiveModalProject(project)}
                                className="text-lg sm:text-xl font-bold text-white group-hover:text-[#ff4d55] transition-colors cursor-pointer flex items-center gap-1.5 line-clamp-1"
                              >
                                <span>{project.title}</span>
                                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </h3>
                            </div>

                            {project.subtitle && (
                              <p className="text-xs font-mono text-[#ff4d55] line-clamp-1">
                                {project.subtitle}
                              </p>
                            )}

                            <p className="text-xs text-[#94949e] line-clamp-2 leading-relaxed md:min-h-[32px]">
                              {project.description}
                            </p>
                          </div>

                          {/* Technology Chips */}
                          <div className="flex flex-wrap gap-1.5 pt-1 md:min-h-[26px]">
                            {project.tags.slice(0, isWide ? 6 : 4).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181822] text-[#b4b4c0] border border-white/5"
                              >
                                {tag}
                              </span>
                            ))}
                            {project.tags.length > (isWide ? 6 : 4) && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#94949e]">
                                +{project.tags.length - (isWide ? 6 : 4)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Links Bar pinned to bottom */}
                        <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveModalProject(project)}
                            icon={<Sparkles className="w-3.5 h-3.5 text-[#ff1e27]" />}
                          >
                            Deep Dive
                          </Button>

                          <div className="flex items-center gap-2">
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-[#141419] hover:bg-[#1a1a22] text-[#94949e] hover:text-white border border-white/5 transition-colors"
                                title="Inspect Code"
                              >
                                <Code className="w-4 h-4" />
                              </a>
                            )}

                            {project.live_url && (
                              <a
                                href={project.live_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-[#141419] hover:bg-[#1a1a22] text-[#94949e] hover:text-white border border-white/5 transition-colors"
                                title="Launch Live Application"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
};
