'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Command,
  Bell,
  Sun,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { DynamicSidebar } from './DynamicSidebar';
import { DataScopeIndicator, AccessScope } from '@/components/shared/DataScopeIndicator';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { useAuthStore } from '@/stores/auth-store';

interface EnterpriseAppShellProps {
  children: React.ReactNode;
  scope?: AccessScope | string;
  departmentName?: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
}

export function EnterpriseAppShell({
  children,
  scope = 'ORGANIZATION',
  departmentName = 'Human Resources',
  breadcrumbItems,
}: EnterpriseAppShellProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Generate automatic breadcrumbs if not explicitly passed
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = breadcrumbItems || pathSegments.map((seg, idx) => {
    const href = '/' + pathSegments.slice(0, idx + 1).join('/');
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    return { label, href };
  });

  const isOrgAdmin =
    user?.is_org_admin ||
    user?.role === 'org_admin' ||
    user?.role === 'Organization Administrator' ||
    user?.is_superadmin;

  const userInitials = (user?.full_name || user?.email || 'SA')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* 1. Global Dynamic Sidebar */}
      <DynamicSidebar
        enabledModuleSlugs={['hr', 'finance', 'it', 'legal', 'operations']}
        userPermissions={(user as any)?.permissions || ['*']}
        isOrgAdmin={Boolean(isOrgAdmin)}
      />

      {/* 2. Main Fluid Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F7F9FC] overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-2.5 transition-all">
          <div className="flex items-center justify-between gap-4">
            {/* Global Search Bar Trigger */}
            <div className="flex-1 max-w-lg">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200/80 text-xs transition shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium truncate">
                    Search users, departments, documents, or modules...
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </button>
            </div>

            {/* Right Header Utilities */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              {/* Theme Switcher */}
              <button
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="Theme Settings"
              >
                <Sun className="w-4 h-4" />
              </button>

              {/* User Profile Chip */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {user?.full_name || user?.email || 'Super Admin'}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block leading-tight">
                    {isOrgAdmin ? 'Org Admin' : 'Team Member'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Sub-Header (Breadcrumbs & Scope Indicator) */}
        <div className="px-6 md:px-8 pt-5 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl w-full mx-auto">
          {/* Breadcrumb Hierarchy */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto py-1">
            <Link href="/dashboard" className="hover:text-blue-600 transition">
              Home
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                {crumb.href && idx < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="hover:text-blue-600 transition">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-900 font-bold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Subtly communicate data boundary */}
          <div>
            <DataScopeIndicator scope={scope} departmentName={departmentName} />
          </div>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 pt-4 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Command Palette search modal */}
      <CommandPalette open={isSearchOpen} setOpen={setIsSearchOpen} />
    </div>
  );
}
