'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Boxes,
  Layers,
  CheckCircle2,
  XCircle,
  ToggleRight,
  ToggleLeft,
  CalendarCheck,
  Briefcase,
  FileText,
  FolderGit2,
  Bot,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';

interface DomainRecord {
  id: string;
  name: string;
  slug: string;
}

interface DomainModuleRecord {
  id: string;
  domain_id: string;
  name: string;
  slug: string;
  module_type: string;
  description?: string;
  enabled: boolean;
}

export default function TenantModulesPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';

  const [domainsList, setDomainsList] = useState<DomainRecord[]>([]);
  const [modulesList, setModulesList] = useState<DomainModuleRecord[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const domRes = await apiClient.get<DomainRecord[]>('/domains');
      const doms = Array.isArray(domRes.data) ? domRes.data : [];
      setDomainsList(doms);

      // Fetch modules for all domains
      const allModules: DomainModuleRecord[] = [];
      await Promise.all(
        doms.map(async (dom) => {
          try {
            const mRes = await apiClient.get<Array<{ id: string; name: string; slug: string; module_type: string; description?: string; enabled: boolean }>>(
              `/domains/${dom.id}/modules`
            );
            if (Array.isArray(mRes.data)) {
              mRes.data.forEach((m) => {
                allModules.push({ ...m, domain_id: dom.id });
              });
            }
          } catch {
            // Silently ignore if domain has no modules yet
          }
        })
      );

      setModulesList(allModules);
    } catch (err) {
      console.error('Failed to load modules from API:', err);
      setError('Could not connect to API backend to load modules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const handleToggleStatus = async (domainId: string, modId: string, currentEnabled: boolean) => {
    try {
      const newEnabled = !currentEnabled;
      await apiClient.post(`/domains/${domainId}/modules/${modId}/toggle`, { enabled: newEnabled });
      setModulesList((prev) =>
        prev.map((m) =>
          m.id === modId && m.domain_id === domainId ? { ...m, enabled: newEnabled } : m
        )
      );
    } catch (err) {
      console.error('Failed to toggle module status via API:', err);
    }
  };

  const filteredModules = modulesList.filter((m) => {
    return selectedDomain === 'ALL' || m.domain_id === selectedDomain;
  });

  const getModuleIcon = (slug: string) => {
    if (slug.includes('leave')) return Briefcase;
    if (slug.includes('attendance')) return CalendarCheck;
    if (slug.includes('doc') || slug.includes('know')) return FileText;
    if (slug.includes('project') || slug.includes('incident')) return FolderGit2;
    if (slug.includes('ai') || slug.includes('copilot') || slug.includes('rag')) return Bot;
    return Boxes;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Domain Modules & Capabilities</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-semibold">
              {tenantSlug.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Application capability suites enabled across your business domains (Leave, Attendance, Documents, Projects).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Live API Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            {modulesList.filter((m) => m.enabled).length} / {modulesList.length} Modules Active
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Domain Filters */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto">
        <button
          onClick={() => setSelectedDomain('ALL')}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            selectedDomain === 'ALL' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Domains ({modulesList.length})
        </button>
        {domainsList.map((dom) => {
          const count = modulesList.filter((m) => m.domain_id === dom.id).length;
          return (
            <button
              key={dom.id}
              onClick={() => setSelectedDomain(dom.id)}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                selectedDomain === dom.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {dom.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Modules Grid */}
      {loading && modulesList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse h-36" />
          ))}
        </div>
      ) : filteredModules.length === 0 ? (
        <Card className="p-12 text-center bg-slate-900/40 border-slate-800 space-y-3">
          <Boxes className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-bold text-white">No Modules Configured</div>
          <p className="text-xs text-slate-400">
            Create domains to automatically attach system capability modules.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((mod) => {
            const Icon = getModuleIcon(mod.slug);
            const parentDomain = domainsList.find((d) => d.id === mod.domain_id);
            const isActive = mod.enabled;

            return (
              <Card
                key={`${mod.domain_id}_${mod.id}`}
                className={`p-5 border transition flex flex-col justify-between space-y-4 ${
                  isActive
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      {parentDomain?.name || 'Domain'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(mod.domain_id, mod.id, mod.enabled)}
                      className={`flex items-center gap-1 text-[11px] font-mono font-semibold transition ${
                        isActive ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-400" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-500" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{mod.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">/{mod.slug}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {mod.description || 'Application module capability.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="truncate max-w-[120px]">{mod.id}</span>
                  <span className="text-blue-400 font-semibold">
                    Live API
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
