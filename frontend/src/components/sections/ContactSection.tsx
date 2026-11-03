import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Send,
  Check,
  Copy,
  Clock,
  MapPin,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  Loader2,
} from 'lucide-react';
import { 
  type ContactFormPayload,
  validateContactPayload 
} from '../../types/contact';
import { submitContactInquiry } from '../../lib/contactService';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { useSiteMeta } from '../../hooks/useSiteMeta';
import { DEFAULT_HERO_META, type HeroMetaConfig } from '../../types/siteMeta';

// Custom SVG Icons for Brands
const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const DIRECT_EMAIL = 'nickshahbaz135@gmail.com';

const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    url: 'https://github.com/Shazzz135',
    handle: '@Shazzz135',
    icon: GithubIcon,
    description: 'Repositories, open-source work & CI architectures',
  },
  {
    name: 'X (Twitter)',
    url: 'https://x.com/Shazzz135',
    handle: '@Shazzz135',
    icon: XIcon,
    description: 'Engineering notes, 3D explorations & dev updates',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/nick-shahbaz-b258b8241/',
    handle: 'nick-shahbaz',
    icon: LinkedinIcon,
    description: 'Professional career history, endorsements & network',
  },
];

export const ContactSection: React.FC = () => {
  const { scrollTo } = useSmoothScroll();
  const formId = useId();

  // Admin Site Meta (for Mailing Service active toggle)
  const { data: rawHeroData } = useSiteMeta('hero', DEFAULT_HERO_META);
  const hero = { ...DEFAULT_HERO_META, ...rawHeroData } as HeroMetaConfig;
  const isMailingActive = hero.isMailingServiceActive !== false;

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // UI / Status State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [torontoTime, setTorontoTime] = useState('');

  // Live Toronto Time Clock (America/Toronto • UTC-5)
  useEffect(() => {
    const updateTime = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Toronto',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date());
        setTorontoTime(formatted);
      } catch {
        setTorontoTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Copy Direct Email to Clipboard
  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(DIRECT_EMAIL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = DIRECT_EMAIL;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setStatusMessage('');

    if (!isMailingActive) {
      setSubmitStatus('error');
      setStatusMessage('Mailing service is temporarily unavailable. Please reach out via direct email.');
      return;
    }

    const payload: ContactFormPayload = {
      name,
      email,
      message,
      honeypot,
    };

    // Client-side validation check
    const validation = validateContactPayload(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await submitContactInquiry(payload);
      if (response.success) {
        setSubmitStatus('success');
        setStatusMessage(response.message);
        // Reset form inputs on success
        setName('');
        setEmail('');
        setMessage('');
        setHoneypot('');
      } else {
        setSubmitStatus('error');
        setStatusMessage(response.message || 'Transmission failed. Please try again.');
        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch (err: unknown) {
      setSubmitStatus('error');
      const msg = err instanceof Error ? err.message : 'Transmission error. Please try again.';
      setStatusMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrollToTop = () => {
    scrollTo(0);
  };

  return (
    <section
      id="contact"
      className="relative w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-[#e50914]/5 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight"
        >
          Please reach out to <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#ff1e27] via-[#ff6b72] to-white bg-clip-text text-transparent">
            me directly
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-[#94949e] font-sans leading-relaxed"
        >
          I'm open to discussing work, collaborations, or even just a simple coffee chat. 
        </motion.p>
      </div>

      {/* Main Grid: Form (7 cols) + Peripheral Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Contact Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-[#0c0c0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top edge crimson accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff1e27] to-transparent opacity-80" />

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Send className="w-5 h-5 text-[#ff1e27]" />
                Contact Me
              </h3>
              <p className="text-xs font-mono text-[#94949e] mt-1">
                Direct relay to personal inbox
              </p>
            </div>
            {isMailingActive ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                <span>Active Channel</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Temporarily Unavailable</span>
              </div>
            )}
          </div>

          {!isMailingActive ? (
            <div className="py-10 sm:py-14 px-4 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-xl font-bold text-white tracking-tight">
                  Mailing Service Temporarily Unavailable
                </h4>
                <p className="text-sm text-[#94949e] leading-relaxed">
                  The automated inquiry submission system is temporarily offline for scheduled updates. Please reach out directly to Nick via verified email or connected channels.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`mailto:${DIRECT_EMAIL}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#ff1e27] hover:bg-[#d91921] text-white text-xs font-mono font-semibold transition-all shadow-[0_0_20px_rgba(255,30,39,0.3)]"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-xs font-mono transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Email Address Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Email Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Invisible Honeypot Anti-Spam Trap */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor={`${formId}-hp`}>Leave this field blank</label>
              <input
                id={`${formId}-hp`}
                type="text"
                name="company_title_trap"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-name`}
                  className="block text-xs font-mono uppercase tracking-wider text-white/80"
                >
                  Full Name <span className="text-[#ff1e27]">*</span>
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white placeholder-white/20 text-sm focus:outline-none transition-all duration-200 ${
                    errors.name
                      ? 'border-[#ff1e27] focus:ring-1 focus:ring-[#ff1e27]'
                      : 'border-white/10 focus:border-[#ff1e27] focus:ring-1 focus:ring-[#ff1e27]/50'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-[#ff6b72] flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-email`}
                  className="block text-xs font-mono uppercase tracking-wider text-white/80"
                >
                  Email Address <span className="text-[#ff1e27]">*</span>
                </label>
                <input
                  id={`${formId}-email`}
                  type="email"
                  required
                  placeholder="alex@enterprise.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white placeholder-white/20 text-sm focus:outline-none transition-all duration-200 ${
                    errors.email
                      ? 'border-[#ff1e27] focus:ring-1 focus:ring-[#ff1e27]'
                      : 'border-white/10 focus:border-[#ff1e27] focus:ring-1 focus:ring-[#ff1e27]/50'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-[#ff6b72] flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Project Scope / Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`${formId}-message`}
                  className="block text-xs font-mono uppercase tracking-wider text-white/80"
                >
                  Message & Scope <span className="text-[#ff1e27]">*</span>
                </label>
                <span className="text-[11px] font-mono text-[#94949e]">
                  {message.length} / 5000 chars
                </span>
              </div>
              <textarea
                id={`${formId}-message`}
                required
                rows={6}
                placeholder="Message Here..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) {
                    setErrors((prev) => ({ ...prev, message: '' }));
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white placeholder-white/20 text-sm focus:outline-none transition-all duration-200 resize-y min-h-[140px] ${
                  errors.message
                    ? 'border-[#ff1e27] focus:ring-1 focus:ring-[#ff1e27]'
                    : 'border-white/10 focus:border-[#ff1e27] focus:ring-1 focus:ring-[#ff1e27]/50'
                }`}
              />
              {errors.message && (
                <p className="text-xs text-[#ff6b72] flex items-center gap-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.message}
                </p>
              )}
            </div>

            {/* Status Notifications */}
            <AnimatePresence>
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Message Sent Successfully</p>
                    <p className="text-xs font-mono text-emerald-300 mt-1">{statusMessage}</p>
                  </div>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-[#ff1e27]/10 border border-[#ff1e27]/30 flex items-start gap-3 text-[#ff6b72] text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Transmission Issue</p>
                    <p className="text-xs font-mono text-[#ff8e94] mt-1">{statusMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full min-h-[50px] py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg select-none ${
                isSubmitting
                  ? 'bg-[#ff1e27]/50 text-white/70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#ff1e27] to-[#d91921] hover:from-[#ff333b] hover:to-[#ff1e27] text-white shadow-[0_0_25px_rgba(255,30,39,0.3)] hover:shadow-[0_0_35px_rgba(255,30,39,0.5)] active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Working...</span>
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Message Sent — Send Another</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
          )}
        </motion.div>

        {/* Peripheral Information & Social Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Direct Email Pill */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#0c0c0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#ff1e27]/10 border border-[#ff1e27]/20 flex items-center justify-center text-[#ff1e27]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Direct Line
                </h4>
                <p className="text-xs text-[#94949e]">Personal engineering inbox</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
              <a
                href={`mailto:${DIRECT_EMAIL}`}
                className="text-sm font-mono text-white/90 hover:text-[#ff1e27] transition-colors truncate"
              >
                {DIRECT_EMAIL}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all shrink-0 flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Dynamic Timezone & Availability Widget */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0c0c0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff1e27]" />
                <span className="text-xs font-mono uppercase tracking-wider text-white">
                  Location & Timezone
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Available Q2</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-xs text-[#94949e] font-mono mb-1">
                  <span>Toronto, CA • Eastern Time</span>
                  <span>UTC-5 / EDT</span>
                </div>
                <div className="flex items-center gap-2 text-2xl font-bold font-mono text-white tracking-tight">
                  <Clock className="w-5 h-5 text-[#ff1e27]/80" />
                  <span>{torontoTime || '--:--:--'}</span>
                </div>
              </div>

              <p className="text-xs text-[#94949e] leading-relaxed">
                I'll get back to you ASAP!
              </p>
            </div>
          </motion.div>

          {/* Verified Social Channels */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#0c0c0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-3"
          >
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#94949e] mb-1">
              Verified Social Profiles
            </h4>

            <div className="space-y-2">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/80 group-hover:text-[#ff1e27] group-hover:bg-[#ff1e27]/10 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#ff1e27] transition-colors flex items-center gap-1.5">
                          {link.name}
                          <span className="text-[11px] font-mono font-normal text-[#94949e]">
                            {link.handle}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#94949e] truncate max-w-[200px] sm:max-w-[240px]">
                          {link.description}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/80 transition-colors" />
                  </a>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Minimalist Site Footer */}
      <footer className="mt-24 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#94949e]">
        <div>
          © {new Date().getFullYear()} Nick Shahbaz. Architected with React, WebGL, Tailwind & Supabase.
        </div>
        <div className="flex items-center gap-4">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80 font-mono text-[11px]">
            Version 4.1
          </span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={handleScrollToTop}
            className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Back to Top
          </button>
        </div>
      </footer>
    </section>
  );
};