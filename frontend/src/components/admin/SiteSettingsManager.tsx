import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { Json } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { DEFAULT_HERO_META, type HeroMetaConfig } from '../../types/siteMeta';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Globe, 
  Upload, 
  RotateCcw,
  Mail,
  Image as ImageIcon 
} from 'lucide-react';

export const SiteSettingsManager: React.FC = () => {
  const [config, setConfig] = useState<HeroMetaConfig>(DEFAULT_HERO_META);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      
      // Also update the active document favicon immediately
      if (config.browserIconUrl) {
        const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (link) {
          link.href = config.browserIconUrl;
        }
      }
    }
    setSaving(false);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB for browser icon)
    if (file.size > 2 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Icon file too large. Please upload an image under 2MB.' });
      return;
    }

    setUploadingIcon(true);
    setStatusMsg(null);

    try {
      const fileExt = file.name.split('.').pop() || 'svg';
      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        // Fallback to data URL if storage is offline or unconfigured
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setConfig((prev) => ({ ...prev, browserIconUrl: dataUrl }));
          setStatusMsg({
            type: 'success',
            text: 'Icon loaded from local file! Click "Save Site Settings" to persist.',
          });
          setUploadingIcon(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(filePath);

      setConfig((prev) => ({ ...prev, browserIconUrl: publicUrl }));
      setStatusMsg({
        type: 'success',
        text: 'Browser icon uploaded successfully! Click "Save Site Settings" to persist.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUploadingIcon(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetIcon = () => {
    setConfig((prev) => ({ ...prev, browserIconUrl: '/favicon.svg' }));
    setStatusMsg({
      type: 'success',
      text: 'Reset to default NS monogram icon (/favicon.svg). Save to persist.',
    });
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
            Modify Hero headlines, browser icon, availability status, and telemetry metrics stored in <code className="text-[#ff1e27]">public.site_meta</code>.
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
          {/* Section 1: Browser Tab Branding & Icon (Favicon) */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#ff1e27]" />
                <span>Browser Tab Branding &amp; Icon (Favicon)</span>
              </h3>
              <Badge variant="subtle">Client Tab</Badge>
            </div>

            <p className="text-xs text-[#94949e]">
              Controls the icon shown in the visitor&apos;s browser tab, bookmarks, and mobile home screen shortcuts.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Simulated Browser Tab Live Preview */}
              <div className="lg:col-span-5 p-3 rounded-lg bg-[#0d0d10] border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  {config.browserIconUrl ? (
                    <img
                      src={config.browserIconUrl}
                      alt="Favicon preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/favicon.svg';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#94949e]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">Nick Shahbaz — Solutions Architect</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#94949e] block truncate">
                    {config.browserIconUrl || '/favicon.svg'}
                  </span>
                </div>
              </div>

              {/* Controls: URL Input & Upload Action */}
              <div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={config.browserIconUrl || ''}
                    onChange={(e) => setConfig({ ...config, browserIconUrl: e.target.value })}
                    placeholder="/favicon.svg or https://..."
                    className="w-full bg-[#0d0d10] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27]"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,.png,.ico,.webp,.jpg"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingIcon}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-mono text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingIcon ? 'Uploading...' : 'Upload Icon'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetIcon}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-transparent hover:bg-white/5 border border-white/10 text-xs font-mono text-[#94949e] hover:text-white transition-colors cursor-pointer"
                    title="Reset to default favicon"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Availability & Location Status */}
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

          {/* Section 3: Hero Typography & Copy */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#ff1e27]" />
              <span>Hero Typography & Value Proposition</span>
            </h3>

            <div className="space-y-3.5">
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

          {/* Section 4: Engineering Metrics Ribbon */}
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

          {/* Section 5: Built-In Mailing Service & Inquiry Relay */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#141419] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#ff1e27]" />
                <span>Built-In Mailing Service &amp; Inquiry Relay</span>
              </h3>
              <Badge variant={config.isMailingServiceActive !== false ? 'emerald' : 'subtle'}>
                {config.isMailingServiceActive !== false ? 'Relay Active' : 'Relay Inactive'}
              </Badge>
            </div>

            <p className="text-xs text-[#94949e]">
              Controls whether the public contact form accepts project specifications. When toggled off, the public form displays a &quot;Temporarily Unavailable&quot; status and encourages visitors to reach out via direct email or social channels.
            </p>

            <div className="p-3.5 rounded-lg bg-[#0d0d10] border border-white/10 flex items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.isMailingServiceActive !== false}
                  onChange={(e) => setConfig({ ...config, isMailingServiceActive: e.target.checked })}
                  className="accent-[#e50914] rounded cursor-pointer w-4 h-4"
                />
                <span className="text-xs font-mono text-white">
                  {config.isMailingServiceActive !== false
                    ? 'Accept Inquiries (Form Active)'
                    : 'Pause Inquiries (Display Temporarily Unavailable)'}
                </span>
              </label>

              <span className={`text-[11px] font-mono ${config.isMailingServiceActive !== false ? 'text-emerald-400' : 'text-amber-400'}`}>
                {config.isMailingServiceActive !== false ? '● Accepting Submissions' : '○ Form Offline'}
              </span>
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
