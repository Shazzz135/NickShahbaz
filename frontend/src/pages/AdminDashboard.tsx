import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { 
  LogOut, 
  Terminal, 
  Layers, 
  Briefcase, 
  Mail, 
  ShieldCheck, 
  Database,
  ArrowUpRight 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#08080a] text-white bg-grid-pattern crimson-ambient p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
              <Terminal className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Admin CMS Portal</h1>
                <Badge variant="emerald" dot>Live Connected</Badge>
              </div>
              <p className="text-xs text-[#94949e] font-mono mt-0.5">
                Signed in as: <span className="text-white">{user?.email || 'Authenticated User'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141419] hover:bg-[#1a1a22] border border-white/10 text-xs font-mono text-[#94949e] hover:text-white transition-colors"
            >
              <span>View Live Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <Button
              variant="outline"
              size="sm"
              icon={<LogOut className="w-3.5 h-3.5" />}
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27]">
                <Layers className="w-5 h-5" />
              </span>
              <Badge variant="subtle">Database</Badge>
            </div>
            <div className="text-2xl font-extrabold text-white">Projects</div>
            <p className="text-xs text-[#94949e] mt-1">
              Manage portfolio projects, tech stacks, and live links.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#94949e]">Table: public.projects</span>
              <span className="text-[#ff1e27] font-mono">Ready for CMS</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27]">
                <Briefcase className="w-5 h-5" />
              </span>
              <Badge variant="subtle">Timeline</Badge>
            </div>
            <div className="text-2xl font-extrabold text-white">Experience</div>
            <p className="text-xs text-[#94949e] mt-1">
              Update career milestones, roles, and company deliverables.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#94949e]">Table: public.experiences</span>
              <span className="text-[#ff1e27] font-mono">Ready for CMS</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27]">
                <Mail className="w-5 h-5" />
              </span>
              <Badge variant="subtle">Inquiries</Badge>
            </div>
            <div className="text-2xl font-extrabold text-white">Inbox</div>
            <p className="text-xs text-[#94949e] mt-1">
              View incoming client messages, project scopes, and budgets.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#94949e]">Table: public.inquiries</span>
              <span className="text-[#ff1e27] font-mono">Ready for CMS</span>
            </div>
          </Card>
        </div>

        {/* Security / Architecture Banner */}
        <div className="p-6 rounded-2xl bg-[#0d0d10] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Google OAuth & Session Guard Active</h4>
              <p className="text-xs text-[#94949e] mt-0.5">
                Session tokens are automatically refreshed and authenticated via Supabase Row Level Security.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#ff1e27]" />
            <span className="text-xs font-mono text-[#ff4d55]">PostgreSQL RLS Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
