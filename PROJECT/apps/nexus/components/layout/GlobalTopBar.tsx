'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Building2,
  ChevronDown,
  Layers,
  LogOut,
  Menu,
  Search,
  Shield,
  Sparkles,
  User,
  Sliders,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export function GlobalTopBar() {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { organization, activeDomain, domains } = useWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  const isSuperAdmin = user?.is_superadmin || false;
  const rawRoleStr = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name || (user?.role as any)?.slug || '';
  const roleName = isSuperAdmin
    ? 'PLATFORM SUPERADMIN'
    : rawRoleStr
    ? rawRoleStr.toUpperCase()
    : 'ORGANIZATION MEMBER';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      {/* Left: Mobile Trigger & Org Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            ◈
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-tight">NexusRAG</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Enterprise
              </span>
            </div>
            {organization && (
              <span className="text-xs text-slate-400 font-medium block truncate max-w-[160px] sm:max-w-xs">
                {organization.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Universal Search / Default Nexus Quick Query */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <Link
          href="/nexus"
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Ask Default Nexus (Enterprise Pure RAG)...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ⌘K
          </kbd>
        </Link>
      </div>

      {/* Right: Department selector & Profile */}
      <div className="flex items-center gap-3">
        {/* Department Switcher (if domains exist) */}
        {domains && domains.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setDeptOpen(!deptOpen)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeDomain?.name || 'All Domains'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {deptOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
                  Active Domain Workspace
                </div>
                {domains.map((dom) => (
                  <button
                    key={dom.id}
                    onClick={() => {
                      setDeptOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                      activeDomain?.id === dom.id
                        ? 'bg-blue-600/20 text-blue-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span>{dom.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{dom.slug}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Superadmin shortcut link if superadmin */}
        {isSuperAdmin && (
          <Link
            href="/superadmin"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SuperAdmin</span>
          </Link>
        )}

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                {user?.full_name || user?.email || 'User'}
              </div>
              <div className="text-[9px] font-mono text-blue-400 uppercase tracking-tight">
                {roleName}
              </div>
            </div>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-500" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800/80">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Signed In'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1.5 inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {roleName}
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                {isSuperAdmin && (
                  <Link
                    href="/superadmin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>SuperAdmin Portal</span>
                  </Link>
                )}
                <Link
                  href="/nexus"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  <span>Default Nexus (RAG)</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Organization Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-800/80">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
