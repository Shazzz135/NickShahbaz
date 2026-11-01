import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { Mail, Check, Archive, Clock, AlertCircle, Trash2, RefreshCw } from 'lucide-react';

type Inquiry = Database['public']['Tables']['inquiries']['Row'];

export const InquiriesViewer: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setStatusMsg(`Fetch failed: ${error.message}`);
    } else if (data) {
      setInquiries(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (ignore) return;
      if (error) {
        setStatusMsg(`Fetch failed: ${error.message}`);
      } else if (data) {
        setInquiries(data);
      }
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: 'read' | 'archived') => {
    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);

    if (error) {
      setStatusMsg(`Status update failed: ${error.message}`);
    } else {
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    }
  };

  const handleDeleteInquiry = async (id: string, name: string) => {
    if (!confirm(`Permanently delete inquiry from "${name}"?`)) return;
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) {
      setStatusMsg(`Delete failed: ${error.message}`);
    } else {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      setStatusMsg(`Inquiry from "${name}" deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar - Responsive on mobile & desktop */}
      <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Inquiries Inbox</span>
            <Badge variant="crimson">{inquiries.filter((i) => i.status === 'unread').length} Unread</Badge>
          </h2>
          <p className="text-xs text-[#94949e] mt-0.5">
            Visitor submissions routed to <code className="text-[#ff1e27]">public.inquiries</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchInquiries()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141419] hover:bg-[#1f1f28] text-xs font-mono text-[#94949e] hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-[#ff6b72] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="break-all">{statusMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 sm:p-12 text-center text-xs font-mono text-[#94949e] space-y-2">
          <div className="w-5 h-5 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Syncing inquiries from Supabase...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="p-6 sm:p-8 text-center bg-[#141419] rounded-xl border border-white/5 space-y-2">
          <Mail className="w-8 h-8 text-[#5a5a66] mx-auto" />
          <p className="text-sm text-white font-medium">Inbox is Clear</p>
          <p className="text-xs text-[#94949e]">
            When visitors send messages via the Contact section, they will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                inq.status === 'unread'
                  ? 'bg-[#141419] border-[#e50914]/40'
                  : 'bg-[#101014] border-white/10 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-sm font-bold text-white">{inq.name}</span>
                  <span className="text-xs font-mono text-[#ff4d55] break-all">&lt;{inq.email}&gt;</span>
                  {inq.status === 'unread' && <Badge variant="crimson" dot>Unread</Badge>}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#94949e] shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(inq.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {inq.project_type && (
                  <span className="px-2.5 py-1 rounded bg-[#1c1c24] border border-white/5 text-[#a1a1aa] font-mono">
                    Type: <strong className="text-white">{inq.project_type}</strong>
                  </span>
                )}
                {inq.budget_range && (
                  <span className="px-2.5 py-1 rounded bg-[#1c1c24] border border-white/5 text-[#a1a1aa] font-mono">
                    Budget: <strong className="text-white">{inq.budget_range}</strong>
                  </span>
                )}
              </div>

              <p className="text-xs text-[#94949e] leading-relaxed whitespace-pre-wrap break-words bg-[#0a0a0d] p-3 rounded-lg border border-white/5">
                {inq.message}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5 sm:border-0">
                {inq.status === 'unread' && (
                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'read')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f28] hover:bg-[#282836] text-xs font-mono text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Read</span>
                  </button>
                )}
                {inq.status !== 'archived' && (
                  <button
                    onClick={() => handleUpdateStatus(inq.id, 'archived')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f28] hover:bg-[#282836] text-xs font-mono text-[#94949e] hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteInquiry(inq.id, inq.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff1e27]/10 hover:bg-[#ff1e27]/20 text-xs font-mono text-[#ff6b72] hover:text-[#ff1e27] border border-[#ff1e27]/20 transition-colors cursor-pointer"
                  title="Delete inquiry permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};