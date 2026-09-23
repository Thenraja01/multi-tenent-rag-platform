'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useUiStore } from '@/stores/ui-store';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { buildOrgAdminNav } from '@/lib/navigation';
import { X, Shield, ArrowLeft } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';

  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { organization, permissions, capabilities, enabledModules, featureFlags } = useWorkspace();

  const orgName = organization?.name || (tenantSlug ? `${tenantSlug.toUpperCase()} Corp` : 'Organization');

  const navSections = buildOrgAdminNav(
    tenantSlug,
    permissions || [],
    capabilities || {},
    enabledModules.map((m) => ({ slug: m.slug, name: m.name })),
    featureFlags || {}
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 bg-slate-950/40">
          <Link href="/dashboard" className="flex items-center gap-2.5 truncate group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-sm text-white tracking-tight block truncate">
                Admin<span className="text-orange-400">Portal</span>
              </span>
              <span className="block text-[10px] text-orange-400 font-mono font-medium truncate">
                {orgName}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Back to Workspace Link */}
        <div className="px-3 pt-3">
          <Link
            href="/workspace"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Department Applications</span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
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
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono shrink-0 ml-1.5 ${
                            item.badge === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono text-center">
          Tenant Control Plane v4.2
        </div>
      </aside>
    </>
  );
}
