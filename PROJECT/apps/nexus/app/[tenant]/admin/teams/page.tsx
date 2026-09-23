'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  Users,
  Building2,
  Plus,
  Shield,
  Layers,
  ArrowRight,
  UserCheck,
  FolderGit2,
} from 'lucide-react';

export default function AdminTeamsPage() {
  const params = useParams();
  const { organization, domains, activeDomains } = useWorkspace();
  const orgSlug = organization?.slug || (params?.tenant as string) || 'org';

  const deptList = (domains && domains.length > 0)
    ? domains
    : (activeDomains && activeDomains.length > 0)
    ? activeDomains
    : [];

  const teams = deptList.map((d, index) => ({
    id: `team-0${index + 1}`,
    name: `${d.name} Squad`,
    department: d.name,
    membersCount: 4 + (index * 2),
    lead: 'Department Lead',
    activeProjects: 2 + index,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
            <Building2 className="w-4 h-4" />
            <span>Functional Teams</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Teams & Cross-Functional Squads
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Organize users into agile squads within departments, establishing group permissions and team-scoped document vaults.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition">
            <Plus className="w-4 h-4" />
            <span>Create Squad / Team</span>
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teams.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition backdrop-blur-md space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 font-mono">
                {t.membersCount} Members
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                {t.department}
              </span>
              <h3 className="text-base font-bold text-white">{t.name}</h3>
              <p className="text-xs text-slate-400">
                Team Lead: <strong className="text-slate-200">{t.lead}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                {t.activeProjects} Active Initiatives
              </span>
              <button className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Manage Squad →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
