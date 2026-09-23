'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { resolveModule } from '@/config/module-registry';
import {
  Bot,
  LogOut,
  X,
  Shield,
  Sparkles,
  Layers,
  LayoutDashboard,
  FileText,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export function DepartmentSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { clearUser } = useAuthStore();
  const { organization, department, user, permissions, enabledModules } = useWorkspace();

  const deptName = department?.name || 'Department';
  const deptSlug = department?.slug || 'hr';
  const orgName = organization?.name || 'Organization';

  const currentDeptCategory = (deptSlug || '').toLowerCase().replace(/-dept$/, '');
  const isSuperOrAdmin = Boolean(
    user?.is_superadmin ||
    user?.is_org_admin ||
    permissions?.includes('*') ||
    permissions?.includes('admin')
  );

  // Dynamic Department Module items filtered by department partition & user permissions
  const rawNavItems = enabledModules
    .filter((m) => !['settings', 'users', 'roles', 'departments', 'domains'].includes(m.slug))
    .filter((m) => {
      const def = resolveModule(m.slug);

      // 1. Department isolation: only show core/ai modules or modules matching this department category
      if (def.category !== 'core' && def.category !== 'ai') {
        if (def.category !== currentDeptCategory) {
          return false;
        }
      }

      // 2. Permission check for non-admin employees
      if (!isSuperOrAdmin) {
        if (
          def.required_permission &&
          def.required_permission !== '*' &&
          !permissions?.includes(def.required_permission) &&
          !permissions?.some((p) => p.startsWith(`${m.slug}:`) || p.startsWith(`${def.category}:`))
        ) {
          return false;
        }
      }

      return true;
    })
    .map((m) => {
      const def = resolveModule(m.slug);
      const Icon = def.icon;
      const targetHref = m.slug === 'dashboard' ? '/dashboard' : `/${m.slug}`;
      const isActive = pathname === targetHref || pathname.startsWith(`${targetHref}/`);

      return {
        slug: m.slug,
        name: def.name,
        href: targetHref,
        icon: Icon,
        isActive,
      };
    });

  // Deduplicate items by href to ensure no duplicate keys or duplicated navigation entries
  const seenHrefs = new Set<string>();
  const navItems = rawNavItems.filter((item) => {
    if (seenHrefs.has(item.href)) return false;
    seenHrefs.add(item.href);
    return true;
  });

  // Default core fallback if no specific pack modules returned
  const defaultItems = [
    { slug: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isActive: pathname === '/dashboard' || pathname === '/' },
    { slug: 'nexus', name: 'Nexus AI Copilot', href: '/nexus', icon: Bot, isActive: pathname.startsWith('/nexus') },
    { slug: 'documents', name: 'Knowledge & Documents', href: '/documents', icon: FileText, isActive: pathname.startsWith('/documents') },
  ];

  const displayNav = navItems.length > 0 ? navItems : defaultItems;

  return (
    <>
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
              ◈
            </div>
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm text-white tracking-tight leading-tight truncate">
                {deptName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono leading-tight truncate">
                {orgName}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Department Modules
            </div>
            <nav className="space-y-1">
              {displayNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={`${item.slug}-${item.href}`}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      item.isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Intelligence
            </div>
            <nav className="space-y-1">
              <Link
                href="/nexus"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 transition"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Nexus Copilot</span>
              </Link>
              <Link
                href="/nexus/sources"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 transition"
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Verified Sources</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.full_name || 'Member'}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">
                  {user?.email || 'user@domain.com'}
                </p>
              </div>
            </div>
            <button
              onClick={clearUser}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
