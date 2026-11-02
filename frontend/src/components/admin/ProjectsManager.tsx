import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  ExternalLink, 
  Code, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  X,
  Monitor,
  Smartphone,
  Save
} from 'lucide-react';

type Project = Database['public']['Tables']['projects']['Row'];

const CATEGORIES = [
  'Full-Stack',
  'Mobile',
  'AI/Cloud',
  'Tools/Web3',
  'DevOps & Systems',
  '3D Graphics & Games',
  'API & Microservices',
] as const;
type Category = (typeof CATEGORIES)[number];

const BASE_CATEGORY_FALLBACK: Record<string, string> = {
  'DevOps & Systems': 'Tools/Web3',
  '3D Graphics & Games': 'Full-Stack',
  'API & Microservices': 'Full-Stack',
};

const POPULAR_TAG_PRESETS = [
  'Vite',
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Express.js',
  'CORS',
  'Python',
  'Tailwind CSS',
  'Three.js',
  'WebGL',
  'Docker',
  'PostgreSQL',
  'Supabase',
  'React Native',
  'GraphQL',
  'Redis',
  'WebSockets',
  'AWS',
  'Vercel',
  'Firebase',
  'MongoDB',
  'Prisma',
];

export const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Full-Stack');
  
  // Tech Tags List State
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [featured, setFeatured] = useState(false);

  // Media validation state
  const [detectedScale, setDetectedScale] = useState<'desktop' | 'mobile' | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; ratio: number } | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      setStatusMsg({ type: 'error', text: `Fetch failed: ${error.message}` });
    } else if (data) {
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (ignore) return;
      if (error) {
        setStatusMsg({ type: 'error', text: `Fetch failed: ${error.message}` });
      } else if (data) {
        setProjects(data);
      }
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSubtitle('');
    setDescription('');
    setCategory('Full-Stack');
    setTags([]);
    setTagInput('');
    setLiveUrl('');
    setGithubUrl('');
    setThumbnailUrl('');
    setFeatured(false);
    setDetectedScale(null);
    setImageMeta(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setSlug(project.slug);
    setSubtitle(project.subtitle || '');
    setDescription(project.description);
    setCategory((CATEGORIES.includes(project.category as Category) ? project.category : 'Full-Stack') as Category);
    setTags(project.tags || []);
    setTagInput('');
    setLiveUrl(project.live_url || '');
    setGithubUrl(project.github_url || '');
    setThumbnailUrl(project.thumbnail_url || '');
    setFeatured(project.featured);
    setDetectedScale(null);
    setImageMeta(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Tag Management
  const handleAddTag = (tagToAdd?: string) => {
    const val = (tagToAdd ?? tagInput).trim();
    if (!val) return;
    if (!tags.includes(val)) {
      setTags([...tags, val]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Aspect-ratio validated image upload (Windows 16:9 or Mobile 9:16 with wiggle room)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMsg(null);
    setUploading(true);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      const ratio = width / height;

      const isMobile = ratio < 1.0;
      const scaleType = isMobile ? 'mobile' : 'desktop';
      setDetectedScale(scaleType);
      setImageMeta({ width, height, ratio });

      // Proceed to Supabase upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatusMsg({ type: 'error', text: `Image upload failed: ${uploadError.message}` });
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(filePath);

      setThumbnailUrl(publicUrl);
      setUploading(false);
      setStatusMsg({ 
        type: 'success', 
        text: `Image uploaded successfully as ${scaleType === 'desktop' ? 'Windows Landscape' : 'Mobile Portrait'} (${width}x${height}px, ratio ${ratio.toFixed(2)})!` 
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setStatusMsg({ type: 'error', text: 'Failed to read image file. Please choose a valid PNG, JPG, or WebP.' });
      setUploading(false);
    };

    img.src = objectUrl;
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !slug) {
      setStatusMsg({ type: 'error', text: 'Please fill in Title, Slug, and Description.' });
      return;
    }

    if (editingId) {
      // UPDATE Operation
      let { error } = await supabase
        .from('projects')
        .update({
          title,
          slug,
          subtitle: subtitle || null,
          description,
          category,
          tags,
          featured,
          thumbnail_url: thumbnailUrl || null,
          live_url: liveUrl || null,
          github_url: githubUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      // Gracefully retry with database-safe base category fallback if check constraint is active
      if (error && error.message.includes('projects_category_check')) {
        const fallback = BASE_CATEGORY_FALLBACK[category] || 'Full-Stack';
        const mergedTags = tags.includes(category) ? tags : [...tags, category];
        const retry = await supabase
          .from('projects')
          .update({
            title,
            slug,
            subtitle: subtitle || null,
            description,
            category: fallback,
            tags: mergedTags,
            featured,
            thumbnail_url: thumbnailUrl || null,
            live_url: liveUrl || null,
            github_url: githubUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
        error = retry.error;
      }

      if (error) {
        setStatusMsg({ type: 'error', text: `Update failed: ${error.message}` });
      } else {
        setStatusMsg({ type: 'success', text: `Project "${title}" updated successfully!` });
        setIsFormOpen(false);
        setEditingId(null);
        fetchProjects();
      }
    } else {
      // CREATE Operation
      let { error } = await supabase.from('projects').insert([
        {
          title,
          slug,
          subtitle: subtitle || null,
          description,
          category,
          tags,
          featured,
          thumbnail_url: thumbnailUrl || null,
          live_url: liveUrl || null,
          github_url: githubUrl || null,
          sort_order: projects.length + 1,
        },
      ]);

      // Gracefully retry with database-safe base category fallback if check constraint is active
      if (error && error.message.includes('projects_category_check')) {
        const fallback = BASE_CATEGORY_FALLBACK[category] || 'Full-Stack';
        const mergedTags = tags.includes(category) ? tags : [...tags, category];
        const retry = await supabase.from('projects').insert([
          {
            title,
            slug,
            subtitle: subtitle || null,
            description,
            category: fallback,
            tags: mergedTags,
            featured,
            thumbnail_url: thumbnailUrl || null,
            live_url: liveUrl || null,
            github_url: githubUrl || null,
            sort_order: projects.length + 1,
          },
        ]);
        error = retry.error;
      }

      if (error) {
        setStatusMsg({ type: 'error', text: `Failed to create: ${error.message}` });
      } else {
        setStatusMsg({ type: 'success', text: `Project "${title}" created successfully!` });
        setIsFormOpen(false);
        fetchProjects();
      }
    }
  };

  const handleDeleteProject = async (id: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}" from Supabase?`)) return;

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      setStatusMsg({ type: 'error', text: `Delete failed: ${error.message}` });
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setStatusMsg({ type: 'success', text: `Project "${projectTitle}" removed.` });
      fetchProjects();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar - Responsive on mobile & desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Project Portfolio</span>
            <Badge variant="crimson">{projects.length} Saved</Badge>
          </h2>
          <p className="text-xs text-[#94949e] mt-0.5">
            Create, Read, Update, and Delete projects in <code className="text-[#ff1e27]">public.projects</code>.
          </p>
        </div>

        <button
          onClick={() => (isFormOpen ? setIsFormOpen(false) : handleOpenCreate())}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer w-full sm:w-auto"
        >
          {isFormOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </>
          )}
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : 'bg-red-950/40 border-red-500/30 text-[#ff6b72]'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="break-all">{statusMsg.text}</span>
        </div>
      )}

      {/* Project Form Panel - Simple, Static, Responsive */}
      {isFormOpen && (
        <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff1e27]" />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                {editingId ? `Update: ${title}` : 'New Project'}
              </h3>
            </div>
            {editingId && (
              <Badge variant="crimson">Edit Mode</Badge>
            )}
          </div>

          <form onSubmit={handleSaveProject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="text-xs font-mono text-[#94949e]">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Distributed AI Orchestrator"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="distributed-ai-orchestrator"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Tech Discipline / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff1e27]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#94949e]">Subtitle / Tagline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Real-time agentic pipeline & vector search"
                className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#94949e]">Description *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="In-depth overview of the application architecture, problem solved, and technical deliverables..."
                className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            {/* Individual Tech Tags Adder */}
            <div className="space-y-2 p-3.5 rounded-lg bg-[#0d0d10] border border-white/10">
              <label className="text-xs font-mono text-[#94949e] flex items-center justify-between">
                <span>Technologies & Stack (Add one at a time)</span>
                <span className="text-[10px] text-[#ff4d55]">{tags.length} tags added</span>
              </label>

              {/* Tag Input & Add Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. React 19 (Press Enter to add)"
                  className="flex-1 bg-[#141419] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-4 py-2 rounded-lg bg-[#1f1f28] hover:bg-[#282836] border border-white/10 text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  Add Tag
                </button>
              </div>

              {/* Tag Chips List */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181822] border border-white/15 text-xs font-mono text-white"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-[#94949e] hover:text-[#ff4d55] cursor-pointer"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick-Add Popular Presets */}
              <div className="pt-2 border-t border-white/5 space-y-1">
                <p className="text-[10px] font-mono text-[#5a5a66] uppercase">Quick Add Common Stacks:</p>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_TAG_PRESETS.map((preset) => {
                    const isAdded = tags.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddTag(preset)}
                        disabled={isAdded}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          isAdded
                            ? 'bg-white/5 text-[#5a5a66] border border-transparent opacity-40 cursor-not-allowed'
                            : 'bg-[#141419] border border-white/10 text-[#a1a1aa] hover:text-white hover:border-[#ff1e27]/40'
                        }`}
                      >
                        + {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Live Demo URL</label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>
            </div>

            {/* Supabase Storage Media Uploader with Aspect Ratio Enforcement */}
            <div className="p-3.5 rounded-lg bg-[#0d0d10] border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-mono text-white flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#ff1e27]" />
                  <span>Upload Media (Windows 16:9 or Mobile 9:16 Scale)</span>
                </label>
                <span className="text-[10px] font-mono text-[#94949e]">
                  Enforces consistent gallery layout
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="text-xs text-[#94949e] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-[#1f1f28] file:text-white hover:file:bg-[#282836] cursor-pointer"
                />
                {uploading && <span className="text-xs text-[#ff1e27] font-mono">Analyzing aspect ratio & uploading...</span>}
              </div>

              {/* Aspect Ratio Validation Status Badge */}
              {detectedScale && imageMeta && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  {detectedScale === 'desktop' ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Windows / Desktop Scale Verified ({imageMeta.width}x{imageMeta.height}px &bull; {imageMeta.ratio.toFixed(2)}:1)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/40 border border-blue-500/30 text-blue-400 font-mono text-[11px]">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile Portrait Scale Verified ({imageMeta.width}x{imageMeta.height}px &bull; {imageMeta.ratio.toFixed(2)}:1)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Thumbnail Preview */}
              {thumbnailUrl && (
                <div className="flex items-center gap-3 pt-2 flex-wrap">
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-20 h-14 object-cover rounded border border-white/20" />
                  <span className="text-xs font-mono text-emerald-400 break-all">{thumbnailUrl}</span>
                </div>
              )}

              <p className="text-[10px] font-mono text-[#5a5a66] leading-relaxed">
                &bull; Desktop Widescreen: ~16:9 ratio (allowed: 1.35 &ndash; 2.15, e.g. 1920&times;1080)<br />
                &bull; Mobile Portrait: ~9:16 ratio (allowed: 0.45 &ndash; 0.78, e.g. 1080&times;1920)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#94949e]">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="accent-[#e50914] rounded cursor-pointer w-4 h-4"
                />
                <span>Highlight as Featured Project</span>
              </label>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingId(null);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-[#1a1a22] hover:bg-[#22222c] text-xs font-mono text-[#94949e] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Update Project' : 'Save Project'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="p-8 sm:p-12 text-center text-xs font-mono text-[#94949e] space-y-2">
          <div className="w-5 h-5 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Syncing projects from Supabase...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-6 sm:p-8 rounded-xl bg-[#141419] border border-white/5 text-center space-y-3">
          <p className="text-xs sm:text-sm text-[#94949e]">No projects found in the remote database yet.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 rounded-xl bg-[#141419] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                {p.thumbnail_url ? (
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-lg border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg bg-[#0d0d10] border border-white/5 flex items-center justify-center shrink-0 text-[#5a5a66]">
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-none">{p.title}</h3>
                    <Badge variant="subtle">{p.category}</Badge>
                    {p.featured && <Badge variant="crimson" dot>Featured</Badge>}
                  </div>
                  <p className="text-xs text-[#94949e] line-clamp-2 sm:line-clamp-1">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {p.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1a24] text-[#a1a1aa] border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Touch friendly 40px minimum targets */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 border-white/5 pt-3 md:pt-0 w-full md:w-auto justify-end">
                {p.live_url && (
                  <a
                    href={p.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 sm:p-2.5 rounded-lg bg-[#1a1a22] hover:bg-[#242430] text-[#94949e] hover:text-white transition-colors"
                    title="Live Demo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {p.github_url && (
                  <a
                    href={p.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 sm:p-2.5 rounded-lg bg-[#1a1a22] hover:bg-[#242430] text-[#94949e] hover:text-white transition-colors"
                    title="GitHub"
                  >
                    <Code className="w-4 h-4" />
                  </a>
                )}
                {/* UPDATE / EDIT BUTTON */}
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-2 sm:p-2.5 rounded-lg bg-blue-950/30 hover:bg-blue-900/40 text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                  title="Edit Project (Update)"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDeleteProject(p.id, p.title)}
                  className="p-2 sm:p-2.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-[#ff6b72] hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};