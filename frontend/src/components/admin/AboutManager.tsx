import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Json } from '../../types/database.types';
import { 
  DEFAULT_ABOUT_META, 
  type AboutMetaConfig, 
  type SkillCategory, 
  type SkillItem, 
  type PhilosophyItem, 
  type AboutStatItem 
} from '../../types/siteMeta';
import { Badge } from '../common/Badge';
import { normalizeTechName } from '../../lib/timelineUtils';
import { 
  User, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Cpu,
  Copy,
  Undo2,
  Edit2,
  Check
} from 'lucide-react';

const SKILL_CATEGORIES: SkillCategory[] = [
  'Languages',
  'Frontend & 3D',
  'Backend & Cloud',
  'Systems & DevOps',
];

let idCounter = 0;
function generateUniqueId(prefix: string = 'sk'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export const AboutManager: React.FC = () => {
  const [config, setConfig] = useState<AboutMetaConfig>(DEFAULT_ABOUT_META);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active section tab inside About CMS
  const [activeSubTab, setActiveSubTab] = useState<'narrative' | 'stats' | 'principles' | 'skills'>('narrative');

  // Bio paragraphs as single multi-line textarea string
  const [bioInput, setBioInput] = useState('');

  // Skills Filter in CMS
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('All');

  // New Skill form state (modal)
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Frontend & 3D');
  const [newSkillLevel, setNewSkillLevel] = useState(90);
  const [newSkillYears, setNewSkillYears] = useState('3 yrs');
  const [newSkillFeatured, setNewSkillFeatured] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Quick Add State (Inline Bar)
  const [quickSkillName, setQuickSkillName] = useState('');
  const [quickSkillCategory, setQuickSkillCategory] = useState<SkillCategory>('Frontend & 3D');
  const [quickSkillLevel, setQuickSkillLevel] = useState(90);
  const [quickSkillYears, setQuickSkillYears] = useState('3 yrs');

  // Dynamic Editing & Deletion Management
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastDeletedSkill, setLastDeletedSkill] = useState<SkillItem | null>(null);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_meta')
        .select('*')
        .eq('key', 'about')
        .maybeSingle();

      if (ignore) return;
      if (error) {
        setStatusMsg({ type: 'error', text: `Fetch failed: ${error.message}` });
      } else if (data && data.value) {
        const val = data.value as unknown as Partial<AboutMetaConfig>;
        const rawSkills = Array.isArray(val.skills) ? val.skills : DEFAULT_ABOUT_META.skills;
        const normalizedSkills: SkillItem[] = rawSkills.map((s, idx) => ({
          ...s,
          id: s.id || `sk-${idx}-${s.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        }));

        let prefix = val.headlinePrefix;
        let gradient = val.headlineGradient;

        if (!prefix && !gradient && val.headline) {
          const lower = val.headline.toLowerCase();
          if (lower.includes('about me')) {
            const idx = lower.indexOf('about me');
            prefix = val.headline.slice(0, idx).trim();
            gradient = val.headline.slice(idx).trim();
          } else if (val.headline.includes('&')) {
            const parts = val.headline.split('&');
            prefix = `${parts[0].trim()} &`;
            gradient = parts.slice(1).join('&').trim();
          } else {
            prefix = val.headline;
            gradient = '';
          }
        }

        const merged: AboutMetaConfig = {
          ...DEFAULT_ABOUT_META,
          ...val,
          headlinePrefix: prefix ?? DEFAULT_ABOUT_META.headlinePrefix,
          headlineGradient: gradient ?? DEFAULT_ABOUT_META.headlineGradient,
          headline: val.headline ?? `${prefix ?? ''} ${gradient ?? ''}`.trim(),
          stats: Array.isArray(val.stats) ? val.stats : DEFAULT_ABOUT_META.stats,
          principles: Array.isArray(val.principles) ? val.principles : DEFAULT_ABOUT_META.principles,
          skills: normalizedSkills,
          bioParagraphs: Array.isArray(val.bioParagraphs) ? val.bioParagraphs : DEFAULT_ABOUT_META.bioParagraphs,
        };
        setConfig(merged);
        setBioInput(merged.bioParagraphs.join('\n\n'));
      } else {
        const defaultSkillsWithIds: SkillItem[] = DEFAULT_ABOUT_META.skills.map((s, idx) => ({
          ...s,
          id: s.id || `sk-${idx}-${s.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
        }));
        setConfig({ ...DEFAULT_ABOUT_META, skills: defaultSkillsWithIds });
        setBioInput(DEFAULT_ABOUT_META.bioParagraphs.join('\n\n'));
      }
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-media')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      setStatusMsg({ type: 'error', text: `Avatar upload failed: ${uploadError.message}` });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-media')
      .getPublicUrl(filePath);

    setConfig((prev) => ({ ...prev, avatarUrl: publicUrl }));
    setUploading(false);
    setStatusMsg({ type: 'success', text: 'Avatar uploaded successfully!' });
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const parsedParagraphs = bioInput
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const updatedConfig: AboutMetaConfig = {
      ...config,
      headlinePrefix: config.headlinePrefix || DEFAULT_ABOUT_META.headlinePrefix,
      headlineGradient: config.headlineGradient || DEFAULT_ABOUT_META.headlineGradient,
      headline: config.headline || `${config.headlinePrefix || ''} ${config.headlineGradient || ''}`.trim(),
      bioParagraphs: parsedParagraphs.length > 0 ? parsedParagraphs : DEFAULT_ABOUT_META.bioParagraphs,
      skills: (config.skills || []).map((s) => ({
        ...s,
        name: normalizeTechName(s.name),
      })),
    };

    const { error } = await supabase
      .from('site_meta')
      .upsert(
        {
          key: 'about',
          value: updatedConfig as unknown as Json,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      setStatusMsg({ type: 'error', text: `Save failed: ${error.message}` });
    } else {
      setConfig(updatedConfig);
      setHasUnsavedChanges(false);
      setStatusMsg({ type: 'success', text: 'About Me, Skills Matrix & Philosophy saved successfully!' });
    }
    setSaving(false);
  };

  const handleResetDefaults = () => {
    if (!confirm('Reset About & Skills to recommended defaults? Any custom edits will be replaced.')) return;
    const defaultSkillsWithIds: SkillItem[] = DEFAULT_ABOUT_META.skills.map((s, idx) => ({
      ...s,
      id: `sk-${idx}-${s.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
    }));
    setConfig({ ...DEFAULT_ABOUT_META, skills: defaultSkillsWithIds });
    setBioInput(DEFAULT_ABOUT_META.bioParagraphs.join('\n\n'));
    setHasUnsavedChanges(true);
    setStatusMsg({ type: 'success', text: 'Defaults reloaded. Click "Save Changes" to commit.' });
  };

  // Stats Handlers
  const handleStatChange = (idx: number, field: keyof AboutStatItem, val: string) => {
    const updated = [...config.stats];
    updated[idx] = { ...updated[idx], [field]: val };
    setConfig({ ...config, stats: updated });
    setHasUnsavedChanges(true);
  };

  const handleAddStat = () => {
    setConfig({
      ...config,
      stats: [...config.stats, { label: 'New Metric', value: '100%', subtext: 'Performance benchmark' }],
    });
    setHasUnsavedChanges(true);
  };

  const handleRemoveStat = (idx: number) => {
    setConfig({
      ...config,
      stats: config.stats.filter((_, i) => i !== idx),
    });
    setHasUnsavedChanges(true);
  };

  // Principles Handlers
  const handlePrincipleChange = (idx: number, field: keyof PhilosophyItem, val: string) => {
    const updated = [...config.principles];
    updated[idx] = { ...updated[idx], [field]: val };
    setConfig({ ...config, principles: updated });
    setHasUnsavedChanges(true);
  };

  const handleAddPrinciple = () => {
    const newId = generateUniqueId('p');
    setConfig({
      ...config,
      principles: [
        ...config.principles,
        { id: newId, title: 'New Core Principle', description: 'Description of architectural value.', badge: 'Standard' },
      ],
    });
    setHasUnsavedChanges(true);
  };

  const handleRemovePrinciple = (idx: number) => {
    setConfig({
      ...config,
      principles: config.principles.filter((_, i) => i !== idx),
    });
    setHasUnsavedChanges(true);
  };

  // Skills Handlers
  const handleUpdateSkill = (skillId: string, updates: Partial<SkillItem>) => {
    setConfig((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === skillId || s.name === skillId ? { ...s, ...updates } : s)),
    }));
    setHasUnsavedChanges(true);
  };

  const handleDuplicateSkill = (skill: SkillItem) => {
    const clone: SkillItem = {
      ...skill,
      id: generateUniqueId('sk'),
      name: `${skill.name} (Copy)`,
    };
    setConfig((prev) => ({
      ...prev,
      skills: [...prev.skills, clone],
    }));
    setStatusMsg({ type: 'success', text: `Duplicated "${skill.name}". Click "Save Changes" to commit.` });
    setHasUnsavedChanges(true);
  };

  const handleQuickAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickSkillName.trim()) return;

    const trimmed = quickSkillName.trim();
    const newSkill: SkillItem = {
      id: generateUniqueId('sk'),
      name: trimmed,
      category: quickSkillCategory,
      level: Number(quickSkillLevel),
      years: quickSkillYears.trim() || '1 yr',
      featured: false,
    };

    setConfig((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
    setQuickSkillName('');
    setStatusMsg({ type: 'success', text: `Added "${trimmed}". Click "Save Changes" to commit.` });
    setHasUnsavedChanges(true);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: SkillItem = {
      id: generateUniqueId('sk'),
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: Number(newSkillLevel),
      years: newSkillYears.trim() || '1 yr',
      featured: newSkillFeatured,
    };

    setConfig((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));

    setNewSkillName('');
    setIsAddingSkill(false);
    setStatusMsg({ type: 'success', text: `Added "${newSkill.name}". Click "Save Changes" to commit.` });
    setHasUnsavedChanges(true);
  };

  const handleRemoveSkill = (skillId: string, skillName: string) => {
    const target = config.skills.find((s) => s.id === skillId || s.name === skillId);
    if (!target) return;

    setLastDeletedSkill(target);
    setConfig((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== skillId && s.name !== skillId),
    }));
    setDeletingSkillId(null);
    setStatusMsg({
      type: 'success',
      text: `Removed "${skillName}". Click "Undo" below or "Save Changes" to commit.`,
    });
    setHasUnsavedChanges(true);
  };

  const handleUndoDeleteSkill = () => {
    if (!lastDeletedSkill) return;
    setConfig((prev) => ({
      ...prev,
      skills: [...prev.skills, lastDeletedSkill],
    }));
    setStatusMsg({ type: 'success', text: `Restored "${lastDeletedSkill.name}".` });
    setLastDeletedSkill(null);
    setHasUnsavedChanges(true);
  };

  const handleToggleSkillFeatured = (skillId: string) => {
    setConfig((prev) => ({
      ...prev,
      skills: prev.skills.map((s) =>
        s.id === skillId || s.name === skillId ? { ...s, featured: !s.featured } : s
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const filteredSkills = config.skills.filter((s) => {
    if (selectedSkillCategory === 'All') return true;
    return s.category === selectedSkillCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>About, Skills Matrix & Philosophy</span>
            <Badge variant="crimson">CMS Active</Badge>
          </h2>
          <p className="text-xs text-[#94949e] mt-0.5">
            Manage narrative, telemetry stats, core principles, and skills in <code className="text-[#ff1e27]">site_meta.about</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141419] hover:bg-[#1a1a24] text-xs font-mono text-[#94949e] hover:text-white border border-white/10 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
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

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('narrative')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeSubTab === 'narrative'
              ? 'bg-[#e50914]/20 text-[#ff1e27] font-semibold border border-[#e50914]/30'
              : 'text-[#94949e] hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Bio & Narrative</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeSubTab === 'stats'
              ? 'bg-[#e50914]/20 text-[#ff1e27] font-semibold border border-[#e50914]/30'
              : 'text-[#94949e] hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Quick Stats ({config.stats.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('principles')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeSubTab === 'principles'
              ? 'bg-[#e50914]/20 text-[#ff1e27] font-semibold border border-[#e50914]/30'
              : 'text-[#94949e] hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Principles ({config.principles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('skills')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeSubTab === 'skills'
              ? 'bg-[#e50914]/20 text-[#ff1e27] font-semibold border border-[#e50914]/30'
              : 'text-[#94949e] hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Skills Matrix ({config.skills.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 sm:p-12 text-center text-xs font-mono text-[#94949e] space-y-2">
          <div className="w-5 h-5 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Syncing About metadata from Supabase...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================================================================= */}
          {/* TAB 1: BIO & NARRATIVE */}
          {/* ================================================================= */}
          {activeSubTab === 'narrative' && (
            <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#ff1e27]" />
                Personal Narrative & Profile Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-mono text-[#94949e]">Location & Base</label>
                  <input
                    type="text"
                    value={config.location}
                    onChange={(e) => setConfig({ ...config, location: e.target.value })}
                    className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                  />
                </div>

                {/* Headline & Typography Settings (Structured like Site Settings) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:col-span-2">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#94949e]">Headline (Primary White Text)</label>
                    <input
                      type="text"
                      value={config.headlinePrefix ?? ''}
                      onChange={(e) => {
                        const prefix = e.target.value;
                        setConfig({
                          ...config,
                          headlinePrefix: prefix,
                          headline: `${prefix} ${config.headlineGradient ?? ''}`.trim(),
                        });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Here are some things you want to know"
                      className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#94949e]">Headline Highlight (Crimson Gradient)</label>
                    <input
                      type="text"
                      value={config.headlineGradient ?? ''}
                      onChange={(e) => {
                        const grad = e.target.value;
                        setConfig({
                          ...config,
                          headlineGradient: grad,
                          headline: `${config.headlinePrefix ?? ''} ${grad}`.trim(),
                        });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="about me."
                      className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-mono text-[#94949e]">Availability Callout Note</label>
                  <input
                    type="text"
                    value={config.availabilityNote}
                    onChange={(e) => setConfig({ ...config, availabilityNote: e.target.value })}
                    className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                  />
                </div>
              </div>

              {/* Avatar Image Uploader */}
              <div className="p-4 rounded-lg bg-[#0d0d10] border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-mono text-white flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#ff1e27]" />
                    <span>Profile Portrait / Avatar Image</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#94949e]">
                    Leave empty to use high-tech NS cyber monogram badge
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-white/10 bg-[#16161e] flex items-center justify-center overflow-hidden shrink-0">
                    {config.avatarUrl ? (
                      <img src={config.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#ff1e27]">NS</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="text-xs text-[#94949e] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-[#1f1f28] file:text-white hover:file:bg-[#282836] cursor-pointer"
                    />
                    {uploading && <p className="text-xs text-[#ff1e27] font-mono">Uploading avatar...</p>}

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Or enter image URL: https://..."
                        value={config.avatarUrl || ''}
                        onChange={(e) => setConfig({ ...config, avatarUrl: e.target.value || null })}
                        className="w-full bg-[#16161e] border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                      />
                      {config.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, avatarUrl: null })}
                          className="px-2 py-1 text-[10px] font-mono rounded bg-red-950/40 text-[#ff6b72] hover:bg-red-900/40 border border-red-500/20 cursor-pointer shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Paragraphs */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#94949e]">Bio Paragraphs (separate paragraphs with blank line)</label>
                  <span className="text-[10px] font-mono text-[#94949e]">Markdown supported</span>
                </div>
                <textarea
                  rows={6}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Paragraph 1...&#10;&#10;Paragraph 2..."
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27] font-sans leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: QUICK STATS */}
          {/* ================================================================= */}
          {activeSubTab === 'stats' && (
            <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff1e27]" />
                  Telemetry Quick Stats ({config.stats.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddStat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Metric</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {config.stats.map((stat, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#0d0d10] border border-white/10 space-y-2.5 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#94949e]">
                        Metric #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStat(idx)}
                        className="text-[#94949e] hover:text-[#ff1e27] transition-colors cursor-pointer"
                        title="Remove metric"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-mono text-[#94949e]">Value (e.g. 5+, 99.9%)</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                          className="w-full bg-[#16161e] border border-white/10 rounded px-2.5 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#ff1e27]"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-mono text-[#94949e]">Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                          className="w-full bg-[#16161e] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
                        />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-mono text-[#94949e]">Subtext</label>
                      <input
                        type="text"
                        value={stat.subtext}
                        onChange={(e) => handleStatChange(idx, 'subtext', e.target.value)}
                        className="w-full bg-[#16161e] border border-white/10 rounded px-2.5 py-1 text-xs text-[#94949e] focus:outline-none focus:border-[#ff1e27]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: PRINCIPLES */}
          {/* ================================================================= */}
          {activeSubTab === 'principles' && (
            <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff1e27]" />
                  Engineering Principles & Philosophy ({config.principles.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddPrinciple}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Principle</span>
                </button>
              </div>

              <div className="space-y-3">
                {config.principles.map((pr, idx) => (
                  <div key={pr.id || idx} className="p-4 rounded-lg bg-[#0d0d10] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#e50914]/15 text-[#ff1e27] text-[10px] font-mono flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-mono text-white font-semibold">Principle #{idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePrinciple(idx)}
                        className="text-[#94949e] hover:text-[#ff1e27] transition-colors cursor-pointer"
                        title="Remove principle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-0.5 sm:col-span-2">
                        <label className="text-[10px] font-mono text-[#94949e]">Principle Title</label>
                        <input
                          type="text"
                          value={pr.title}
                          onChange={(e) => handlePrincipleChange(idx, 'title', e.target.value)}
                          className="w-full bg-[#16161e] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-mono text-[#94949e]">Badge Tag</label>
                        <input
                          type="text"
                          value={pr.badge}
                          onChange={(e) => handlePrincipleChange(idx, 'badge', e.target.value)}
                          className="w-full bg-[#16161e] border border-white/10 rounded px-3 py-1.5 text-xs font-mono text-[#ff1e27] focus:outline-none focus:border-[#ff1e27]"
                        />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-mono text-[#94949e]">Description & Architectural Context</label>
                      <textarea
                        rows={2}
                        value={pr.description}
                        onChange={(e) => handlePrincipleChange(idx, 'description', e.target.value)}
                        className="w-full bg-[#16161e] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: SKILLS MATRIX */}
          {/* ================================================================= */}
          {activeSubTab === 'skills' && (
            <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-5">
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff1e27]" />
                    <span>Skills Matrix &amp; Technical Stack ({config.skills.length})</span>
                    {hasUnsavedChanges && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] text-amber-300 font-mono">
                        Unsaved Edits
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-[#94949e] mt-0.5">
                    Drag the proficiency sliders live, produce items with quick-add or 1-click presets, and click ★ to feature.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {lastDeletedSkill && (
                    <button
                      type="button"
                      onClick={handleUndoDeleteSkill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50 text-xs font-mono cursor-pointer transition-colors"
                      title="Undo last deleted skill"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Undo Delete ({lastDeletedSkill.name})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsAddingSkill((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingSkill ? 'Close Form' : 'Full Add Form'}</span>
                  </button>
                </div>
              </div>

              {/* High-Efficiency Quick-Add Bar (Always available for instant addition) */}
              <form onSubmit={handleQuickAddSkill} className="p-3 sm:p-4 rounded-xl bg-[#0d0d10] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#94949e]">
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff1e27]" />
                    Quick Add Skill
                  </span>
                  <span className="text-[11px] text-[#5a5a66]">Press Enter or click Add</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  <div className="sm:col-span-5 relative">
                    <input
                      type="text"
                      value={quickSkillName}
                      onChange={(e) => setQuickSkillName(e.target.value)}
                      placeholder="Skill / Technology Name (e.g. Next.js, Rust)..."
                      className="w-full bg-[#16161e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={quickSkillCategory}
                      onChange={(e) => setQuickSkillCategory(e.target.value as SkillCategory)}
                      className="w-full bg-[#16161e] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
                    >
                      {SKILL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={quickSkillYears}
                      onChange={(e) => setQuickSkillYears(e.target.value)}
                      placeholder="e.g. 3 yrs"
                      className="w-full bg-[#16161e] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={!quickSkillName.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Live Proficiency Drag on Quick-Add */}
                <div className="flex items-center gap-3 pt-1">
                  <label className="text-[11px] font-mono text-[#94949e] shrink-0">
                    Proficiency: <span className="text-[#ff1e27] font-bold">{quickSkillLevel}%</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={quickSkillLevel}
                    onChange={(e) => setQuickSkillLevel(Number(e.target.value))}
                    className="w-40 sm:w-64 accent-[#e50914] cursor-pointer"
                    title={`Drag to adjust proficiency (${quickSkillLevel}%)`}
                  />
                </div>
              </form>

              {/* Full Modal Form (if opened) */}
              {isAddingSkill && (
                <form onSubmit={handleAddSkill} className="p-4 rounded-xl bg-[#0d0d10] border border-[#ff1e27]/40 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff1e27]" />
                    <span>New Skill Formulation (Full Details)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-0.5 sm:col-span-2">
                      <label className="text-[10px] font-mono text-[#94949e]">Technology / Skill Name *</label>
                      <input
                        type="text"
                        required
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="e.g. Next.js, Rust, Docker"
                        className="w-full bg-[#16161e] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-mono text-[#94949e]">Category *</label>
                      <select
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                        className="w-full bg-[#16161e] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
                      >
                        {SKILL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-mono text-[#94949e]">Experience (Years)</label>
                      <input
                        type="text"
                        value={newSkillYears}
                        onChange={(e) => setNewSkillYears(e.target.value)}
                        placeholder="e.g. 4 yrs"
                        className="w-full bg-[#16161e] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-mono text-[#94949e]">Proficiency ({newSkillLevel}%)</label>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={newSkillLevel}
                          onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                          className="accent-[#e50914] cursor-pointer w-48"
                          title={`Drag to adjust proficiency (${newSkillLevel}%)`}
                        />
                      </div>

                      <label className="flex items-center gap-1.5 text-xs text-[#94949e] cursor-pointer pt-3">
                        <input
                          type="checkbox"
                          checked={newSkillFeatured}
                          onChange={(e) => setNewSkillFeatured(e.target.checked)}
                          className="accent-[#e50914] rounded cursor-pointer"
                        />
                        <span>Featured Chip</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingSkill(false)}
                        className="px-3 py-1.5 rounded-lg bg-[#1a1a24] text-xs font-mono text-[#94949e] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#e50914] text-xs font-mono text-white font-medium hover:bg-[#ff1e27]"
                      >
                        Save Skill
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Category Filter Pills */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['All', ...SKILL_CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedSkillCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer shrink-0 ${
                        selectedSkillCategory === cat
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-[#94949e] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat} ({cat === 'All' ? config.skills.length : config.skills.filter((s) => s.category === cat).length})
                    </button>
                  ))}
                </div>

                <span className="text-[11px] font-mono text-[#5a5a66]">
                  Showing {filteredSkills.length} skills
                </span>
              </div>

              {/* Skills Grid with Dynamic Draggable Proficiency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredSkills.map((sk) => {
                  const sId = sk.id || sk.name;
                  const isDeleting = deletingSkillId === sId;
                  const isEditing = editingSkillId === sId;

                  return (
                    <div
                      key={sId}
                      className={`p-3.5 rounded-xl bg-[#0d0d10] border transition-all ${
                        isDeleting
                          ? 'border-[#ff1e27]/80 bg-[#ff1e27]/5'
                          : 'border-white/10 hover:border-white/20'
                      } flex flex-col justify-between gap-3 group`}
                    >
                      {/* Top: Star, Name, Years, Edit toggle */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSkillFeatured(sId)}
                              className={`text-xs cursor-pointer ${sk.featured ? 'text-amber-400' : 'text-white/20 hover:text-white/60'}`}
                              title={sk.featured ? 'Featured skill' : 'Click to feature'}
                            >
                              ★
                            </button>

                            {isEditing ? (
                              <input
                                type="text"
                                value={sk.name}
                                onChange={(e) => handleUpdateSkill(sId, { name: e.target.value })}
                                className="w-full bg-[#16161e] border border-white/20 rounded px-1.5 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-[#ff1e27]"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white truncate" title={sk.name}>
                                {sk.name}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isEditing ? (
                              <input
                                type="text"
                                value={sk.years}
                                onChange={(e) => handleUpdateSkill(sId, { years: e.target.value })}
                                placeholder="yrs"
                                className="w-14 bg-[#16161e] border border-white/20 rounded px-1 py-0.5 text-[10px] font-mono text-[#94949e] focus:outline-none"
                              />
                            ) : (
                              <span className="text-[10px] font-mono text-[#94949e]">({sk.years})</span>
                            )}
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-[#5a5a66] flex items-center justify-between">
                          <span>{sk.category}</span>
                          {sk.featured && <span className="text-amber-400/80">★ Featured</span>}
                        </div>
                      </div>

                      {/* Proficiency & Range Scroll Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#94949e]">Proficiency</span>
                          <span className="text-[#ff1e27] font-bold">{sk.level}%</span>
                        </div>

                        <input
                          type="range"
                          min="20"
                          max="100"
                          step="1"
                          value={sk.level}
                          onChange={(e) => handleUpdateSkill(sId, { level: Number(e.target.value) })}
                          className="w-full accent-[#e50914] cursor-pointer"
                          title={`Drag to adjust ${sk.name} proficiency (${sk.level}%)`}
                        />
                      </div>

                      {/* Action Bar: Duplicate, Edit Inline, Delete Confirmation */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingSkillId(isEditing ? null : sId)}
                            className="p-1 rounded text-[#94949e] hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                            title={isEditing ? 'Done Editing' : 'Edit Name & Years'}
                          >
                            {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateSkill(sk)}
                            className="p-1 rounded text-[#94949e] hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                            title="Duplicate skill item"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Deletion with Clean Confirmation State */}
                        {isDeleting ? (
                          <div className="flex items-center gap-1 animate-fadeIn">
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(sId, sk.name)}
                              className="px-2 py-0.5 rounded bg-[#ff1e27] text-white text-[10px] font-mono font-bold hover:bg-[#d91921] cursor-pointer"
                            >
                              Delete?
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingSkillId(null)}
                              className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono hover:bg-white/20 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingSkillId(sId)}
                            className="p-1 rounded text-[#94949e] hover:text-[#ff1e27] hover:bg-[#ff1e27]/10 cursor-pointer transition-colors"
                            title="Delete skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Right Save Button (Just like SiteSettingsManager) */}
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={saving}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-xs font-mono font-medium transition-all cursor-pointer disabled:opacity-50 ${
                hasUnsavedChanges
                  ? 'bg-[#ff1e27] hover:bg-[#d91921] shadow-[0_0_15px_rgba(255,30,39,0.4)]'
                  : 'bg-[#e50914] hover:bg-[#ff1e27]'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving to Database...' : hasUnsavedChanges ? 'Save Unsaved Changes*' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};