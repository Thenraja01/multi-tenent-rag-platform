'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { buildSuperAdminNav } from '@/lib/navigation';
import { Shield, LogOut, ArrowLeft, Bot } from 'lucide-react';

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, clearUser } = useAuthStore();
  const navSections = buildSuperAdminNav();

  return (
    <aside className="fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 bg-slate-950/40">
        <Link href="/superadmin" className="flex items-center gap-2.5 truncate group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20 shrink-0 group-hover:scale-105 transition-transform">
            ◈
          </div>
          <div className="truncate">
            <span className="font-extrabold text-sm text-white tracking-tight block truncate">
              Nexus<span className="text-indigo-400">RAG</span>
            </span>
            <span className="block text-[10px] text-indigo-400 font-mono font-bold tracking-wider uppercase truncate">
              SuperAdmin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {section.title}
            </span>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || (item.href !== '/superadmin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Switch to Tenant Workspace Shortcut */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/30">
        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Tenant Workspace</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Exit Admin</span>
        </Link>
      </div>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {user?.full_name || user?.email || 'Platform Admin'}
              </div>
              <div className="text-[9px] font-mono text-indigo-400 uppercase tracking-tight">
                SuperAdmin
              </div>
            </div>
          </div>
          <button
            onClick={() => clearUser()}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
