import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  Calendar, 
  MapPin, 
  X 
} from 'lucide-react';

type Experience = Database['public']['Tables']['experiences']['Row'];

export const ExperienceManager: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [location, setLocation] = useState('');
  const [period, setPeriod] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');

  const fetchExperiences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      setStatusMsg({ type: 'error', text: `Fetch failed: ${error.message}` });
    } else if (data) {
      setExperiences(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true });

      if (ignore) return;
      if (error) {
        setStatusMsg({ type: 'error', text: `Fetch failed: ${error.message}` });
      } else if (data) {
        setExperiences(data);
      }
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setRole('');
    setCompany('');
    setCompanyUrl('');
    setLocation('');
    setPeriod('');
    setIsCurrent(false);
    setHighlightsInput('');
    setTechStackInput('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setRole(exp.role);
    setCompany(exp.company);
    setCompanyUrl(exp.company_url || '');
    setLocation(exp.location || '');
    setPeriod(exp.period);
    setIsCurrent(exp.is_current);
    setHighlightsInput(exp.highlights.join('\n'));
    setTechStackInput(exp.tech_stack.join(', '));
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !company || !period) {
      setStatusMsg({ type: 'error', text: 'Please fill in Role, Company, and Period.' });
      return;
    }

    const highlights = highlightsInput.split('\n').map((h) => h.trim()).filter(Boolean);
    const techStack = techStackInput.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingId) {
      // UPDATE Operation
      const { error } = await supabase
        .from('experiences')
        .update({
          role,
          company,
          company_url: companyUrl || null,
          location: location || null,
          period,
          is_current: isCurrent,
          highlights,
          tech_stack: techStack,
        })
        .eq('id', editingId);

      if (error) {
        setStatusMsg({ type: 'error', text: `Update failed: ${error.message}` });
      } else {
        setStatusMsg({ type: 'success', text: `Milestone "${role} at ${company}" updated successfully!` });
        setIsFormOpen(false);
        setEditingId(null);
        fetchExperiences();
      }
    } else {
      // CREATE Operation
      const { error } = await supabase.from('experiences').insert([
        {
          role,
          company,
          company_url: companyUrl || null,
          location: location || null,
          period,
          is_current: isCurrent,
          highlights,
          tech_stack: techStack,
          sort_order: experiences.length + 1,
        },
      ]);

      if (error) {
        setStatusMsg({ type: 'error', text: `Failed to create: ${error.message}` });
      } else {
        setStatusMsg({ type: 'success', text: `Role "${role} at ${company}" added to timeline!` });
        setIsFormOpen(false);
        setEditingId(null);
        fetchExperiences();
      }
    }
  };

  const handleDeleteExperience = async (id: string, roleName: string) => {
    if (!confirm(`Delete "${roleName}" from timeline?`)) return;

    const { error } = await supabase.from('experiences').delete().eq('id', id);

    if (error) {
      setStatusMsg({ type: 'error', text: `Delete failed: ${error.message}` });
    } else {
      setStatusMsg({ type: 'success', text: `Removed "${roleName}".` });
      fetchExperiences();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar - Responsive on mobile & desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Career Timeline</span>
            <Badge variant="crimson">{experiences.length} Milestones</Badge>
          </h2>
          <p className="text-xs text-[#94949e] mt-0.5">
            Manage your career progression items in <code className="text-[#ff1e27]">public.experiences</code>.
          </p>
        </div>

        <button
          onClick={() => {
            if (isFormOpen) {
              setIsFormOpen(false);
              setEditingId(null);
            } else {
              handleOpenCreate();
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer w-full sm:w-auto"
        >
          {isFormOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
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
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="break-all">{statusMsg.text}</span>
        </div>
      )}

      {/* Experience Form - Simple, Static, Responsive */}
      {isFormOpen && (
        <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff1e27]" />
              {editingId ? 'Edit Milestone (Update)' : 'New Career Milestone'}
            </h3>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
              className="text-[#94949e] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveExperience} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Job Title / Role *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Lead Application Developer"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Company / Studio *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Independent / Digital Agency"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Period / Dates *</label>
                <input
                  type="text"
                  required
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="2024 — Present"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote / Toronto, Canada"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#94949e]">Key Deliverables / Highlights (one per line)</label>
              <textarea
                rows={3}
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                placeholder="Architected distributed full-stack systems&#10;Integrated real-time WebGL rendering engines"
                className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#94949e]">Technologies Used (comma separated)</label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="React, TypeScript, Three.js, Docker, Supabase"
                className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#94949e]">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="accent-[#e50914] rounded cursor-pointer w-4 h-4"
                />
                <span>Present Position</span>
              </label>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
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
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  {editingId ? 'Update Milestone' : 'Save Milestone'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Experience List */}
      {loading ? (
        <div className="p-8 sm:p-12 text-center text-xs font-mono text-[#94949e] space-y-2">
          <div className="w-5 h-5 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Syncing timeline from Supabase...</p>
        </div>
      ) : experiences.length === 0 ? (
        <div className="p-6 sm:p-8 rounded-xl bg-[#141419] border border-white/5 text-center space-y-3">
          <p className="text-xs sm:text-sm text-[#94949e]">No career milestones found in the database yet.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            Add First Milestone
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-4 sm:p-5 rounded-xl bg-[#141419] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1.5 rounded-lg bg-[#e50914]/10 text-[#ff1e27] shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-none">{exp.role}</h3>
                  <span className="text-xs text-[#94949e]">at {exp.company}</span>
                  {exp.is_current && <Badge variant="emerald" dot>Present</Badge>}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-[#94949e] flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {exp.period}
                  </span>
                  {exp.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {exp.location}
                    </span>
                  )}
                </div>

                {exp.highlights.length > 0 && (
                  <ul className="text-xs text-[#94949e] list-disc list-inside space-y-0.5 pt-1">
                    {exp.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                )}

                {exp.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {exp.tech_stack.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#1a1a24] text-[#94949e]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons - Touch friendly 40px minimum targets */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 border-white/5 pt-3 md:pt-0 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="p-2 sm:p-2.5 rounded-lg bg-blue-950/30 hover:bg-blue-900/40 text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                  title="Edit Milestone (Update)"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteExperience(exp.id, exp.role)}
                  className="p-2 sm:p-2.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-[#ff6b72] hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                  title="Delete Milestone"
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
