'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUiStore } from '@/stores/ui-store';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  Menu,
  Search,
  Bot,
  Bell,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Layers,
  Building2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

export function DepartmentHeader() {
  const { setSidebarOpen, setCommandPaletteOpen } = useUiStore();
  const { organization, department, domains, user, isOrgAdmin } = useWorkspace();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const orgSlug = organization?.slug || 'matrix';
  const deptName = department?.name || 'Department';
  const currentDeptSlug = department?.slug || 'hr';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute clean Org Admin URL on parent tenant domain
  const getOrgAdminUrl = () => {
    if (typeof window === 'undefined') return '/org-admin';
    const host = window.location.host;
    const baseDomain = host.split('.').slice(-2).join('.');
    return `${window.location.protocol}//${orgSlug}.${baseDomain}/dashboard`;
  };

  // Compute department subdomain URL
  const getDeptUrl = (slug: string) => {
    if (typeof window === 'undefined') return `/${slug}`;
    const host = window.location.host;
    const baseDomain = host.split('.').slice(-2).join('.');
    return `${window.location.protocol}//${slug}.${orgSlug}.${baseDomain}/`;
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle, Department Badge & Quick Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Interactive Department Switcher */}
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{deptName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {switcherOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-2xl p-2 z-50 space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 flex items-center justify-between">
                <span>Switch Department</span>
                <span className="text-indigo-400">{orgSlug}</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
                {domains.map((d) => {
                  const isCurrent = d.slug === currentDeptSlug;
                  return (
                    <a
                      key={d.slug}
                      href={getDeptUrl(d.slug)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isCurrent
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 opacity-70" />
                        <span>{d.name}</span>
                      </div>
                      {isCurrent && <span className="text-[10px] font-mono">Active</span>}
                    </a>
                  );
                })}
              </div>

              {isOrgAdmin && (
                <div className="pt-1.5 border-t border-slate-800/80">
                  <a
                    href={getOrgAdminUrl()}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 text-xs font-semibold transition border border-indigo-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Org Admin Console</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition text-xs shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span>Search {deptName} knowledge & records...</span>
          <kbd className="ml-4 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & Badges */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{deptName.toUpperCase()} ISOLATED</span>
        </div>

        {isOrgAdmin && (
          <a
            href={getOrgAdminUrl()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Org Admin</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        )}

        <Link
          href="/nexus"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold transition"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nexus AI</span>
        </Link>
      </div>
    </header>
  );
}
