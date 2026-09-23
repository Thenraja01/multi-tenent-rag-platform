'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useUiStore } from '@/stores/ui-store';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { Menu, Bell, Search, Shield, ChevronRight, Activity } from 'lucide-react';

export function AdminHeader() {
  const { setSidebarOpen, toggleCommandPalette } = useUiStore();
  const { organization, user, health } = useWorkspace();
  const params = useParams();
  const pathname = usePathname();
  const tenantSlug = (params?.tenant as string) || '';

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => {
    const href = '/' + pathSegments.slice(0, idx + 1).join('/');
    const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { title, href };
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white lg:hidden hover:bg-slate-900"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Link href={`/${tenantSlug}/admin`} className="hover:text-slate-200 transition-colors">
            {organization?.name || 'Organization'}
          </Link>
          {breadcrumbs.slice(1).map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className={idx === breadcrumbs.length - 2 ? 'text-slate-200 font-semibold' : 'text-slate-400'}>
                {crumb.title}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Search, System Health indicator, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search trigger */}
        <button
          onClick={() => toggleCommandPalette()}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-300 transition-all shadow-inner"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            Ctrl + K
          </kbd>
        </button>

        {/* Health status badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Systems Healthy</span>
        </div>

        {/* Notifications */}
        <button
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-slate-950" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-orange-500/20">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">
              {user?.full_name || 'Admin'}
            </div>
            <div className="text-[10px] text-orange-400 font-mono leading-tight">
              Organization Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
