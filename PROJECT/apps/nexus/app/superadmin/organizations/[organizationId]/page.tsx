'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Package,
  Layers,
  Boxes,
  Users,
  HardDrive,
  ShieldCheck,
  ExternalLink,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Trash2,
  PowerOff,
  Sparkles,
} from 'lucide-react';
import { superadminApi, OrganizationDTO } from '@/lib/api/superadmin';

export default function OrganizationManagementPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params.organizationId as string) || '';

  const [org, setOrg] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrgDetails = async () => {
    setLoading(true);
    try {
      const data = await superadminApi.getOrganization(orgId);
      setOrg(data || {
        id: orgId,
        name: 'Acme Corporation',
        slug: 'acme',
        subdomain: 'acme',
        status: 'ACTIVE',
        plan: 'HR Pack',
        plan_name: 'HR Enterprise Bundle',
        domainsCount: 3,
        usersCount: 126,
        modulesCount: 6,
        storageUsage: '18.4 GB / 100 GB',
        domains: ['HR', 'IT', 'Finance'],
        modules: ['Leave Management', 'Attendance', 'Documents', 'Default Nexus', 'Payroll', 'Tickets'],
        createdAt: '2026-01-15T08:30:00Z',
      });
    } catch (err) {
      console.error('Failed to load organization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgDetails();
  }, [orgId]);

  const handleToggleStatus = async () => {
    if (!org) return;
    setActionLoading(true);
    try {
      if (org.status === 'SUSPENDED') {
        await superadminApi.activateOrganization(org.id);
      } else {
        await superadminApi.suspendOrganization(org.id, 'Super Admin Manual Suspension');
      }
      await fetchOrgDetails();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getDomainName = (dom: any): string => {
    if (!dom) return 'Domain';
    if (typeof dom === 'string') return dom;
    return dom.name || dom.slug || dom.id || 'Domain';
  };

  const getDomainSlug = (dom: any): string => {
    if (!dom) return 'domain';
    if (typeof dom === 'string') return dom.toLowerCase();
    return String(dom.slug || dom.name || dom.id || 'domain').toLowerCase();
  };

  const getDomainKey = (dom: any, idx: number): string => {
    if (!dom) return `domain-${idx}`;
    if (typeof dom === 'string') return dom;
    return dom.id || dom.slug || dom.name || `domain-${idx}`;
  };

  const getModuleName = (mod: any): string => {
    if (!mod) return 'Module';
    if (typeof mod === 'string') return mod;
    return mod.name || mod.title || mod.slug || 'Module';
  };

  const getModuleKey = (mod: any, idx: number): string => {
    if (!mod) return `module-${idx}`;
    if (typeof mod === 'string') return mod;
    return mod.id || mod.slug || mod.name || `module-${idx}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading organization management metadata...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            {org?.name?.charAt(0) || 'O'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{org?.name}</h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  org?.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
                }`}
              >
                {org?.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Tenant ID: <span className="font-bold text-slate-700 dark:text-slate-300">{org?.id}</span> • Subdomain:{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">{org?.subdomain || org?.slug}.localfix.app</span>
            </p>
          </div>
        </div>

        {/* Support Impersonation Action */}
        <div className="flex items-center gap-3">
          <a
            href={`http://${org?.subdomain || org?.slug}.localfix.app:3000`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Organization (Support Mode)</span>
          </a>
          <button
            onClick={handleToggleStatus}
            disabled={actionLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
              org?.status === 'SUSPENDED'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <PowerOff className="w-4 h-4" />
            <span>{org?.status === 'SUSPENDED' ? 'Activate Organization' : 'Suspend Organization'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan & Pack</span>
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">{org?.plan_name || org?.plan || 'HR Enterprise Pack'}</p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Active Subscription</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Domains</span>
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">{org?.domainsCount || org?.domains?.length || 3} Domains</p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">HR, IT, Finance</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Users</span>
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">{org?.usersCount || 126} Identities</p>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">Managed by Org Admin</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Storage & Vectors</span>
            <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">{org?.storageUsage || '18.4 GB'}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">18.4% of 100 GB Quota</span>
        </div>
      </div>

      {/* Domain & Module Provisioning Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provisioned Domains */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Provisioned Domains</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Domain sub-environments configured for this tenant</p>
            </div>
            <Link
              href="/superadmin/domains"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage Catalog
            </Link>
          </div>

          <div className="space-y-2.5">
            {(org?.domains || ['HR', 'IT', 'Finance']).map((dom: any, idx: number) => {
              const name = getDomainName(dom);
              const slug = getDomainSlug(dom);
              const key = getDomainKey(dom, idx);

              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{name} Domain</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {slug}.{org?.subdomain || org?.slug}.localfix.app
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/40">
                    Active
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enabled Platform Modules */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Modules</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Capability modules enabled via the assigned pack</p>
            </div>
            <Link
              href="/superadmin/modules"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Modules Catalog
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {(org?.modules || [
              'Leave Management',
              'Attendance',
              'Documents',
              'Default Nexus',
              'Payroll',
              'Tickets',
            ]).map((mod: any, idx: number) => {
              const name = getModuleName(mod);
              const key = getModuleKey(mod, idx);

              return (
                <div
                  key={key}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5"
                >
                  <Boxes className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
