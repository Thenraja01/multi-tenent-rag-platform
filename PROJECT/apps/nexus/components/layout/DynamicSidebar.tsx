'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  UserCheck,
  FileText,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Receipt,
  Cpu,
  HelpCircle,
  FolderGit2,
  Shield,
  ScrollText,
  Settings,
  Sliders,
  LogOut,
  Sparkles,
  Layers,
  Workflow,
  BarChart3,
  Network,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export interface ModuleNavChild {
  title: string;
  href: string;
  permission?: string;
  icon?: React.ElementType;
}

export interface DynamicModuleNav {
  slug: string;
  name: string;
  icon: React.ElementType;
  baseHref: string;
  children: ModuleNavChild[];
  requiredPermission?: string;
}

const DEFAULT_MODULE_MENUS: Record<string, DynamicModuleNav> = {
  hr: {
    slug: 'hr',
    name: 'HR',
    icon: Users,
    baseHref: '/hr',
    requiredPermission: 'hr:view',
    children: [
      { title: 'Dashboard', href: '/hr', icon: LayoutDashboard },
      { title: 'Employees', href: '/hr/employees', permission: 'employee:view', icon: UserCheck },
      { title: 'Attendance', href: '/hr/attendance', permission: 'attendance:view', icon: CalendarCheck },
      { title: 'Leave', href: '/hr/leave', permission: 'leave:view', icon: CalendarDays },
      { title: 'Documents', href: '/hr/documents', permission: 'document:view', icon: FileText },
      { title: 'Analytics', href: '/hr/analytics', permission: 'analytics:view', icon: BarChart3 },
    ],
  },
  finance: {
    slug: 'finance',
    name: 'Finance',
    icon: CreditCard,
    baseHref: '/finance',
    requiredPermission: 'finance:view',
    children: [
      { title: 'Dashboard', href: '/finance', icon: LayoutDashboard },
      { title: 'Expenses', href: '/finance/expenses', permission: 'expense:view', icon: CreditCard },
      { title: 'Invoices', href: '/finance/invoices', permission: 'invoice:view', icon: Receipt },
      { title: 'Budgets', href: '/finance/budgets', permission: 'budget:view', icon: BarChart3 },
      { title: 'Reports', href: '/finance/reports', permission: 'report:view', icon: FileText },
      { title: 'Documents', href: '/finance/documents', permission: 'document:view', icon: FileText },
    ],
  },
  it: {
    slug: 'it',
    name: 'IT & DevOps',
    icon: Cpu,
    baseHref: '/it',
    requiredPermission: 'it:view',
    children: [
      { title: 'Dashboard', href: '/it', icon: LayoutDashboard },
      { title: 'Assets', href: '/it/assets', permission: 'asset:view', icon: Cpu },
      { title: 'Tickets', href: '/it/tickets', permission: 'ticket:view', icon: HelpCircle },
      { title: 'Infrastructure', href: '/it/infrastructure', permission: 'infrastructure:view', icon: Layers },
      { title: 'Runbooks', href: '/it/runbooks', permission: 'runbook:view', icon: FolderGit2 },
      { title: 'Documents', href: '/it/documents', permission: 'document:view', icon: FileText },
    ],
  },
  legal: {
    slug: 'legal',
    name: 'Legal & Compliance',
    icon: Shield,
    baseHref: '/legal',
    requiredPermission: 'legal:view',
    children: [
      { title: 'Dashboard', href: '/legal', icon: LayoutDashboard },
      { title: 'Contracts', href: '/legal/contracts', permission: 'contract:view', icon: FileText },
      { title: 'Compliance', href: '/legal/compliance', permission: 'compliance:view', icon: Shield },
      { title: 'Documents', href: '/legal/documents', permission: 'document:view', icon: FileText },
    ],
  },
  operations: {
    slug: 'operations',
    name: 'Operations',
    icon: Workflow,
    baseHref: '/operations',
    requiredPermission: 'operations:view',
    children: [
      { title: 'Dashboard', href: '/operations', icon: LayoutDashboard },
      { title: 'SOPs', href: '/operations/sops', permission: 'sop:view', icon: FileText },
      { title: 'Vendors', href: '/operations/vendors', permission: 'vendor:view', icon: Building2 },
      { title: 'Documents', href: '/operations/documents', permission: 'document:view', icon: FileText },
    ],
  },
};

interface DynamicSidebarProps {
  enabledModuleSlugs?: string[];
  userPermissions?: string[];
  isOrgAdmin?: boolean;
}

export function DynamicSidebar({
  enabledModuleSlugs = ['hr', 'finance', 'it'],
  userPermissions = ['*'],
  isOrgAdmin = true,
}: DynamicSidebarProps) {
  const pathname = usePathname();
  const { user, clearUser } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    hr: true,
    finance: false,
    it: false,
  });

  const toggleModuleExpand = (slug: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const hasPermission = (perm?: string) => {
    if (!perm) return true;
    if (isOrgAdmin || userPermissions.includes('*') || userPermissions.includes('admin.*')) {
      return true;
    }
    return userPermissions.includes(perm);
  };

  const userInitials = (user?.full_name || user?.email || 'SA')
    .slice(0, 2)
    .toUpperCase();

  const userRoleLabel = isOrgAdmin
    ? 'Organization Admin'
    : user?.role || 'Team Member';

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#0C1322] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-30 select-none text-slate-300 font-sans shadow-xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#0A101D]">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-blue-500/25">
              N
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white">NEXUS</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-wider">
                    PLATFORM
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight truncate">
                  Enterprise Platform
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition hidden lg:flex items-center justify-center cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="py-4 px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar text-xs">
          {/* Section 1: ORGANIZATION */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                ORGANIZATION
              </h3>
            )}
            <div className="space-y-0.5">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  pathname === '/dashboard' || pathname === '/superadmin/dashboard'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Dashboard</span>}
              </Link>

              {hasPermission('department:view') && (
                <Link
                  href="/departments"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith('/departments')
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Network className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Departments</span>}
                </Link>
              )}

              {hasPermission('user:view') && (
                <Link
                  href="/users"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith('/users') || pathname === '/superadmin/users'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Users</span>}
                </Link>
              )}

              {hasPermission('role:view') && (
                <Link
                  href="/roles"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith('/roles') || pathname === '/superadmin/roles'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Roles & Permissions</span>}
                </Link>
              )}

              {hasPermission('invitation:view') && (
                <Link
                  href="/invitations"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith('/invitations')
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Invitations</span>}
                </Link>
              )}
            </div>
          </div>

          {/* Section 2: KNOWLEDGE */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                KNOWLEDGE
              </h3>
            )}
            <div className="space-y-0.5">
              <Link
                href="/documents"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  pathname.startsWith('/documents')
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Documents</span>}
              </Link>

              <Link
                href="/ai"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  pathname.startsWith('/ai') || pathname === '/nexus'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Bot className="w-4 h-4 shrink-0 text-indigo-400" />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>Nexus AI</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      RAG
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* Section 3: MODULES (Dynamically generated with expandable sub-menus) */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                MODULES
              </h3>
            )}
            <div className="space-y-1">
              {enabledModuleSlugs.map((slug) => {
                const moduleDef = DEFAULT_MODULE_MENUS[slug];
                if (!moduleDef || !hasPermission(moduleDef.requiredPermission)) return null;

                const isExpanded = expandedModules[slug] ?? false;
                const isModuleActive = pathname.startsWith(moduleDef.baseHref);
                const IconComponent = moduleDef.icon;

                return (
                  <div key={slug} className="space-y-0.5">
                    {/* Module Root Accordion Trigger */}
                    <button
                      onClick={() => toggleModuleExpand(slug)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                        isModuleActive
                          ? 'bg-slate-800/80 text-white font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <IconComponent className="w-4 h-4 shrink-0 text-blue-400" />
                        {!collapsed && <span className="truncate">{moduleDef.name}</span>}
                      </div>
                      {!collapsed && (
                        <div>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Sub-menu items (when expanded and sidebar not collapsed) */}
                    {!collapsed && isExpanded && (
                      <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-800 ml-5">
                        {moduleDef.children
                          .filter((child) => hasPermission(child.permission))
                          .map((child) => {
                            const isChildActive = pathname === child.href;
                            const ChildIcon = child.icon || FileText;

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                                  isChildActive
                                    ? 'bg-blue-600/90 text-white font-bold shadow-xs'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                              >
                                <ChildIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                                <span className="truncate">{child.title}</span>
                              </Link>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: GOVERNANCE */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                GOVERNANCE
              </h3>
            )}
            <div className="space-y-0.5">
              {hasPermission('audit:view') && (
                <Link
                  href="/audit"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith('/audit') || pathname === '/superadmin/audit'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ScrollText className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Audit Trail</span>}
                </Link>
              )}

              {hasPermission('security:view') && (
                <Link
                  href="/security"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith('/security') || pathname === '/superadmin/security'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Security & Access</span>}
                </Link>
              )}
            </div>
          </div>

          {/* Section 5: SETTINGS */}
          <div className="space-y-1">
            {!collapsed && (
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                SETTINGS
              </h3>
            )}
            <div className="space-y-0.5">
              {hasPermission('settings:view') && (
                <Link
                  href="/settings"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith('/settings') || pathname === '/superadmin/settings'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Organization Settings</span>}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer User Profile Card */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0A101D]">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {userInitials}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.full_name || user?.email || 'Administrator'}
                </p>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">
                  {userRoleLabel}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => clearUser()}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
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
