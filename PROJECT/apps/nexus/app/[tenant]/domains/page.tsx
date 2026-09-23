'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDepartments } from '@/hooks/use-departments';
import { useTenantStore } from '@/stores/tenant-store';
import {
  Building2,
  CheckCircle2,
  ArrowUpRight,
  Globe,
  Settings2,
  Save,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function TenantDepartmentsAndDomainsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const { tenant } = useTenantStore();
  const { departments, isLoading, toggleDepartment, isToggling } = useDepartments(tenant?.id || tenantSlug);

  const [customSubdomains, setCustomSubdomains] = useState<Record<string, string>>({});
  const [savedDeptId, setSavedDeptId] = useState<string | null>(null);

  const handleSubdomainChange = (deptId: string, val: string) => {
    setCustomSubdomains((prev) => ({
      ...prev,
      [deptId]: val.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    }));
  };

  const handleToggle = async (dept: any, enable: boolean) => {
    const customSub = customSubdomains[dept.id] || dept.custom_subdomain || dept.slug;
    try {
      await toggleDepartment({
        department_id: dept.id,
        is_enabled: enable,
        custom_subdomain: customSub,
      });
      setSavedDeptId(dept.id);
      setTimeout(() => setSavedDeptId(null), 2500);
    } catch (err) {
      console.error('Failed to toggle department:', err);
    }
  };

  const handleSaveSubdomain = async (dept: any) => {
    const customSub = customSubdomains[dept.id] || dept.custom_subdomain || dept.slug;
    try {
      await toggleDepartment({
        department_id: dept.id,
        is_enabled: true,
        custom_subdomain: customSub,
      });
      setSavedDeptId(dept.id);
      setTimeout(() => setSavedDeptId(null), 2500);
    } catch (err) {
      console.error('Failed to save department subdomain:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
            <Building2 className="w-4 h-4" />
            <span>Organization Department Workspaces</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Departments & Subdomain Workspaces
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Choose which departments are enabled for <strong className="text-slate-200">{tenant?.name || tenantSlug}</strong>. Configure custom subdomains (e.g.{' '}
            <code className="text-indigo-300 font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
              hr.{tenantSlug}.localhost:3000
            </code>
            ) to give each department an isolated knowledge workspace.
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900/50 border border-slate-800/80 animate-pulse p-6" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">No platform departments found in catalog.</p>
          <p className="text-xs text-slate-500 mt-1">SuperAdmin can seed and provision global departments in the Catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => {
            const isEnabled = d.is_enabled !== false;
            const currentSubdomain =
              customSubdomains[d.id] !== undefined
                ? customSubdomains[d.id]
                : d.custom_subdomain || d.slug;
            const liveSubdomainUrl = `http://${currentSubdomain}.${tenantSlug}.localhost:3000`;
            const isJustSaved = savedDeptId === d.id;

            return (
              <div
                key={d.id}
                className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md flex flex-col justify-between transition-all ${
                  isEnabled
                    ? 'bg-slate-900/90 border-slate-800 shadow-indigo-950/20'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-75 hover:opacity-100'
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Checkbox Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-2xl border ${
                          isEnabled
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{d.name}</h3>
                        <p className="text-[11px] font-mono text-slate-500">Catalog Slug: {d.slug}</p>
                      </div>
                    </div>

                    {/* Enable / Disable Checkbox Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => handleToggle(d, e.target.checked)}
                        disabled={isToggling}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-5 min-h-[36px]">
                    {d.description || `Enterprise ${d.name} department workspace with dedicated knowledge base.`}
                  </p>

                  {/* Subdomain Configuration Block */}
                  {isEnabled && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5 mb-5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" />
                          Department Subdomain
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 flex items-center rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs">
                          <input
                            type="text"
                            value={currentSubdomain}
                            onChange={(e) => handleSubdomainChange(d.id, e.target.value)}
                            placeholder={d.slug}
                            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                          <span className="text-slate-500 font-mono text-[11px] shrink-0">
                            .{tenantSlug}.localhost
                          </span>
                        </div>

                        <button
                          onClick={() => handleSaveSubdomain(d)}
                          disabled={isToggling}
                          title="Save Subdomain"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1 shrink-0"
                        >
                          {isJustSaved ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="truncate">URL: {liveSubdomainUrl}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-slate-800/80">
                  {isEnabled ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${tenantSlug}/${d.slug}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <span>Enter Workspace</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>

                      <a
                        href={liveSubdomainUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open in Subdomain URL"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggle(d, true)}
                      disabled={isToggling}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Enable {d.name}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
