'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useUiStore } from '../../stores/ui-store';
import { useAuthStore } from '../../stores/auth-store';
import {
  Menu,
  Search,
  MessageSquare,
  BookOpen,
  Upload,
  Settings,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface DomainNavbarProps {
  title?: string;
  domainSlug?: string;
}

export function DomainNavbar({ title, domainSlug: propDomainSlug }: DomainNavbarProps) {
  const params = useParams();
  const pathname = usePathname();
  const tenantSlug = (params?.tenant as string) || 'default';
  const domainSlug = propDomainSlug || (params?.domain as string) || 'hr';

  const { toggleSidebar } = useUiStore();
  const { user } = useAuthStore();

  const domainNavLinks = [
    { label: 'Overview', href: `/${tenantSlug}/${domainSlug}`, icon: ShieldCheck },
    { label: 'AI Chat', href: `/${tenantSlug}/${domainSlug}/chat`, icon: MessageSquare },
    { label: 'Knowledge Base', href: `/${tenantSlug}/${domainSlug}/knowledge`, icon: BookOpen },
    { label: 'Upload Asset', href: `/${tenantSlug}/${domainSlug}/knowledge/upload`, icon: Upload },
    { label: 'Search', href: `/${tenantSlug}/${domainSlug}/search`, icon: Search },
    { label: 'Settings', href: `/${tenantSlug}/${domainSlug}/settings`, icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white capitalize">
                {title || `${domainSlug.toUpperCase()} Workspace`}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                Domain Isolated
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${tenantSlug}/${domainSlug}/search`}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Semantic Search</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">
              /
            </kbd>
          </Link>

          <ThemeToggle />

          <Link
            href="/account/notifications"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
          </Link>

          <div className="w-px h-6 bg-slate-800" />

          <Link href="/account/profile" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </Link>
        </div>
      </div>

      {/* Subnav Pills */}
      <div className="flex items-center gap-1 px-6 py-2 overflow-x-auto border-t border-slate-800/40 bg-slate-900/30">
        {domainNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
