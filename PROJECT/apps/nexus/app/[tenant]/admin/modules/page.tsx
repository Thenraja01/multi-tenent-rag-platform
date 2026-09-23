'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { MODULE_REGISTRY } from '@/config/module-registry';
import {
  Boxes,
  Sliders,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AdminModulesPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { enabledModules, activeDomains, hasModule } = useWorkspace();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({
    leave: true,
    attendance: true,
    employees: true,
    expenses: true,
    invoices: true,
    payments: true,
    reports: true,
    assets: true,
    projects: true,
    tickets: true,
    contracts: true,
    compliance: true,
    nexus: true,
  });

  const handleToggle = (slug: string) => {
    setToggleState((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const modulesList = Object.values(MODULE_REGISTRY);
  const filtered = activeCategory === 'all'
    ? modulesList
    : modulesList.filter((m) => m.category === activeCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
            <Boxes className="w-4 h-4" />
            <span>Organization Module Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Installed Modules & Dynamic Capabilities
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Activate or deactivate domain capabilities in real-time. Enabled modules automatically propagate to authorized department hosts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition">
            <Plus className="w-4 h-4" />
            <span>Install Enterprise Pack</span>
          </button>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['all', 'hr', 'finance', 'it', 'legal', 'core', 'admin'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Modules' : `${cat.toUpperCase()} Modules`}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((mod) => {
          const Icon = mod.icon;
          const isEnabled = toggleState[mod.slug] !== false;

          return (
            <div
              key={mod.slug}
              className={`p-6 rounded-3xl border transition-all backdrop-blur-md space-y-4 ${
                isEnabled
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-xl'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Icon className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleToggle(mod.slug)}
                  className="text-slate-400 hover:text-white transition"
                >
                  {isEnabled ? (
                    <ToggleRight className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-600" />
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                    {mod.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {mod.route}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{mod.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  Req: {mod.required_permission}
                </span>
                <span
                  className={`font-semibold ${
                    isEnabled ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {isEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
