import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ProjectRow } from '../../lib/mockData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { AdaptiveProjectImage } from '../common/AdaptiveProjectImage';
import { 
  X, 
  ExternalLink, 
  Code, 
  Layers, 
  Sparkles, 
  Activity, 
  Calendar,
  Smartphone,
  Monitor
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: ProjectRow | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [prevId, setPrevId] = useState<string | null>(null);
  const [detectedScale, setDetectedScale] = useState<'mobile' | 'desktop' | null>(null);

  // Reset scale state when project changes without effect-driven cascading render
  if (project && project.id !== prevId) {
    setPrevId(project.id);
    setDetectedScale(null);
  }

  // Lock body scroll when modal is open and handle Escape key
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const metrics = project.metrics as Record<string, string> | null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-project-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      >
        {/* Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window Container: expanded max-w-6xl for dual-pane desktop deepdive */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-5xl lg:max-w-6xl max-h-[92vh] bg-[#0d0d10] border border-white/15 rounded-2xl shadow-[0_0_60px_rgba(229,9,20,0.3)] overflow-hidden flex flex-col z-10"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-white/10 bg-[#121217] shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Badge variant="crimson">{project.category}</Badge>
              {project.featured && <Badge variant="emerald" dot>Featured Application</Badge>}
              
              {/* Dynamic Viewport Scale Indicator */}
              {detectedScale === 'mobile' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/25">
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile Scale (0.72)</span>
                </span>
              )}
              {detectedScale === 'desktop' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/25">
                  <Monitor className="w-3 h-3" />
                  <span>Windows / Desktop View</span>
                </span>
              )}

              <span className="text-[11px] font-mono text-[#94949e] hidden sm:inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(project.created_at).getFullYear()}</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94949e] hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body - Split View (Left: Visual Showcase, Right: All Project Data) */}
          <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: Visual Media Showcase (Image Left, Mobile & Windows dynamic scale) */}
              <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-4">
                <div className="relative rounded-xl border border-white/10 bg-[#141419] overflow-hidden shadow-lg p-2 sm:p-3">
                  {project.thumbnail_url ? (
                    <div className="w-full flex items-center justify-center">
                      <AdaptiveProjectImage
                        src={project.thumbnail_url}
                        alt={project.title}
                        minRatio={0.72}
                        onScaleDetected={(scale) => setDetectedScale(scale)}
                        className="rounded-lg border border-white/5 max-h-[65vh] w-auto mx-auto shadow-inner"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-lg border border-white/5 aspect-video w-full max-h-64 bg-[#181822] flex items-center justify-center text-[#5a5a66]">
                      <Layers className="w-12 h-12" />
                    </div>
                  )}

                  {/* Orientation scale footer tag */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#7e7e8c]">
                    <span className="flex items-center gap-1">
                      {detectedScale === 'mobile' ? (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          <span>Portrait Mobile Frame</span>
                        </>
                      ) : (
                        <>
                          <Monitor className="w-3.5 h-3.5 text-purple-400" />
                          <span>Landscape Windows Frame</span>
                        </>
                      )}
                    </span>
                    <span>Min ratio: 0.72</span>
                  </div>
                </div>

                {/* Quick actions underneath left image on desktop */}
                <div className="hidden md:flex flex-col gap-2.5 pt-1">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />} className="w-full justify-center">
                        Launch Live Demo
                      </Button>
                    </a>
                  )}

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      <Button variant="secondary" icon={<Code className="w-4 h-4" />} className="w-full justify-center">
                        View Source Code
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Full Data Visibility (Title, Overview, Architecture, Metrics, Tech Stack) */}
              <div className="md:col-span-7 lg:col-span-7 space-y-6">
                {/* Title & Subtitle */}
                <div className="space-y-1.5 border-b border-white/10 pb-4">
                  <h2 id="modal-project-title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    {project.title}
                  </h2>
                  {project.subtitle && (
                    <p className="text-sm sm:text-base font-mono text-[#ff4d55]">
                      {project.subtitle}
                    </p>
                  )}
                </div>

                {/* Executive In-Depth Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#94949e] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff1e27]" />
                    <span>Executive Overview</span>
                  </h3>
                  <p className="text-sm sm:text-base text-[#c2c2cf] leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>

                {/* Architecture Overview Callout */}
                {project.architecture_overview && (
                  <div className="p-4 sm:p-5 rounded-xl bg-[#141419] border border-white/10 space-y-2 shadow-inner">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>System Architecture Overview</span>
                    </h3>
                    <p className="text-xs sm:text-sm font-mono text-[#b3b3c2] leading-relaxed whitespace-pre-line">
                      {project.architecture_overview}
                    </p>
                  </div>
                )}

                {/* Performance & Key Metrics (100% visible in right pane) */}
                {metrics && Object.keys(metrics).length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#94949e]">
                      Performance & Key Metrics
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(metrics).map(([key, value]) => (
                        <div key={key} className="p-3 sm:p-3.5 rounded-lg bg-[#141419] border border-white/5 hover:border-white/10 transition-colors">
                          <p className="text-[10px] font-mono text-[#94949e] uppercase tracking-wider truncate">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-base sm:text-lg font-bold text-white font-mono mt-0.5 break-words">
                            {String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technologies Deployed */}
                {project.tags && project.tags.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#94949e]">
                      Technologies Deployed
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#181822] text-[#e0e0ea] border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions visible on mobile at the end of the content */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 md:hidden">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />} className="w-full justify-center">
                        Launch Live Demo
                      </Button>
                    </a>
                  )}

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full"
                    >
                      <Button variant="secondary" icon={<Code className="w-4 h-4" />} className="w-full justify-center">
                        Source Code
                      </Button>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Bar for quick navigation / close */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-[#121217] flex items-center justify-between shrink-0">
            <span className="text-xs font-mono text-[#7e7e8c] truncate">
              {project.title} &bull; Deep Dive Detail
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
