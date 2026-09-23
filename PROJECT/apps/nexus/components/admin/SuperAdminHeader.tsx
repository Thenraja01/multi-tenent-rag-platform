'use client';

import React, { useState } from 'react';
import {
  Search,
  Command,
  Globe,
  Sun,
  Moon,
  Shield,
  User,
} from 'lucide-react';
import { ContextBreadcrumb } from './ContextBreadcrumb';
import { SuperAdminHelp } from './SuperAdminHelp';
import { SuperAdminNotifications } from './SuperAdminNotifications';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { useAuthStore } from '@/stores/auth-store';

export function SuperAdminHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Context Breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <ContextBreadcrumb />
        </div>

        {/* Right: Global Search Trigger, Notifications, Help, Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Global Search Bar trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200/80 text-xs transition shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-slate-500 font-medium">Search platform...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>

          {/* Notifications */}
          <SuperAdminNotifications />

          {/* Help */}
          <SuperAdminHelp />

          {/* Profile Tag */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(user?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-bold text-slate-900 block leading-none">
                {user?.full_name || 'Super Admin'}
              </span>
              <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider block">
                SUPER_ADMIN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Command Palette search modal */}
      <CommandPalette open={isSearchOpen} setOpen={setIsSearchOpen} />
    </header>
  );
}
