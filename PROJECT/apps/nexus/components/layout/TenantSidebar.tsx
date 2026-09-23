'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { buildTenantNav } from '@/lib/navigation';
import { Bot, LogOut, X, Shield, Sparkles } from 'lucide-react';

export function TenantSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';

  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { user: authUser, clearUser } = useAuthStore();
  const { organization, enabledModules, user, permissions, domains } = useWorkspace();

  const orgName =
    organization?.name ||
    (tenantSlug ? `${tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)} Corp` : 'Organization');

  const isOrgAdmin = !!user?.is_org_admin || !!user?.is_superadmin;

  const navSections = buildTenantNav(
    tenantSlug,
    enabledModules.map((m) => ({
      slug: m.slug,
      name: m.name,
      icon: m.icon,
      required_permission: m.required_permission,
    })),
    permissions || [],
    isOrgAdmin,
    domains || []
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
          <Link href={`/${tenantSlug}/dashboard`} className="flex items-center gap-2.5 truncate group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
              ◈
            </div>
            <div className="truncate">
              <span className="font-extrabold text-sm text-white tracking-tight block truncate">
                Nexus<span className="text-blue-400">RAG</span>
              </span>
              <span className="block text-[10px] text-blue-400 font-mono font-medium truncate">
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

        {/* Dynamic Navigation Sections */}
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
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase tracking-tight ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
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

        {/* SuperAdmin Quick Switcher / Status Banner */}
        {user?.is_superadmin && (
          <div className="px-3 py-2 border-t border-slate-800/80 bg-indigo-950/20">
            <Link
              href="/superadmin"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                <span>SuperAdmin Portal</span>
              </div>
              <span className="text-[9px] font-mono uppercase bg-indigo-500/20 px-1 py-0.5 rounded">
                Root
              </span>
            </Link>
          </div>
        )}

        {/* Bottom User Area */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user?.full_name || user?.email || 'Authenticated User'}
                </div>
                <div className="text-[9px] font-mono text-slate-400 uppercase truncate">
                  {user?.department?.name ? `${user.department.name} • ` : ''}
                  {typeof user?.role === 'string' ? user.role : (user?.role as any)?.name || (user?.role as any)?.slug || (user?.is_superadmin ? 'SuperAdmin' : 'Member')}
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
    </>
  );
}
