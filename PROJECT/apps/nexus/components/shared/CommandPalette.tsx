'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  Package,
  Layers,
  Users,
  FileText,
  Activity,
  Shield,
  X,
  Server,
  Cpu,
  ArrowRight,
  Boxes,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  subtitle?: string;
  href: string;
  icon: any;
}

interface CommandPaletteProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandPalette({ open, setOpen, isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [liveCatalog, setLiveCatalog] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const isVisible = open !== undefined ? open : (isOpen ?? false);
  const handleClose = () => {
    if (setOpen) setOpen(false);
    if (onClose) onClose();
  };

  // Fetch real database records across platform entities
  const fetchLiveDatabaseEntities = useCallback(async () => {
    setLoading(true);
    try {
      const [orgsRes, packsRes, domainsRes, modulesRes, usersRes, docsRes] = await Promise.allSettled([
        apiClient.get('/organizations'),
        apiClient.get('/packs'),
        apiClient.get('/domains'),
        apiClient.get('/modules'),
        apiClient.get('/users'),
        apiClient.get('/documents'),
      ]);

      const toList = (res: PromiseSettledResult<any>) =>
        res.status === 'fulfilled'
          ? (Array.isArray(res.value?.data)
              ? res.value.data
              : res.value?.data?.items || res.value?.data?.data || [])
          : [];

      const results: SearchResult[] = [];

      // 1. Live Organizations from Database
      toList(orgsRes).forEach((org: any) => {
        results.push({
          id: `org-${org.id}`,
          title: org.name || 'Unnamed Organization',
          category: 'Organizations',
          subtitle: `${org.slug || org.subdomain || 'tenant'}.localfix.app • Status: ${org.status || 'ACTIVE'}`,
          href: `/superadmin/organizations/${org.id || ''}`,
          icon: Building2,
        });
      });

      // 2. Live Packs from Database
      toList(packsRes).forEach((pack: any) => {
        results.push({
          id: `pack-${pack.id}`,
          title: `${pack.name || 'Pack'} Pack`,
          category: 'Packs',
          subtitle: pack.description || 'Configurable department capability pack',
          href: '/superadmin/packs',
          icon: Package,
        });
      });

      // 3. Live Domains from Database
      toList(domainsRes).forEach((dom: any) => {
        results.push({
          id: `domain-${dom.id}`,
          title: `${dom.name || dom.slug || 'Domain'} Domain`,
          category: 'Domains',
          subtitle: `Domain Key: ${dom.slug || 'generic'} • Category: ${dom.category || 'Business'}`,
          href: '/superadmin/domains',
          icon: Layers,
        });
      });

      // 4. Live Modules from Database
      toList(modulesRes).forEach((mod: any) => {
        results.push({
          id: `mod-${mod.id}`,
          title: mod.name || mod.slug,
          category: 'Modules',
          subtitle: `Module Slug: ${mod.slug} • Type: ${mod.module_type || 'Core'}`,
          href: '/superadmin/modules',
          icon: Boxes,
        });
      });

      // 5. Live Users from Database
      toList(usersRes).forEach((u: any) => {
        results.push({
          id: `user-${u.id}`,
          title: u.full_name || u.email,
          category: 'Users',
          subtitle: `${u.email} • Role: ${u.role || 'Member'}`,
          href: '/superadmin/users',
          icon: Users,
        });
      });

      // 6. Live Documents from Database
      toList(docsRes).forEach((doc: any) => {
        results.push({
          id: `doc-${doc.id}`,
          title: doc.filename || doc.name || 'Document',
          category: 'Documents',
          subtitle: `Doc Status: ${doc.document_status || 'STORED'} • AI Knowledge: ${doc.knowledge_status || doc.status || 'NOT_ENABLED'}`,
          href: '/superadmin/knowledge',
          icon: FileText,
        });
      });

      // System navigation links always available
      results.push(
        { id: 'nav-dashboard', title: 'Platform Dashboard', category: 'Navigation', subtitle: 'Super Admin metric telemetry', href: '/superadmin/dashboard', icon: Activity },
        { id: 'nav-tenants', title: 'Tenants & Infrastructure', category: 'Platform', subtitle: 'Multi-tenant isolation & RLS', href: '/superadmin/tenants', icon: Server },
        { id: 'nav-rag', title: 'RAG Infrastructure & Vector Memory', category: 'AI & Knowledge', subtitle: 'pgvector embeddings & latency telemetry', href: '/superadmin/rag', icon: Cpu },
        { id: 'nav-roles', title: 'Role & Permission Matrix', category: 'Security', subtitle: 'Fine-grained RBAC and UBAC configuration', href: '/superadmin/roles', icon: Shield },
        { id: 'nav-audit', title: 'Audit Trail & Event Logs', category: 'Security', subtitle: 'Enterprise governance tracking', href: '/superadmin/audit', icon: Activity },
        { id: 'nav-system', title: 'System Health & Services', category: 'System', subtitle: 'Real-time service health checks', href: '/superadmin/system', icon: Activity },
        { id: 'nav-settings', title: 'System Settings & Config', category: 'System', subtitle: 'Global platform configuration', href: '/superadmin/settings', icon: Sparkles }
      );

      setLiveCatalog(results);
    } catch (err) {
      console.warn('Backend search API load note:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      fetchLiveDatabaseEntities();
    }
  }, [isVisible, fetchLiveDatabaseEntities]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (setOpen) setOpen(!isVisible);
        else if (onClose && isVisible) onClose();
      }
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, setOpen, onClose]);

  if (!isVisible) return null;

  const filtered = query
    ? liveCatalog.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
      )
    : liveCatalog;

  const handleSelect = (href: string) => {
    handleClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            placeholder="Search live organizations, tenants, packs, domains, users, documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {loading ? 'Searching live database...' : `No results found for "${query}"`}
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/70 hover:text-blue-900 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-100/80 flex items-center justify-center text-slate-600 group-hover:text-blue-600 transition shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-[11px] text-slate-500 truncate">{item.subtitle}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live DB Synced ({liveCatalog.length} entities)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">ESC</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
