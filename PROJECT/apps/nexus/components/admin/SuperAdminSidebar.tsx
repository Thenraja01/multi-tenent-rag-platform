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
  Activity,
  Settings,
  Mail,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ADMIN_NAVIGATION_SECTIONS, NavigationItem } from '@/config/admin-navigation';
import { useAuthStore } from '@/stores/auth-store';

const ICON_MAP: Record<string, React.ElementType> = {
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
  Activity,
  Settings,
  Mail,
};

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, clearUser } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 bg-[#FFFFFF] border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 z-30 select-none shadow-sm shadow-slate-100',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link href="/superadmin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-blue-500/25">
              N
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-slate-900">NEXUS</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-200/60 tracking-wider">
                    SUPER ADMIN
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight">Enterprise Platform</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition hidden lg:flex items-center justify-center"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="py-4 px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {ADMIN_NAVIGATION_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative',
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                      )}
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
              {(user?.full_name || user?.email || 'SA').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'Super Admin'}</p>
                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block">
                  SUPER_ADMIN
                </span>
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
