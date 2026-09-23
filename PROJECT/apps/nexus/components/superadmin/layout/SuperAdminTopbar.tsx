'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Shield,
  LogOut,
  Activity,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sun,
  Moon,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Settings,
} from 'lucide-react';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function SuperAdminTopbar() {
  const pathname = usePathname();
  const { user, clearUser } = useAuthStore();
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const basePrefix = pathname.startsWith('/superadmin') ? '/superadmin' : '/superadmin';

  const getSectionTitle = () => {
    if (pathname.includes('/organizations')) return 'Organizations';
    if (pathname.includes('/tenants')) return 'Tenants';
    if (pathname.includes('/packs')) return 'Departments & Packs';
    if (pathname.includes('/domains')) return 'Domains';
    if (pathname.includes('/modules')) return 'Modules';
    if (pathname.includes('/users')) return 'Users';
    if (pathname.includes('/roles')) return 'Roles & Permissions';
    if (pathname.includes('/invitations')) return 'Invitations';
    if (pathname.includes('/knowledge')) return 'Knowledge Base';
    if (pathname.includes('/rag')) return 'RAG Infrastructure';
    if (pathname.includes('/ai') || pathname.includes('/models')) return 'AI Configuration';
    if (pathname.includes('/audit')) return 'Audit Logs';
    if (pathname.includes('/security')) return 'Security & Access';
    if (pathname.includes('/system')) return 'System Health';
    if (pathname.includes('/settings')) return 'System Settings';
    if (pathname.includes('/profile')) return 'Admin Profile';
    if (pathname.includes('/help')) return 'Help & Docs';
    return 'Dashboard';
  };

  const notifications = [
    {
      id: '1',
      title: 'New organization created',
      desc: 'Acme Corporation was onboarded to HR Pack',
      time: '12m ago',
      type: 'success',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    {
      id: '2',
      title: 'Pack updated',
      desc: 'HR pack modified by Super Admin',
      time: '45m ago',
      type: 'info',
      icon: Info,
      iconColor: 'text-blue-500',
    },
    {
      id: '3',
      title: 'Document indexing complete',
      desc: '124 chunks indexed into pgvector',
      time: '2h ago',
      type: 'success',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <>
      <header className="h-16 px-6 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4 shadow-xs">
        {/* Left: Role Pill & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Super Admin</span>
            <ChevronDown className="w-3 h-3 text-blue-400" />
          </div>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-800">{getSectionTitle()}</span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl">
          <button
            onClick={() => setCommandOpen(true)}
            className="w-full flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white text-xs text-slate-500 transition shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search organizations, tenants, packs, domains, users...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-600 rounded-md border border-slate-200 shadow-2xs">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications, User */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 flex items-start gap-2.5 cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                          <Icon className={`w-3.5 h-3.5 ${n.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">{n.desc}</p>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Help Center */}
          <Link
            href={`${basePrefix}/help`}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Help & Architecture Docs"
          >
            <HelpCircle className="w-4 h-4" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                TR
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">Then Raja</span>
                <span className="text-[10px] text-slate-500 leading-tight">Super Administrator</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {adminMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">Then Raja</p>
                  <p className="text-[11px] text-slate-500 font-mono">admin@nexusrag.com</p>
                </div>
                <Link
                  href={`${basePrefix}/profile`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href={`${basePrefix}/settings`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setAdminMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Platform Settings</span>
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => clearUser()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Command Palette Modal */}
      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </>
  );
}
