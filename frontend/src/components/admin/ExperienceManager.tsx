import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { 
  sortMilestonesReverseChronological, 
  extractMilestoneType, 
  cleanHighlights, 
  deduplicateMilestones,
  type MilestoneCategoryType 
} from '../../lib/timelineUtils';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  GraduationCap,
  Award,
  Trophy, 
  Calendar, 
  MapPin, 
  X,
  ExternalLink,
  Save
} from 'lucide-react';

type Experience = Database['public']['Tables']['experiences']['Row'];
type MilestoneType = MilestoneCategoryType;

export const ExperienceManager: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('experience');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [location, setLocation] = useState('');
  const [period, setPeriod] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [deliverableInput, setDeliverableInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const fetchExperiences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      setStatusMsg({ type: 'error', text: `Fetch failed: ${error.message}` });
    } else if (data) {
      setExperiences(sortMilestonesReverseChronological(deduplicateMilestones(data)));
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
        setExperiences(sortMilestonesReverseChronological(deduplicateMilestones(data)));
      }
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenCreate = (defaultType: MilestoneType = 'experience') => {
    setEditingId(null);
    setMilestoneType(defaultType);
    setRole('');
    setCompany('');
    setCompanyUrl('');
    setLocation('');
    setPeriod('');
    setIsCurrent(false);
    setHighlights([]);
    setDeliverableInput('');
    setTechStack([]);
    setTagInput('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setEditingId(exp.id);
    const normalizedType = extractMilestoneType(exp);
    setMilestoneType(normalizedType);
    setRole(exp.role);
    setCompany(exp.company);
    setCompanyUrl(exp.company_url || '');
    setLocation(exp.location || '');
    setPeriod(exp.period);
    setIsCurrent(exp.is_current);
    setHighlights(cleanHighlights(exp.highlights));
    setDeliverableInput('');
    setTechStack(exp.tech_stack || []);
    setTagInput('');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleAddDeliverable = () => {
    const val = deliverableInput.trim();
    if (!val) return;
    setHighlights((prev) => [...prev, val]);
    setDeliverableInput('');
  };

  const handleAddDeliverableKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDeliverable();
    }
  };

  const handleRemoveDeliverable = (idxToRemove: number) => {
    setHighlights((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && !techStack.includes(val)) {
        setTechStack([...techStack, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTechStack(techStack.filter((t) => t !== tagToRemove));
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!role || !company || !period) {
      setStatusMsg({ type: 'error', text: 'Please fill in Title/Role, Organization/Company, and Period.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Merge any pending sentence left in deliverableInput
      const rawHighlights = cleanHighlights(highlights);
      if (deliverableInput.trim()) {
        rawHighlights.push(deliverableInput.trim());
      }

      // Merge any pending tag left in tagInput
      const finalTech = [...techStack];
      if (tagInput.trim() && !finalTech.includes(tagInput.trim())) {
        finalTech.push(tagInput.trim());
      }

      // Embed metadata tag so milestone category is 100% preserved even if Supabase column milestone_type is missing
      const finalHighlights = [...rawHighlights, `__type:${milestoneType}`];

      const payloadWithMilestone = {
        milestone_type: milestoneType,
        role,
        company,
        company_url: companyUrl || null,
        location: location || null,
        period,
        is_current: isCurrent,
        highlights: finalHighlights,
        tech_stack: finalTech,
      };

      const payloadWithoutMilestone = {
        role,
        company,
        company_url: companyUrl || null,
        location: location || null,
        period,
        is_current: isCurrent,
        highlights: finalHighlights,
        tech_stack: finalTech,
      };

      if (editingId) {
        // UPDATE Operation
        let { error } = await supabase
          .from('experiences')
          .update(payloadWithMilestone)
          .eq('id', editingId);

        // If remote Supabase schema cache does not have milestone_type column yet, gracefully retry without it
        if (error && error.message.includes('milestone_type')) {
          const retry = await supabase
            .from('experiences')
            .update(payloadWithoutMilestone)
            .eq('id', editingId);
          error = retry.error;
        }

        if (error) {
          setStatusMsg({ type: 'error', text: `Update failed: ${error.message}` });
        } else {
          setStatusMsg({ type: 'success', text: `Milestone "${role} at ${company}" updated successfully!` });
          setIsFormOpen(false);
          setEditingId(null);
          await fetchExperiences();
        }
      } else {
        // CREATE Operation
        let { error } = await supabase.from('experiences').insert([
          {
            ...payloadWithMilestone,
            sort_order: experiences.length + 1,
          },
        ]);

        // If remote Supabase schema cache does not have milestone_type column yet, gracefully retry without it
        if (error && error.message.includes('milestone_type')) {
          const retry = await supabase.from('experiences').insert([
            {
              ...payloadWithoutMilestone,
              sort_order: experiences.length + 1,
            },
          ]);
          error = retry.error;
        }

        if (error) {
          setStatusMsg({ type: 'error', text: `Failed to create: ${error.message}` });
        } else {
          setStatusMsg({ type: 'success', text: `Milestone "${role} at ${company}" added to timeline!` });
          setIsFormOpen(false);
          setEditingId(null);
          await fetchExperiences();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExperience = async (id: string, roleName: string) => {
    if (!confirm(`Delete "${roleName}" from timeline?`)) return;

    const { error } = await supabase.from('experiences').delete().eq('id', id);

    if (error) {
      setStatusMsg({ type: 'error', text: `Delete failed: ${error.message}` });
    } else {
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      setStatusMsg({ type: 'success', text: `Removed "${roleName}".` });
      fetchExperiences();
    }
  };

  const uniqueExperiences = useMemo(() => {
    return deduplicateMilestones(experiences);
  }, [experiences]);

  const getTypeMeta = (type: MilestoneType) => {
    switch (type) {
      case 'education':
        return {
          label: 'Education',
          icon: GraduationCap,
          colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          titleLabel: 'Degree / Program / Certification *',
          orgLabel: 'University / Institution *',
          periodLabel: 'Graduation / Period *',
          highlightsLabel: 'Academic Focus & Honors (press Enter to add)',
          techLabel: 'Technologies & Frameworks (press Enter to add)',
          placeholderTitle: 'B.S. in Computer Science & Software Engineering',
          placeholderOrg: 'Academic Foundations',
          placeholderPeriod: '2018 — 2022',
        };
      case 'certification':
        return {
          label: 'Certification',
          icon: Award,
          colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          titleLabel: 'Credential / Certification Title *',
          orgLabel: 'Issuing Organization *',
          periodLabel: 'Issue Date / Validity Period *',
          highlightsLabel: 'Skills Validated & Credentials (press Enter to add)',
          techLabel: 'Technologies & Frameworks (press Enter to add)',
          placeholderTitle: 'AWS Certified Solutions Architect',
          placeholderOrg: 'Amazon Web Services (AWS)',
          placeholderPeriod: '2023 — Present',
        };
      case 'event':
        return {
          label: 'Event / Hackathon',
          icon: Trophy,
          colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          titleLabel: 'Role / Award / Project Name *',
          orgLabel: 'Event / Hackathon / Conference *',
          periodLabel: 'Event Date / Duration *',
          highlightsLabel: 'Accolades, Deliverables & Outcomes (press Enter to add)',
          techLabel: 'Technologies & Frameworks (press Enter to add)',
          placeholderTitle: 'Grand Prize Winner & Lead Architect',
          placeholderOrg: 'Global AI & Web3 Hackathon',
          placeholderPeriod: '2023',
        };
      default:
        return {
          label: 'Experience',
          icon: Briefcase,
          colorClass: 'text-[#ff1e27] bg-[#e50914]/10 border-[#e50914]/20',
          titleLabel: 'Job Title / Role *',
          orgLabel: 'Company / Studio *',
          periodLabel: 'Period / Dates *',
          highlightsLabel: 'Key Deliverables & Architecture (press Enter to add)',
          techLabel: 'Technologies & Frameworks (press Enter to add)',
          placeholderTitle: 'Lead Application Developer & Solutions Architect',
          placeholderOrg: 'Independent / Digital Studio',
          placeholderPeriod: '2024 — Present',
        };
    }
  };

  const currentMeta = getTypeMeta(milestoneType);

  return (
    <div className="space-y-6">
      {/* Header bar - Responsive on mobile & desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Career & Milestones Timeline</span>
            <Badge variant="crimson">{uniqueExperiences.length} Milestones</Badge>
          </h2>
          <p className="text-xs text-[#94949e] mt-0.5">
            Manage Experiences, Education, Certifications, and Hackathons/Events in <code className="text-[#ff1e27]">public.experiences</code>.
          </p>
        </div>

        <button
          onClick={() => {
            if (isFormOpen) {
              setIsFormOpen(false);
              setEditingId(null);
            } else {
              handleOpenCreate('experience');
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
              {editingId ? `Edit Milestone (${currentMeta.label})` : `New ${currentMeta.label} Milestone`}
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
            {/* Milestone Type Selector (4 categories) */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#94949e]">Milestone Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-[#0d0d10] border border-white/10 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMilestoneType('experience')}
                  className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                    milestoneType === 'experience'
                      ? 'bg-[#e50914] text-white'
                      : 'text-[#94949e] hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Experience</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMilestoneType('education')}
                  className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                    milestoneType === 'education'
                      ? 'bg-blue-600 text-white'
                      : 'text-[#94949e] hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Education</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMilestoneType('certification')}
                  className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                    milestoneType === 'certification'
                      ? 'bg-emerald-600 text-white'
                      : 'text-[#94949e] hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Certification</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMilestoneType('event')}
                  className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                    milestoneType === 'event'
                      ? 'bg-amber-600 text-white'
                      : 'text-[#94949e] hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Event</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">{currentMeta.titleLabel}</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={currentMeta.placeholderTitle}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0d10] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ff1e27]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">{currentMeta.orgLabel}</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={currentMeta.placeholderOrg}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0d10] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ff1e27]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Web Link / URL</label>
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0d10] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">{currentMeta.periodLabel}</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder={currentMeta.placeholderPeriod}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0d10] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ff1e27]"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-mono text-[#94949e]">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote / Toronto, Canada / San Francisco, CA"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0d10] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ff1e27]"
                />
              </div>
            </div>

            {/* Deliverables / Highlights list with sentence-by-sentence input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#94949e] flex items-center justify-between">
                <span>{currentMeta.highlightsLabel}</span>
                <span className="text-[10px] text-[#ff1e27]">{highlights.length} added</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={deliverableInput}
                  onChange={(e) => setDeliverableInput(e.target.value)}
                  onKeyDown={handleAddDeliverableKeyDown}
                  placeholder="Type a deliverable and press Enter (or click Add)..."
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0d0d10] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ff1e27]"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>

              {highlights.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-2 p-2 rounded-lg bg-[#0d0d10] border border-white/5 text-xs text-[#c4c4cc]"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-[#ff1e27] mt-0.5">{idx + 1}.</span>
                        <span className="break-words">{h}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-[#94949e] hover:text-[#ff1e27] transition-colors p-0.5 shrink-0"
                        title="Remove deliverable"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Technologies & Frameworks Chips */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#94949e]">{currentMeta.techLabel}</label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#0d0d10] border border-white/10 min-h-[42px] items-center">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1a1a24] text-xs font-mono text-white/90 border border-white/10"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tech)}
                      className="text-[#94949e] hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={techStack.length === 0 ? "Type tech and press Enter (e.g. React, Three.js)..." : ""}
                  className="flex-1 min-w-[120px] bg-transparent text-xs font-mono text-white focus:outline-none px-1"
                />
              </div>
            </div>

            {/* Bottom Form Actions with Right-Aligned Save Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#94949e]">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-white/20 bg-[#0d0d10] text-[#ff1e27] focus:ring-0 cursor-pointer"
                />
                <span>
                  {milestoneType === 'experience'
                    ? 'Present Position'
                    : milestoneType === 'education'
                    ? 'Currently Enrolled'
                    : milestoneType === 'certification'
                    ? 'Active Credential'
                    : 'Ongoing Event'}
                </span>
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
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : editingId ? 'Update Milestone' : 'Save Milestone'}</span>
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
      ) : uniqueExperiences.length === 0 ? (
        <div className="p-6 sm:p-8 rounded-xl bg-[#141419] border border-white/5 text-center space-y-3">
          <p className="text-xs sm:text-sm text-[#94949e]">No milestones found.</p>
          <button
            onClick={() => handleOpenCreate('experience')}
            className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            Add Milestone
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {uniqueExperiences.map((exp) => {
            const expType = extractMilestoneType(exp);
            const meta = getTypeMeta(expType);
            const IconComponent = meta.icon;
            const itemHighlights = cleanHighlights(exp.highlights);

            return (
              <div
                key={exp.id}
                className="p-4 sm:p-5 rounded-xl bg-[#141419] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`p-1.5 rounded-lg shrink-0 ${meta.colorClass}`}>
                      <IconComponent className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-none">{exp.role}</h3>
                    <span className="text-xs text-[#94949e]">at {exp.company}</span>
                    {exp.company_url && (
                      <a
                        href={exp.company_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#94949e] hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${meta.colorClass}`}>
                      {meta.label}
                    </span>
                    {exp.is_current && <Badge variant="emerald" dot>Active</Badge>}
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

                  {itemHighlights.length > 0 && (
                    <ul className="text-xs text-[#94949e] list-disc list-inside space-y-0.5 pt-1">
                      {itemHighlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  )}

                  {exp.tech_stack && exp.tech_stack.length > 0 && (
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
            );
          })}
        </div>
      )}
    </div>
  );
};
