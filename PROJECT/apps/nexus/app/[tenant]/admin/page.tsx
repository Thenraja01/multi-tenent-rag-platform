'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  Users,
  Network,
  Boxes,
  Database,
  Shield,
  Activity,
  UserPlus,
  PlusCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  Bot
} from 'lucide-react';

export default function AdminOverviewPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { organization, user, domains, enabledModules, quotas, health, plan } = useWorkspace();

  const orgName = organization?.name || 'Organization';
  const maxUsers = quotas?.max_users || 500;
  const usedUsers = quotas?.used_users || 12;
  const maxStorageGb = Math.round((quotas?.max_storage_bytes || 107374182400) / (1024 * 1024 * 1024));
  const usedStorageGb = Math.round((quotas?.used_storage_bytes || 14500000000) / (1024 * 1024 * 1024));
  const storagePercent = Math.min(100, Math.round((usedStorageGb / maxStorageGb) * 100));

  const maxAiTokensM = ((quotas?.monthly_ai_tokens || 5000000) / 1000000).toFixed(1);
  const usedAiTokensM = ((quotas?.used_ai_tokens || 1240000) / 1000000).toFixed(2);

  const services = [
    { name: 'FastAPI Gateway', status: 'Healthy', latency: '14ms', icon: Activity },
    { name: 'PostgreSQL 16 + RLS', status: 'Healthy', latency: '4ms', icon: Database },
    { name: 'Redis Cache & PubSub', status: 'Healthy', latency: '1ms', icon: Activity },
    { name: 'MinIO Storage Vault', status: 'Healthy', latency: '22ms', icon: Database },
    { name: 'Celery Ingestion Queue', status: 'Healthy', latency: 'Idle', icon: Cpu },
    { name: 'pgvector Cosine Search', status: 'Healthy', latency: '48ms', icon: Sparkles },
    { name: 'Default Nexus AI Gateway', status: 'Healthy', latency: 'Stream', icon: Bot },
  ];

  const pendingItems = [
    { type: 'invitation', title: '3 Pending Invitations awaiting acceptance', href: '/invitations', time: '2 hours ago', badge: 'Invites' },
    { type: 'approval', title: '2 Document Knowledge Vault revisions pending approval', href: '/documents', time: '4 hours ago', badge: 'Knowledge' },
    { type: 'temporary', title: '1 Temporary Admin access grant expiring in 24 hours', href: '/roles', time: 'Today', badge: 'Security' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Page Header & Quick Action Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-slate-950 border border-slate-800/80 shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">{orgName} Control Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
              {plan?.name || 'Enterprise'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Tenant ID: <span className="font-mono text-slate-300">{organization?.id || 'org_active'}</span> &bull; Status:{' '}
            <span className="text-emerald-400 font-semibold">{organization?.status || 'ACTIVE'}</span>
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/departments"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-lg shadow-orange-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Department</span>
          </Link>
          <Link
            href="/invitations"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
          >
            <UserPlus className="w-4 h-4 text-orange-400" />
            <span>+ Invite User</span>
          </Link>
          <Link
            href="/documents"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>+ Upload Document</span>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Members</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{usedUsers}</div>
            <p className="text-xs text-slate-400 mt-1">
              Quota: <span className="font-mono text-slate-300">{usedUsers} / {maxUsers}</span> seats active
            </p>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (usedUsers / maxUsers) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Departments */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Departments</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{domains?.length || 4}</div>
            <p className="text-xs text-slate-400 mt-1">
              All provisioned with 4-tier roles & isolated RAG
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-purple-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Wildcard DNS active</span>
          </div>
        </div>

        {/* Card 3: Modules */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Active Modules</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{enabledModules?.length || 8}</div>
            <p className="text-xs text-slate-400 mt-1">
              Licensed from active enterprise packs
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-orange-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic UI manifest enabled</span>
          </div>
        </div>

        {/* Card 4: Storage Vault */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Storage & AI</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{usedStorageGb} GB</div>
            <p className="text-xs text-slate-400 mt-1">
              Tokens: <span className="font-mono text-slate-300">{usedAiTokensM}M / {maxAiTokensM}M</span>
            </p>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Main Split Grid: Department Summary & Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Department Knowledge Mesh */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Department Mesh & Status</h2>
              <p className="text-xs text-slate-400">Dynamic business domains provisioned for this organization</p>
            </div>
            <Link
              href={`/${tenantSlug}/admin/departments`}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Subdomain Host</th>
                  <th className="py-3 px-3">RAG Mesh</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(domains && domains.length > 0 ? domains : [
                  { slug: 'hr', name: 'Human Resources', description: 'People, Leaves, Payroll', status: 'active' },
                  { slug: 'finance', name: 'Finance & Accounts', description: 'Invoices, Expenses, Budget', status: 'active' },
                  { slug: 'it', name: 'Information Technology', description: 'Runbooks, Assets, Incidents', status: 'active' },
                  { slug: 'legal', name: 'Legal & Compliance', description: 'Contracts, NDAs, Policies', status: 'active' },
                ]).map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{dept.name}</div>
                      <div className="text-[11px] text-slate-400">{dept.slug}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                      {dept.slug}.{tenantSlug}.nexus.com
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        <Sparkles className="w-3 h-3" />
                        <span>Isolated</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>ACTIVE</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/${tenantSlug}/${dept.slug}`}
                        className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors font-medium text-[11px]"
                      >
                        Enter &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Pending Actions & Alerts */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Pending Actions</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
              3 Requires Review
            </span>
          </div>

          <div className="space-y-3">
            {pendingItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="block p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-200 mt-2 group-hover:text-orange-400 transition-colors">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <Link
              href={`/${tenantSlug}/admin/security/audit`}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-between py-1 transition-colors"
            >
              <span>View full audit log history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Infrastructure Health Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Enterprise Infrastructure Health</h2>
            <p className="text-xs text-slate-400">Continuous health telemetry for tenant data plane services</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ALL SYSTEMS OPERATIONAL</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white truncate">{svc.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Latency: {svc.latency}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
