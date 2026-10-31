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
  X
} from 'lucide-react';

type Project = Database['public']['Tables']['projects']['Row'];
type Category = 'Full-Stack' | 'Mobile' | 'Tools/Web3' | 'AI/Cloud';

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
  const [tagsInput, setTagsInput] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [featured, setFeatured] = useState(false);

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
    setTagsInput('');
    setLiveUrl('');
    setGithubUrl('');
    setThumbnailUrl('');
    setFeatured(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setSlug(project.slug);
    setSubtitle(project.subtitle || '');
    setDescription(project.description);
    setCategory(project.category as Category);
    setTagsInput(project.tags.join(', '));
    setLiveUrl(project.live_url || '');
    setGithubUrl(project.github_url || '');
    setThumbnailUrl(project.thumbnail_url || '');
    setFeatured(project.featured);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

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
    setStatusMsg({ type: 'success', text: 'Image uploaded to Supabase Storage!' });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !slug) {
      setStatusMsg({ type: 'error', text: 'Please fill in Title, Slug, and Description.' });
      return;
    }

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingId) {
      // UPDATE Operation
      const { error } = await supabase
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
      const { error } = await supabase.from('projects').insert([
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
                <label className="text-xs font-mono text-[#94949e]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff1e27]"
                >
                  <option value="Full-Stack">Full-Stack</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Tools/Web3">Tools / Web3</option>
                  <option value="AI/Cloud">AI / Cloud</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Tech Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="React 19, TypeScript, Supabase"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

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

            {/* Supabase Storage Media Uploader */}
            <div className="p-3.5 rounded-lg bg-[#0d0d10] border border-white/10 space-y-3">
              <label className="text-xs font-mono text-[#94949e] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#ff1e27]" />
                <span>Upload Screenshot to Supabase Storage (portfolio-media)</span>
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="text-xs text-[#94949e] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-[#1f1f28] file:text-white hover:file:bg-[#282836] cursor-pointer"
                />
                {uploading && <span className="text-xs text-[#ff1e27] font-mono">Uploading to bucket...</span>}
              </div>

              {thumbnailUrl && (
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-16 h-10 object-cover rounded border border-white/20" />
                  <span className="text-xs font-mono text-emerald-400 break-all">{thumbnailUrl}</span>
                </div>
              )}
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
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  {editingId ? 'Update Project' : 'Save Project'}
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
