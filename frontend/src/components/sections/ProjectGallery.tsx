import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProjects } from '../../hooks/useProjects';
import type { ProjectRow } from '../../lib/mockData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { ProjectDetailModal } from './ProjectDetailModal';
import { 
  Layers, 
  ExternalLink, 
  Code, 
  Sparkles, 
  ArrowUpRight, 
  Maximize2 
} from 'lucide-react';

const CATEGORIES = ['All', 'Full-Stack', 'Mobile', 'AI/Cloud', 'Tools/Web3'] as const;
type Category = (typeof CATEGORIES)[number];

export const ProjectGallery: React.FC = () => {
  const { projects, loading } = useProjects();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [activeModalProject, setActiveModalProject] = useState<ProjectRow | null>(null);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

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
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' ? projects.length : projects.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;

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

      {/* Projects Bento Grid */}
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
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
          <AnimatePresence>
            {filteredProjects.map((project, idx) => {
              // Bento layout: first featured item can take 2 columns on large screens
              const isHeroBento = project.featured && idx === 0;

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className={isHeroBento ? 'md:col-span-2' : ''}
                >
                  <Card className="h-full flex flex-col justify-between group overflow-hidden bg-[#0c0c0f] border-white/10 hover:border-[#e50914]/50 p-5 sm:p-6 transition-all duration-300">
                    <div className="space-y-4">
                      {/* Card Thumbnail / Preview Window */}
                      <div
                        onClick={() => setActiveModalProject(project)}
                        className="relative rounded-xl overflow-hidden aspect-video bg-[#141419] border border-white/10 cursor-pointer group/img"
                      >
                        {project.thumbnail_url ? (
                          <img
                            src={project.thumbnail_url}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#5a5a66] bg-grid-pattern">
                            <Layers className="w-10 h-10" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-60" />

                        {/* Hover Overlay with Inspect Icon */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="p-2.5 rounded-full bg-[#e50914] text-white shadow-lg">
                            <Maximize2 className="w-4 h-4" />
                          </span>
                          <span className="text-xs font-mono font-medium text-white">View Architecture</span>
                        </div>

                        {/* Category & Status Pill on Image */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <Badge variant="subtle">{project.category}</Badge>
                          {project.featured && <Badge variant="crimson" dot>Featured</Badge>}
                        </div>
                      </div>

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
                          <p className="text-xs font-mono text-[#a1a1aa] line-clamp-1">
                            {project.subtitle}
                          </p>
                        )}

                        <p className="text-xs text-[#94949e] line-clamp-2 leading-relaxed pt-1">
                          {project.description}
                        </p>
                      </div>

                      {/* Technology Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.tags.slice(0, 4).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181822] text-[#b4b4c0] border border-white/5"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 4 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#94949e]">
                            +{project.tags.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Links Bar */}
                    <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
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
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
};