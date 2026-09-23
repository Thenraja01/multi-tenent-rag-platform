'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Server,
  Users,
  Package,
  Layers,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  MoreVertical,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Cpu,
  Zap,
  Lock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrgs: 0,
    totalTenants: 0,
    totalUsers: 0,
    activePacks: 0,
    activeDomains: 0,
    totalDocs: 0,
    vectorChunks: 0,
  });
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const fetchLiveDashboardData = async () => {
    setLoading(true);
    try {
      const [orgsRes, packsRes, domainsRes, usersRes, docsRes, auditRes] = await Promise.allSettled([
        apiClient.get('/organizations'),
        apiClient.get('/packs'),
        apiClient.get('/domains'),
        apiClient.get('/users'),
        apiClient.get('/documents'),
        apiClient.get('/audit'),
      ]);

      const orgList = orgsRes.status === 'fulfilled' && Array.isArray(orgsRes.value.data) ? orgsRes.value.data : [];
      const packList = packsRes.status === 'fulfilled' && Array.isArray(packsRes.value.data) ? packsRes.value.data : [];
      const domainList = domainsRes.status === 'fulfilled' && Array.isArray(domainsRes.value.data) ? domainsRes.value.data : [];
      const userList = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data) ? usersRes.value.data : [];
      const docList = docsRes.status === 'fulfilled' && Array.isArray(docsRes.value.data) ? docsRes.value.data : [];
      const auditList = auditRes.status === 'fulfilled' && Array.isArray(auditRes.value.data) ? auditRes.value.data : [];

      setOrganizations(orgList);
      setPacks(packList);
      setDomains(domainList);

      // Aggregate live metrics
      const totalChunks = docList.reduce((acc: number, d: any) => acc + (d.chunk_count || 0), 0);
      setMetrics({
        totalOrgs: orgList.length,
        totalTenants: orgList.filter((o: any) => o.status !== 'DELETED').length,
        totalUsers: userList.length,
        activePacks: packList.length,
        activeDomains: domainList.length,
        totalDocs: docList.length,
        vectorChunks: totalChunks,
      });

      // Map live audit events to activity timeline
      if (auditList.length > 0) {
        setRecentActivities(
          auditList.slice(0, 5).map((a: any, idx: number) => ({
            id: a.id || `act-${idx}`,
            action: a.action || 'System Event',
            desc: a.metadata?.filename ? `Document: ${a.metadata.filename}` : (a.details || `${a.resource_type || 'Platform'} operation`),
            time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            icon: a.action?.includes('ORG') ? Building2 : a.action?.includes('DOC') ? FileText : Activity,
            color: a.action?.includes('DOC') ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50',
          }))
        );
      } else {
        setRecentActivities([
          { id: '1', action: 'Platform engine active', desc: 'Zero-trust tenant isolation active', time: 'Active', icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
          { id: '2', action: 'RAG vector memory ready', desc: 'pgvector extension running', time: 'Active', icon: Cpu, color: 'text-blue-600 bg-blue-50' },
          { id: '3', action: 'Seeder database ready', desc: 'Pre-configured domain packs loaded', time: 'Active', icon: Package, color: 'text-purple-600 bg-purple-50' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load live dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto nexus-grid-pattern">
      {/* 1. HERO SECTION WITH 3D ISOMETRIC CORE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-indigo-50/90 border border-blue-100/80 p-8 shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 nexus-hero-glow pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text & Live Metrics */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Super Admin Dashboard</span>
              </div>
              <button
                onClick={fetchLiveDashboardData}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-blue-600 transition"
                title="Refresh live metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                Welcome back, Then Raja 👋
              </h1>
              <p className="text-sm lg:text-base text-slate-600 max-w-2xl leading-relaxed">
                Manage your multi-tenant platform, organizations, packs, domains and ensure a secure and scalable enterprise AI experience.
              </p>
            </div>

            {/* In-Hero Dynamic Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total Orgs</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{loading ? '-' : metrics.totalOrgs}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    Live DB
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Server className="w-3.5 h-3.5 text-sky-600" />
                  <span>Total Tenants</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{loading ? '-' : metrics.totalTenants}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Total Users</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{loading ? '-' : metrics.totalUsers}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    Users
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                  <span>Active Packs</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{loading ? '-' : metrics.activePacks}</span>
                  <span className="text-[11px] font-medium text-slate-400">Packs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Futuristic 3D NEXUS Core Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-xs p-6 rounded-3xl bg-white/95 border border-blue-200/80 shadow-lg shadow-blue-500/10 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/30 transform hover:rotate-6 transition-transform">
                N
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">NEXUS RAG Core</h3>
                <p className="text-xs text-slate-500 mt-1">One Platform. Multiple Tenants. Infinite Possibilities.</p>
              </div>
              <Link
                href="/superadmin/rag"
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <span>View RAG Infrastructure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Orgs Table, Packs Chart, Domains & Modules */}
        <div className="lg:col-span-8 space-y-8">
          {/* Organizations Overview Card */}
          <div className="nexus-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Organizations Overview</h2>
                  <p className="text-xs text-slate-500">Live enterprise tenants queried from database</p>
                </div>
              </div>
              <Link
                href="/superadmin/organizations"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All ({organizations.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="text-xs font-medium">Fetching organizations from database...</span>
                </div>
              ) : organizations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No organizations found in database. Create your first tenant!
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3 font-semibold">Organization</th>
                      <th className="pb-3 font-semibold">Tenant Subdomain</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {organizations.slice(0, 6).map((org) => (
                      <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 font-semibold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {(org.name || 'O')[0]}
                          </div>
                          <span>{org.name || 'Unnamed Tenant'}</span>
                        </td>
                        <td className="py-3.5 font-mono text-slate-500">
                          {org.slug || org.subdomain || 'tenant'}.localfix.app
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              org.status === 'ACTIVE'
                                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                                : 'text-amber-600 bg-amber-50 border-amber-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {org.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            href={`/superadmin/organizations/${org.id}`}
                            className="p-1 text-slate-400 hover:text-blue-600 inline-block rounded-md hover:bg-slate-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 2-Grid: Packs Performance Donut & Knowledge Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Packs Performance */}
            <div className="nexus-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Package className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Packs Performance</h3>
                </div>
                <Link href="/superadmin/packs" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="relative w-36 h-36 rounded-full border-12 border-blue-500 border-t-purple-500 border-r-emerald-500 border-b-amber-500 flex items-center justify-center shadow-xs">
                  <div className="text-center">
                    <span className="text-xl font-black text-slate-900 block">{packs.length || 4}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Packs</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-slate-600">HR</span>
                  <span className="ml-auto font-bold text-slate-900">25%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-600">IT</span>
                  <span className="ml-auto font-bold text-slate-900">25%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Finance</span>
                  <span className="ml-auto font-bold text-slate-900">25%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600">Support</span>
                  <span className="ml-auto font-bold text-slate-900">25%</span>
                </div>
              </div>
            </div>

            {/* Knowledge & RAG Stats Card */}
            <div className="nexus-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Knowledge & AI Memory</h3>
                </div>
                <Link href="/superadmin/knowledge" className="text-xs font-semibold text-blue-600 hover:underline">
                  Explore →
                </Link>
              </div>

              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-600">Total Stored Documents</span>
                  <span className="text-xs font-bold text-slate-900">{metrics.totalDocs}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-600">Vector Embeddings</span>
                  <span className="text-xs font-bold text-slate-900">{metrics.vectorChunks} chunks</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-600">PostgreSQL pgvector</span>
                  <span className="text-xs font-bold text-emerald-600">HNSW Indexed</span>
                </div>
              </div>

              <Link
                href="/superadmin/rag"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition"
              >
                Configure Vector Pipelines
              </Link>
            </div>
          </div>

          {/* Domains & Modules Live Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Domains & Modules</h2>
                  <p className="text-xs text-slate-500">Live domain configurations loaded from database</p>
                </div>
              </div>
              <Link href="/superadmin/domains" className="text-xs font-semibold text-blue-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {domains.length === 0 ? (
                <div className="col-span-4 p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Loading domain capabilities...
                </div>
              ) : (
                domains.slice(0, 4).map((dom) => (
                  <div key={dom.id} className="nexus-card p-4 space-y-3 hover:border-blue-300">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                      {(dom.slug || dom.name || 'D').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{dom.name || dom.slug} Domain</h4>
                      <p className="text-[11px] text-slate-500 truncate">{dom.category || 'Business Vertical'}</p>
                    </div>
                    <div className="text-[10px] text-blue-700 font-semibold pt-1 border-t border-slate-100 flex justify-between">
                      <span>Status: {dom.status || 'ACTIVE'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions + Recent Activity */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions Panel */}
          <div className="nexus-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/superadmin/organizations"
                className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-900">Create Organization</p>
                  <p className="text-[11px] text-slate-500">Add a new organization (tenant)</p>
                </div>
              </Link>

              <Link
                href="/superadmin/packs"
                className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/60 hover:bg-purple-100/70 border border-purple-100 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-purple-900">Create Pack</p>
                  <p className="text-[11px] text-slate-500">Define a new department pack</p>
                </div>
              </Link>

              <Link
                href="/superadmin/domains"
                className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-100 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-sky-900">Create Domain</p>
                  <p className="text-[11px] text-slate-500">Add domain (e.g., HR, Finance, IT)</p>
                </div>
              </Link>

              <Link
                href="/superadmin/users"
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">Manage Users</p>
                  <p className="text-[11px] text-slate-500">Add or invite new users</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Live Recent Activity Timeline */}
          <div className="nexus-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              </div>
              <Link href="/superadmin/audit" className="text-xs font-semibold text-blue-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-100">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="relative flex items-start gap-3 pl-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${act.color} ring-4 ring-white shadow-2xs`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 font-mono block">{act.time}</span>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{act.action}</p>
                      <p className="text-[11px] text-slate-500 truncate">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ENTERPRISE SECURITY & SCALABILITY BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Enterprise Ready. Secure. Scalable.</h4>
            <p className="text-xs text-blue-100">NexusRAG ensures your data is isolated, secure and always under your control.</p>
          </div>
        </div>
        <Link
          href="/superadmin/settings"
          className="py-2 px-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition shrink-0 shadow-xs"
        >
          View System Settings →
        </Link>
      </div>
    </div>
  );
}
