import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Json } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { DEFAULT_HERO_META, type HeroMetaConfig } from '../../types/siteMeta';
import { Settings, Save, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const SiteSettingsManager: React.FC = () => {
  const [config, setConfig] = useState<HeroMetaConfig>(DEFAULT_HERO_META);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_meta')
        .select('*')
        .eq('key', 'hero')
        .maybeSingle();

      if (ignore) return;
      if (error) {
        setStatusMsg({ type: 'error', text: `Fetch failed: ${error.message}` });
      } else if (data && data.value) {
        setConfig({ ...DEFAULT_HERO_META, ...(data.value as Partial<HeroMetaConfig>) });
      }
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const { error } = await supabase
      .from('site_meta')
      .upsert(
        {
          key: 'hero',
          value: config as unknown as Json,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      setStatusMsg({ type: 'error', text: `Save failed: ${error.message}` });
    } else {
      setStatusMsg({ type: 'success', text: 'Hero & Site Settings updated successfully in database!' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar - Responsive on mobile & desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Hero & Global Site Settings</span>
            <Badge variant="crimson">Dynamic CMS</Badge>
          </h2>
          <p className="text-xs text-[#94949e] mt-0.5">
            Modify Hero headlines, live availability status, and metrics stored in <code className="text-[#ff1e27]">public.site_meta</code>.
          </p>
        </div>
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
          <span>{statusMsg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 sm:p-12 text-center text-xs font-mono text-[#94949e] space-y-2">
          <div className="w-5 h-5 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Syncing settings from Supabase...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Availability & Location Status */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff1e27]" />
              <span>Status & Telemetry Settings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Location & Timezone</label>
                <input
                  type="text"
                  required
                  value={config.location}
                  onChange={(e) => setConfig({ ...config, location: e.target.value })}
                  placeholder="Toronto, CA • UTC-5"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Status Text</label>
                <input
                  type="text"
                  required
                  value={config.statusText}
                  onChange={(e) => setConfig({ ...config, statusText: e.target.value })}
                  placeholder="Open for Select Contracts"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#94949e]">
                  <input
                    type="checkbox"
                    checked={config.isAvailable}
                    onChange={(e) => setConfig({ ...config, isAvailable: e.target.checked })}
                    className="accent-[#e50914] rounded cursor-pointer w-4 h-4"
                  />
                  <span>Activate Status Text</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Hero Typography & Copy */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#ff1e27]" />
              <span>Hero Typography & Value Proposition</span>
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Eyebrow Badge Text</label>
                <input
                  type="text"
                  value={config.eyebrow}
                  onChange={(e) => setConfig({ ...config, eyebrow: e.target.value })}
                  placeholder="FULL-STACK ARCHITECTURE & DIGITAL CRAFT"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#94949e]">Headline (Primary White Text)</label>
                  <input
                    type="text"
                    required
                    value={config.headlinePrefix}
                    onChange={(e) => setConfig({ ...config, headlinePrefix: e.target.value })}
                    placeholder="Architecting Next-Gen"
                    className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#94949e]">Headline Highlight (Crimson Gradient)</label>
                  <input
                    type="text"
                    required
                    value={config.headlineGradient}
                    onChange={(e) => setConfig({ ...config, headlineGradient: e.target.value })}
                    placeholder="Applications & 3D Systems."
                    className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Hero Description / Bio Pitch</label>
                <textarea
                  required
                  rows={3}
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Engineering Metrics Ribbon */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff1e27]" />
              <span>Metrics & Ribbon Stats</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Metric 1: Years Experience</label>
                <input
                  type="text"
                  value={config.metricYears}
                  onChange={(e) => setConfig({ ...config, metricYears: e.target.value })}
                  placeholder="5+ Years"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Metric 2: Production Reliability</label>
                <input
                  type="text"
                  value={config.metricUptime}
                  onChange={(e) => setConfig({ ...config, metricUptime: e.target.value })}
                  placeholder="99.9%"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Metric 3: Edge Routing</label>
                <input
                  type="text"
                  value={config.metricLatency}
                  onChange={(e) => setConfig({ ...config, metricLatency: e.target.value })}
                  placeholder="< 50ms"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94949e]">Metric 4: WebGL Engine</label>
                <input
                  type="text"
                  value={config.metricWebgl}
                  onChange={(e) => setConfig({ ...config, metricWebgl: e.target.value })}
                  placeholder="60 FPS"
                  className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e50914] hover:bg-[#ff1e27] text-white text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving to Database...' : 'Save Site Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
