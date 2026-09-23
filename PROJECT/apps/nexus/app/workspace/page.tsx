'use client';

import React from 'react';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { resolveModule } from '@/config/module-registry';
import {
  Building2,
  Users,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Cpu,
  Workflow,
  LayoutDashboard,
  LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function OrganizationWorkspaceHubPage() {
  const { user, organization, domains, activeDomains, enabledModules, isOrgAdmin, isLoading } = useWorkspace();
  const orgName = organization?.name || 'Organization Workspace';
  const orgSlug = organization?.slug || '';

  // Use registered DB domains / departments
  const departmentDomains = (domains && domains.length > 0)
    ? domains
    : (activeDomains && activeDomains.length > 0)
    ? activeDomains
    : [];

  const getDeptIcon = (slug: string): LucideIcon => {
    switch (slug.toLowerCase()) {
      case 'hr':
        return Users;
      case 'finance':
        return DollarSign;
      case 'it':
        return Cpu;
      case 'legal':
        return Shield;
      case 'operations':
        return Workflow;
      default:
        return Layers;
    }
  };

  const getDeptColor = (slug: string) => {
    switch (slug.toLowerCase()) {
      case 'hr':
        return 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30';
      case 'finance':
        return 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30';
      case 'it':
        return 'from-purple-500/20 to-violet-500/10 text-purple-400 border-purple-500/30';
      case 'legal':
        return 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'from-indigo-500/20 to-slate-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12">
      <div className="max-w-6xl w-full mx-auto space-y-10">
        {/* Organization Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Building2 className="w-4 h-4" />
              <span>{orgName} Enterprise Mesh</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Select Department Application
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Select an authorized department workspace to enter the application mesh or access the organization control plane.
            </p>
          </div>

          {isOrgAdmin && (
            <Link
              href="/org-admin"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Organization Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Dynamic Registered Department Application Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 rounded-3xl bg-slate-900/40 border border-slate-800/60 animate-pulse" />
            <div className="h-48 rounded-3xl bg-slate-900/40 border border-slate-800/60 animate-pulse" />
          </div>
        ) : departmentDomains.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Registered Departments Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              This organization does not have any active departments provisioned in the database yet.
            </p>
            {isOrgAdmin && (
              <Link
                href="/org-admin/departments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                <span>Provision Departments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departmentDomains.map((dept) => {
              const Icon = getDeptIcon(dept.slug);
              const colorClass = getDeptColor(dept.slug);
              const deptHostname = typeof window !== 'undefined'
                ? `${window.location.protocol}//${dept.slug}.${window.location.host}`
                : `/${dept.slug}`;

              // Derive module tags from enabled modules matching this category/slug
              const deptModules = enabledModules
                .filter((m) => {
                  const def = resolveModule(m.slug);
                  return def.category === dept.slug.toLowerCase() || m.slug === dept.slug.toLowerCase();
                })
                .map((m) => m.name);

              const displayTags = deptModules.length > 0 ? deptModules : ['Knowledge', 'Nexus AI'];

              return (
                <a
                  key={dept.id || dept.slug}
                  href={deptHostname}
                  className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition shadow-2xl backdrop-blur-xl group flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colorClass} border group-hover:scale-105 transition`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                        <span>{dept.slug}.{orgSlug || 'matrix'}.nexusrag.app</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {dept.description || `${dept.name} department workspace and intelligent knowledge store.`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {displayTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 transition">
                      <span>Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-600 pt-12">
        NexusRAG Level-4 Multi-Tenant Operating Platform • Cryptographic Tenant Isolation
      </div>
    </div>
  );
}
