'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Search,
  Bot,
  User,
  Activity,
  Cpu,
  ShieldCheck,
  Layers,
  FileText,
  Settings,
  ShieldAlert,
  Users,
  Sparkles,
  ArrowRight,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Domains' | 'Navigation' | 'Quick Actions';
  icon: React.ElementType;
  href: string;
  shortcut?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const params = useParams();
  const tenant = (params?.tenant as string) || 'default';

  const items: CommandItem[] = [
    // Domains
    {
      id: 'd-hr',
      title: 'HR & People Operations',
      category: 'Domains',
      icon: User,
      href: `/${tenant}/hr`,
    },
    {
      id: 'd-finance',
      title: 'Finance & Accounts Vault',
      category: 'Domains',
      icon: Activity,
      href: `/${tenant}/finance`,
    },
    {
      id: 'd-it',
      title: 'IT Systems & Runbooks',
      category: 'Domains',
      icon: Cpu,
      href: `/${tenant}/it`,
    },
    {
      id: 'd-legal',
      title: 'Legal & Compliance Matrix',
      category: 'Domains',
      icon: ShieldCheck,
      href: `/${tenant}/legal`,
    },
    {
      id: 'd-ops',
      title: 'Operations & Logistics',
      category: 'Domains',
      icon: Layers,
      href: `/${tenant}/operations`,
    },
    // Navigation
    {
      id: 'n-ai',
      title: 'Neural RAG Chat Assistant',
      category: 'Navigation',
      icon: Bot,
      href: `/${tenant}/ai`,
      shortcut: 'G A',
    },
    {
      id: 'n-docs',
      title: 'Document Vault & Vector Store',
      category: 'Navigation',
      icon: FileText,
      href: `/${tenant}/documents`,
      shortcut: 'G D',
    },
    {
      id: 'n-roles',
      title: 'Role & Permission Matrix',
      category: 'Navigation',
      icon: Users,
      href: `/${tenant}/roles`,
    },
    {
      id: 'n-audit',
      title: 'Immutable Audit Logs',
      category: 'Navigation',
      icon: ShieldAlert,
      href: `/${tenant}/audit`,
    },
    {
      id: 'n-settings',
      title: 'Tenant Security & BYOK Settings',
      category: 'Navigation',
      icon: Settings,
      href: `/${tenant}/settings`,
    },
    // Quick Actions
    {
      id: 'qa-upload',
      title: 'Upload Multi-Format Document (PDF/DOCX)',
      category: 'Quick Actions',
      icon: FileText,
      href: `/${tenant}/documents?action=upload`,
    },
    {
      id: 'qa-query',
      title: 'Ask Multi-Domain AI Question',
      category: 'Quick Actions',
      icon: Sparkles,
      href: `/${tenant}/ai?focus=prompt`,
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const selectItem = (item: CommandItem) => {
    setIsOpen(false);
    setQuery('');
    router.push(item.href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 ring-1 ring-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a domain, document, or command... (e.g. 'HR', 'IT', 'Settings')"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands or domains found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => selectItem(item)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                    index === selectedIndex
                      ? 'bg-blue-600/15 border border-blue-500/30 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-blue-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{item.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Navigate with arrows, select with Enter</span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> + K to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
