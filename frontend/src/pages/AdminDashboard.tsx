import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/common/Badge';
import { SiteSettingsManager } from '../components/admin/SiteSettingsManager';
import { AboutManager } from '../components/admin/AboutManager';
import { ProjectsManager } from '../components/admin/ProjectsManager';
import { ExperienceManager } from '../components/admin/ExperienceManager';
import { InquiriesViewer } from '../components/admin/InquiriesViewer';
import { 
  LogOut, 
  Terminal, 
  Settings, 
  User, 
  Layers, 
  Briefcase, 
  Mail, 
  Database, 
  ArrowUpRight, 
  ShieldCheck 
} from 'lucide-react';

type Tab = 'settings' | 'about' | 'projects' | 'experiences' | 'inquiries';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Navbar - Responsive for Mobile & Desktop */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 sm:p-2.5 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20 shrink-0">
              <Terminal className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Admin CMS Portal</h1>
                <Badge variant="emerald" dot>Live</Badge>
              </div>
              <p className="text-xs text-[#94949e] font-mono mt-0.5 truncate max-w-[260px] sm:max-w-md">
                Admin: <span className="text-white">{user?.email || 'Authorized'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141419] hover:bg-[#1a1a22] border border-white/10 text-xs font-mono text-[#94949e] hover:text-white transition-colors"
            >
              <span>View Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => signOut()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/10 hover:border-red-500/40 bg-transparent hover:bg-red-950/20 text-xs font-mono text-[#94949e] hover:text-[#ff6b72] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* CMS Navigation Tabs - Ordered identically to the live site sections for maximum appeal */}
        <nav aria-label="CMS Navigation" className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max border-b border-white/10 pb-3">
            {/* 1. Hero & Global Site Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#e50914] text-white'
                  : 'bg-[#141419] text-[#94949e] hover:text-white border border-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>1. Hero & Site</span>
            </button>

            {/* 2. About Me, Skills & Philosophy */}
            <button
              onClick={() => setActiveTab('about')}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-[#e50914] text-white'
                  : 'bg-[#141419] text-[#94949e] hover:text-white border border-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>2. About & Skills</span>
            </button>

            {/* 3. Projects Gallery */}
            <button
              onClick={() => setActiveTab('projects')}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[#e50914] text-white'
                  : 'bg-[#141419] text-[#94949e] hover:text-white border border-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>3. Projects CRUD</span>
            </button>

            {/* 4. Experiences Timeline */}
            <button
              onClick={() => setActiveTab('experiences')}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'experiences'
                  ? 'bg-[#e50914] text-white'
                  : 'bg-[#141419] text-[#94949e] hover:text-white border border-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>4. Timeline CRUD</span>
            </button>

            {/* 5. Inquiries Inbox */}
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-[#e50914] text-white'
                  : 'bg-[#141419] text-[#94949e] hover:text-white border border-white/5'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>5. Inbox</span>
            </button>
          </div>
        </nav>

        {/* Tab Content Panel - Clean Static Styling */}
        <main className="p-4 sm:p-6 lg:p-8 rounded-xl bg-[#0f0f13] border border-white/10">
          {activeTab === 'settings' && <SiteSettingsManager />}
          {activeTab === 'about' && <AboutManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'experiences' && <ExperienceManager />}
          {activeTab === 'inquiries' && <InquiriesViewer />}
        </main>

        {/* Security & RLS Footer Badge */}
        <footer className="p-3.5 sm:p-4 rounded-lg bg-[#0d0d10] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#94949e]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Row Level Security Enforcement Active</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[#ff4d55]">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>PostgreSQL 17 Linked</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
