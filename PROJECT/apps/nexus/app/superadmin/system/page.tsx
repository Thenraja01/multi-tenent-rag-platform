'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  Server,
  Database,
  HardDrive,
  Cpu,
  Radio,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Users,
  Building2,
  Lock,
  Terminal,
  Zap,
} from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { superadminApi } from '@/lib/api/superadmin';

const ICON_MAP: Record<string, any> = {
  fastapi: Server,
  database: Database,
  pgvector: HardDrive,
  redis: Radio,
  minio: HardDrive,
  llm: Cpu,
  worker: Activity,
  jwt_auth: ShieldCheck,
};

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await superadminApi.getSystemHealth();
      setHealthData(data);
      setLastChecked(new Date());
    } catch (err) {
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Auto-refresh interval every 15 seconds if active
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHealth();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const rawServices = healthData?.services || [];
  const healthyCount = healthData?.healthy_count ?? rawServices.filter((s: any) => s.is_healthy).length;
  const totalCount = healthData?.total_count ?? (rawServices.length || 8);
  const platformSLA = healthData?.platform_sla ?? `${Math.round((healthyCount / totalCount) * 100)}%`;
  const isOperational = healthyCount === totalCount && totalCount > 0;
  const dbStats = healthData?.database_stats || {};
  const sysInfo = healthData?.system_info || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Telemetry & Infrastructure Diagnostics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Infrastructure Health</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time live heartbeat probes across PostgreSQL database, vector embeddings, cache, storage, and AI runtimes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
              Updated: {lastChecked.toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoRefresh ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span>Auto (15s)</span>
          </button>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Probing...' : 'Probe Subsystems'}</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Platform SLA"
          value={platformSLA}
          trend={healthyCount >= 6 ? 'up' : 'down'}
          change={isOperational ? '100% Operational' : `${totalCount - healthyCount} Service(s) Degraded`}
        />
        <KpiCard
          title="Healthy Subsystems"
          value={`${healthyCount} / ${totalCount}`}
          trend={healthyCount === totalCount ? 'up' : 'neutral'}
          change={isOperational ? 'All Probes Passing' : 'Partial Availability'}
        />
        <KpiCard
          title="Database Engine"
          value={healthData?.database_mode || 'PostgreSQL'}
          trend="up"
          change={healthData?.database_mode?.includes('PostgreSQL') ? 'PostgreSQL + pgvector' : 'Local SQLite Storage'}
        />
        <KpiCard
          title="Platform Uptime"
          value={healthData?.uptime_formatted || 'Live'}
          change={`Python ${sysInfo.python_version || '3.12'}`}
        />
      </div>

      {/* Database Live Telemetry & Table Statistics */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Live Database Telemetry & Record Indexes</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Live Connected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <Building2 className="w-3 h-3 text-indigo-400" />
              <span>Organizations</span>
            </div>
            <span className="text-lg font-extrabold text-white block">{dbStats.organizations ?? '—'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <Users className="w-3 h-3 text-sky-400" />
              <span>Users / Members</span>
            </div>
            <span className="text-lg font-extrabold text-white block">{dbStats.users ?? '—'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>Departments</span>
            </div>
            <span className="text-lg font-extrabold text-white block">{dbStats.departments ?? '—'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <FileText className="w-3 h-3 text-purple-400" />
              <span>RAG Documents</span>
            </div>
            <span className="text-lg font-extrabold text-white block">{dbStats.documents ?? '—'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <HardDrive className="w-3 h-3 text-amber-400" />
              <span>Vector Chunks</span>
            </div>
            <span className="text-lg font-extrabold text-white block">{dbStats.chunks ?? '—'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
              <Lock className="w-3 h-3 text-rose-400" />
              <span>Audit Log Trails</span>
            </div>
            <span className="text-lg font-extrabold text-white block">{dbStats.audit_logs ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Subsystem Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rawServices.map((srv: any) => {
          const Icon = ICON_MAP[srv.id] || Server;
          const isHealthy = srv.is_healthy || srv.status === 'HEALTHY';
          const isFallback = srv.status === 'FALLBACK' || srv.status === 'DEGRADED';

          return (
            <div
              key={srv.id || srv.name}
              className={`p-5 rounded-3xl bg-slate-900/60 border backdrop-blur-xl shadow-xl space-y-3.5 transition-all ${
                isHealthy
                  ? 'border-slate-800/80 hover:border-slate-700'
                  : isFallback
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-rose-500/30 bg-rose-950/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${
                      isHealthy
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isFallback
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white tracking-tight">{srv.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{srv.desc}</p>
                  </div>
                </div>

                <StatusBadge
                  status={
                    srv.status === 'HEALTHY'
                      ? 'ACTIVE'
                      : srv.status === 'FALLBACK' || srv.status === 'DEGRADED'
                      ? 'PENDING'
                      : 'SUSPENDED'
                  }
                  label={srv.status}
                />
              </div>

              {/* Subsystem Details & Metadata */}
              {srv.details && (
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/60 flex flex-wrap gap-3 text-[11px] font-mono text-slate-400">
                  {Object.entries(srv.details).map(([key, val]: [string, any]) => {
                    if (typeof val === 'object') return null;
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className="text-slate-500">{key}:</span>
                        <span className="text-slate-300 font-semibold">{String(val)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Live Ping / Roundtrip:</span>
                <span
                  className={`font-bold ${
                    isHealthy
                      ? 'text-emerald-400'
                      : isFallback
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {srv.latency}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Server Info Footer */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Host: <strong className="text-slate-200">{sysInfo.hostname || 'localhost'}</strong></span>
          <span className="text-slate-600">•</span>
          <span>OS: <strong className="text-slate-200">{sysInfo.os || 'Windows/Linux'}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Python: <strong className="text-slate-200">{sysInfo.python_version || '3.12'}</strong></span>
        </div>

        <div className="text-slate-500">
          NexusRAG Enterprise Core v{sysInfo.app_version || '2.0.0'}
        </div>
      </div>
    </div>
  );
}
