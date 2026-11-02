import React, { useEffect } from 'react';
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
  Calendar 
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: ProjectRow | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0d0d10] border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(229,9,20,0.25)] overflow-hidden flex flex-col z-10"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#121217]">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Badge variant="crimson">{project.category}</Badge>
              {project.featured && <Badge variant="emerald" dot>Featured Application</Badge>}
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

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Visual Thumbnail / Banner */}
            {project.thumbnail_url ? (
              <div className="mx-auto w-full max-w-full" style={{ maxWidth: 'min(100%, 60vh * 16 / 9)' }}>
                <AdaptiveProjectImage
                  src={project.thumbnail_url}
                  alt={project.title}
                  minRatio={9 / 19.5}
                  className="rounded-xl border border-white/10 max-h-[60vh] mx-auto"
                />
              </div>
            ) : (
              <div className="relative rounded-xl border border-white/10 aspect-video w-full max-h-56 bg-[#141419] flex items-center justify-center text-[#5a5a66]">
                <Layers className="w-12 h-12" />
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h2 id="modal-project-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.title}
              </h2>
              {project.subtitle && (
                <p className="text-sm font-mono text-[#ff4d55]">
                  {project.subtitle}
                </p>
              )}
            </div>

            {/* In-Depth Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#94949e] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff1e27]" />
                <span>Executive Overview</span>
              </h3>
              <p className="text-sm text-[#c2c2cf] leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Architecture Overview Callout */}
            {project.architecture_overview && (
              <div className="p-4 rounded-xl bg-[#141419] border border-white/10 space-y-1.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>System Architecture Overview</span>
                </h3>
                <p className="text-xs sm:text-sm font-mono text-[#94949e] leading-relaxed">
                  {project.architecture_overview}
                </p>
              </div>
            )}

            {/* Metrics Ribbon (if present) */}
            {metrics && Object.keys(metrics).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#94949e]">
                  Performance & Key Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-[#141419] border border-white/5">
                      <p className="text-[10px] font-mono text-[#94949e] uppercase tracking-wider">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack Chips */}
            {project.tags && project.tags.length > 0 && (
              <div className="space-y-2">
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
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-[#121217] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="secondary" icon={<Code className="w-4 h-4" />} className="w-full">
                  Source Code
                </Button>
              </a>
            )}

            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />} className="w-full">
                  Launch Live Demo
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
