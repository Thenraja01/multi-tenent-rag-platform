'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Server,
  Package,
  Layers,
  Boxes,
  Users,
  ShieldCheck,
  MailCheck,
  BookOpen,
  Cpu,
  Bot,
  ScrollText,
  Shield,
  KeyRound,
  Activity,
  Workflow,
  Settings,
  ChevronRight,
  LogOut,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface SuperAdminNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface SuperAdminNavGroup {
  title: string;
  items: SuperAdminNavItem[];
}

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, clearUser } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const basePrefix = '/superadmin';

  const navGroups: SuperAdminNavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: `${basePrefix}/dashboard`, icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'PLATFORM',
      items: [
        { name: 'Organizations', href: `${basePrefix}/organizations`, icon: Building2 },
        { name: 'Tenants', href: `${basePrefix}/tenants`, icon: Server },
        { name: 'Departments & Packs', href: `${basePrefix}/packs`, icon: Package },
        { name: 'Domains', href: `${basePrefix}/domains`, icon: Layers },
        { name: 'Modules', href: `${basePrefix}/modules`, icon: Boxes },
      ],
    },
    {
      title: 'IDENTITY',
      items: [
        { name: 'Users', href: `${basePrefix}/users`, icon: Users },
        { name: 'Roles & Permissions', href: `${basePrefix}/roles`, icon: ShieldCheck },
        { name: 'Invitations', href: `${basePrefix}/invitations`, icon: MailCheck },
      ],
    },
    {
      title: 'KNOWLEDGE & AI',
      items: [
        { name: 'Knowledge', href: `${basePrefix}/knowledge`, icon: BookOpen },
        { name: 'RAG Infrastructure', href: `${basePrefix}/rag`, icon: Cpu },
        { name: 'AI Configuration', href: `${basePrefix}/ai`, icon: Bot },
      ],
    },
    {
      title: 'SECURITY',
      items: [
        { name: 'Audit Logs', href: `${basePrefix}/audit`, icon: ScrollText },
        { name: 'Security & RLS', href: `${basePrefix}/security`, icon: Shield },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'System Health', href: `${basePrefix}/system`, icon: Activity },
        { name: 'Integrations', href: `${basePrefix}/integrations`, icon: Workflow },
        { name: 'System Settings', href: `${basePrefix}/settings`, icon: Settings },
      ],
    },
  ];

  const isActive = (item: SuperAdminNavItem) => {
    if (item.exact) {
      return pathname === item.href || pathname === item.href.replace('/superadmin', '/superadmin') || pathname === item.href.replace('/superadmin', '/superadmin');
    }
    const currentBase = pathname.replace('/superadmin', '').replace('/superadmin', '');
    const itemBase = item.href.replace('/superadmin', '').replace('/superadmin', '');
    return currentBase.startsWith(itemBase);
  };

  return (
    <aside
      className={cn(
        'relative h-screen bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-40 select-none shadow-[2px_0_12px_-4px_rgba(15,23,42,0.03)]',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
        <Link href={`${basePrefix}/dashboard`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            N
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                NEXUS
              </span>
              <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Super Admin
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {group.title}
              </div>
            )}
            {group.items.map((item, iIdx) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={iIdx}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    active
                      ? 'bg-blue-50/80 text-blue-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors shrink-0',
                      active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {active && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-blue-600" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status Pill & Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Normal
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold font-mono">99.98%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[99.98%]" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white border border-slate-200/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              TR
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 truncate">Then Raja</span>
                <span className="text-[10px] text-slate-500 truncate">Super Administrator</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => clearUser()}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
