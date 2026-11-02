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

function getCardSpan(
  project: ProjectRow,
  index: number,
  all: ProjectRow[],
  scales: Record<string, 'mobile' | 'desktop'>
): { spanClass: string; isWide: boolean; isSolo: boolean } {
  const total = all.length;
  const scale = scales[project.id] || getInitialScale(project);

  // Single project: full width showcase that fills maximum space
  if (total === 1) {
    return {
      spanClass: 'col-span-1 md:col-span-2 lg:col-span-12',
      isWide: true,
      isSolo: true,
    };
  }

  // Exactly two projects:
  if (total === 2) {
    const other = all[1 - index];
    const otherScale = scales[other.id] || getInitialScale(other);

    // If one is Windows (landscape) and one is Mobile (portrait):
    if (scale === 'desktop' && otherScale === 'mobile') {
      return { spanClass: 'col-span-1 md:col-span-2 lg:col-span-8', isWide: true, isSolo: false };
    }
    if (scale === 'mobile' && otherScale === 'desktop') {
      return { spanClass: 'col-span-1 md:col-span-1 lg:col-span-4', isWide: false, isSolo: false };
    }
    // Both are Windows desktop or both are mobile: 50/50 split (6 cols each)
    return { spanClass: 'col-span-1 md:col-span-1 lg:col-span-6', isWide: scale === 'desktop', isSolo: false };
  }

  // 3 or more projects:
  // Mobile projects take 4 columns (1/3 of the 12-col grid)
  if (scale === 'mobile') {
    return {
      spanClass: 'col-span-1 md:col-span-1 lg:col-span-4',
      isWide: false,
      isSolo: false,
    };
  }

  // Windows / Desktop projects: expand to fill maximum available space
  const prev = index > 0 ? all[index - 1] : null;
  const next = index < total - 1 ? all[index + 1] : null;
  const prevScale = prev ? (scales[prev.id] || getInitialScale(prev)) : null;
  const nextScale = next ? (scales[next.id] || getInitialScale(next)) : null;

  // If paired with an adjacent mobile card, expand to 8 cols (8 + 4 = 12 cols row fill)
  if (nextScale === 'mobile' || prevScale === 'mobile') {
    return {
      spanClass: 'col-span-1 md:col-span-2 lg:col-span-8',
      isWide: true,
      isSolo: false,
    };
  }

  // If it is the last item in an odd list, span full width to fill space
  if (index === total - 1 && total % 2 !== 0) {
    return {
      spanClass: 'col-span-1 md:col-span-2 lg:col-span-12',
      isWide: true,
      isSolo: false,
    };
  }

  // Featured desktop card gets 8 columns
  if (project.featured) {
    return {
      spanClass: 'col-span-1 md:col-span-2 lg:col-span-8',
      isWide: true,
      isSolo: false,
    };
  }

  // Standard Windows cards split 50/50 across 6 cols each
  return {
    spanClass: 'col-span-1 md:col-span-1 lg:col-span-6',
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

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [projects, selectedCategory]);

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
            Engineering High-Performance{' '}
            <span className="bg-gradient-to-r from-white via-[#ff6b72] to-[#e50914] bg-clip-text text-transparent">
              Digital Products.
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

      {/* Dynamic Projects Grid: Windows cards expand to fill maximum space */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 pt-12 items-stretch">
          <AnimatePresence>
            {filteredProjects.map((project, idx) => {
              const { spanClass, isWide, isSolo } = getCardSpan(
                project,
                idx,
                filteredProjects,
                detectedScales
              );
              const scale = detectedScales[project.id] || getInitialScale(project);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className={`${spanClass} flex flex-col`}
                >
                  <Card className="flex flex-col justify-between group overflow-hidden bg-[#0c0c0f] border-white/10 hover:border-[#e50914]/50 p-5 sm:p-6 transition-all duration-300 h-full w-full">
                    {/* If solo card or full-row card on wide screens, show side-by-side showcase */}
                    {isSolo ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
                        {/* Widescreen image */}
                        <div className="lg:col-span-7 w-full">
                          <AdaptiveProjectImage
                            src={project.thumbnail_url}
                            alt={project.title}
                            minRatio={0.72}
                            onScaleDetected={(s) => handleScaleDetected(project.id, s)}
                            onClick={() => setActiveModalProject(project)}
                            className="rounded-xl border border-white/10 cursor-pointer group/img w-full shadow-lg"
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
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
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

                          {/* Tech stack */}
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

                          {/* Actions */}
                          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
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
                      // Multi-card layout: fills maximum space horizontally and vertically
                      <div className="flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-4">
                          {/* Card Thumbnail / Preview Window */}
                          <AdaptiveProjectImage
                            src={project.thumbnail_url}
                            alt={project.title}
                            minRatio={0.72}
                            onScaleDetected={(s) => handleScaleDetected(project.id, s)}
                            onClick={() => setActiveModalProject(project)}
                            className="rounded-xl border border-white/10 cursor-pointer group/img w-full shadow-md"
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
                          <div className="space-y-1.5">
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

                            <p className="text-xs text-[#94949e] line-clamp-2 leading-relaxed pt-1">
                              {project.description}
                            </p>
                          </div>

                          {/* Technology Chips */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
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

                        {/* Action Links Bar */}
                        <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between gap-2">
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
