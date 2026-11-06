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
  Smartphone
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

  if (mobiles.length === 0 || desktops.length === 0) {
    return list;
  }

  const mQueue = [...mobiles];
  const dQueue = [...desktops];
  const ordered: ProjectRow[] = [];

  for (let idx = 0; idx < list.length; idx++) {
    const rowIndex = Math.floor(idx / 2);
    const isEvenRow = rowIndex % 2 === 0;
    // Row 0, 2... (even): 1st is Mobile, 2nd is Window ("mobile window")
    // Row 1, 3... (odd):  1st is Window, 2nd is Mobile ("window mobile")
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
 * Calculates card display mode ('mobile' or 'desktop') and column spans per row.
 * Alternates rows:
 * - Even rows (0, 2, 4...): Mobile (4 cols) then Window (8 cols) -> "mobile window"
 * - Odd rows (1, 3, 5...):  Window (8 cols) then Mobile (4 cols) -> "window mobile"
 * - Mobile projects on solo rows remain compact mobile size (4 cols) without filling.
 */
function getCardLayout(
  index: number,
  total: number,
  isNaturallyMobile = false
): {
  spanClass: string;
  isWide: boolean;
  isSolo: boolean;
  scale: 'mobile' | 'desktop';
} {
  // If single project in category:
  // If mobile, keep authentic mobile size (4 cols); if desktop, 12 cols showcase
  if (total === 1) {
    if (isNaturallyMobile) {
      return {
        spanClass: 'col-span-1 md:col-span-5 lg:col-span-4',
        isWide: false,
        isSolo: false,
        scale: 'mobile',
      };
    }
    return {
      spanClass: 'col-span-1 md:col-span-12 lg:col-span-12',
      isWide: true,
      isSolo: true,
      scale: 'desktop',
    };
  }

  const rowIndex = Math.floor(index / 2);
  const isEvenRow = rowIndex % 2 === 0;
  const isFirstInRow = index % 2 === 0;

  // Even row: 1st is Mobile, 2nd is Window ("mobile window")
  // Odd row:  1st is Window, 2nd is Mobile ("window mobile")
  const isMobile = isEvenRow ? isFirstInRow : !isFirstInRow;
  const scale: 'mobile' | 'desktop' = isMobile ? 'mobile' : 'desktop';

  // Mobile project: ALWAYS stays compact mobile size (4 cols), even if solo on its row
  if (scale === 'mobile') {
    return {
      spanClass: 'col-span-1 md:col-span-5 lg:col-span-4',
      isWide: false,
      isSolo: false,
      scale: 'mobile',
    };
  }

  return {
    spanClass: 'col-span-1 md:col-span-7 lg:col-span-8',
    isWide: true,
    isSolo: false,
    scale: 'desktop',
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

      {/* Dynamic Projects Grid: Alternating Mobile / Window Rows with Original Clean Cards */}
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
              const { spanClass, isWide, isSolo, scale } = getCardLayout(
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
                  className={`${spanClass} flex flex-col md:h-full`}
                >
                  <Card className="flex flex-col justify-between group overflow-hidden bg-[#0c0c0f] border-white/10 hover:border-[#e50914]/50 p-5 sm:p-6 transition-all duration-300 h-auto md:h-full w-full">
                    {/* Solo 12-col showcase: dual-pane widescreen presentation */}
                    {isSolo ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 md:h-full">
                        {/* Widescreen image */}
                        <div className="lg:col-span-7 w-full">
                          <AdaptiveProjectImage
                            src={project.thumbnail_url}
                            alt={project.title}
                            minRatio={0.72}
                            onScaleDetected={(s) => handleScaleDetected(project.id, s)}
                            onClick={() => setActiveModalProject(project)}
                            className="rounded-xl border border-white/10 cursor-pointer group/img w-full shadow-lg md:!aspect-auto md:h-[340px] lg:h-[360px]"
                            imgClassName="transition-transform duration-500 group-hover/img:scale-105"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-60" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="p-2.5 rounded-full bg-[#e50914] text-white shadow-lg">
                                <Maximize2 className="w-4 h-4" />
                              </span>
                              <span className="text-xs font-mono font-medium text-white">View Deep Dive</span>
                            </div>

                            {/* Viewport Scale Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                              <Badge variant="subtle">{project.category}</Badge>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 border border-purple-500/30 text-purple-300 backdrop-blur-sm">
                                <Monitor className="w-3 h-3" />
                                <span>Windows Scale</span>
                              </span>
                              {project.featured && <Badge variant="crimson" dot>Featured</Badge>}
                            </div>
                          </AdaptiveProjectImage>
                        </div>

                        {/* Project Details */}
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 md:h-full">
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
                      // Multi-card layout: original clean card presentation with uniform height on desktop
                      <div className="flex flex-col justify-between h-auto md:h-full space-y-4">
                        <div className="space-y-4 flex-1 flex flex-col">
                          {/* Card Thumbnail / Preview Window */}
                          <AdaptiveProjectImage
                            src={project.thumbnail_url}
                            alt={project.title}
                            minRatio={0.72}
                            onScaleDetected={(s) => handleScaleDetected(project.id, s)}
                            onClick={() => setActiveModalProject(project)}
                            className="rounded-xl border border-white/10 cursor-pointer group/img w-full shadow-md md:!aspect-auto md:h-[340px] lg:h-[360px]"
                            imgClassName="transition-transform duration-500 group-hover/img:scale-105"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-60" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="p-2.5 rounded-full bg-[#e50914] text-white shadow-lg">
                                <Maximize2 className="w-4 h-4" />
                              </span>
                              <span className="text-xs font-mono font-medium text-white">View Architecture</span>
                            </div>

                            {/* Viewport Scale Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                              <Badge variant="subtle">{project.category}</Badge>
                              {scale === 'desktop' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 border border-purple-500/30 text-purple-300 backdrop-blur-sm">
                                  <Monitor className="w-3 h-3" />
                                  <span>Windows View</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950/80 border border-blue-500/30 text-blue-300 backdrop-blur-sm">
                                  <Smartphone className="w-3 h-3" />
                                  <span>Mobile View</span>
                                </span>
                              )}
                              {project.featured && <Badge variant="crimson" dot>Featured</Badge>}
                            </div>
                          </AdaptiveProjectImage>

                          {/* Project Meta & Headlines */}
                          <div className="space-y-1.5 md:min-h-[58px]">
                            <div className="flex items-center justify-between gap-2">
                              <h3
                                onClick={() => setActiveModalProject(project)}
                                className="text-lg sm:text-xl font-bold text-white group-hover:text-[#ff4d55] transition-colors cursor-pointer flex items-center gap-1.5"
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

                            <p className="text-xs text-[#94949e] line-clamp-2 leading-relaxed pt-1 md:min-h-[36px]">
                              {project.description}
                            </p>
                          </div>

                          {/* Technology Chips */}
                          <div className="flex flex-wrap gap-1.5 pt-1 md:min-h-[28px]">
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
