"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Database, Server, ShieldCheck, Activity, Cpu, HardDrive, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { superadminApi, DashboardMetrics } from '@/lib/api/superadmin';

export default function SuperAdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await superadminApi.getDashboard();
      setMetrics(res);
    } catch {
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalVectorChunks = metrics?.vector_chunks ?? 0;
  const totalQueries = metrics?.total_rag_queries ?? 0;
  const tokenUsage = metrics?.token_usage ?? 0;

  const domainUsage: any[] = [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Cluster Infrastructure
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Global Analytics & Cluster Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor vector storage consumption, RAG retrieval latencies, and token utilization across business domains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            {loading ? "Refreshing..." : "Refresh Analytics"}
          </Button>
        </div>
      </div>

      {/* Cluster Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-800 bg-slate-900/60">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Vector Chunks</span>
          <div className="text-xl font-bold text-indigo-400">
            {totalVectorChunks.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4 border-slate-800 bg-slate-900/60">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Total RAG Queries</span>
          <div className="text-xl font-bold text-emerald-400">
            {totalQueries.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4 border-slate-800 bg-slate-900/60">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Monthly Tokens</span>
          <div className="text-xl font-bold text-blue-400">
            {tokenUsage.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4 border-slate-800 bg-slate-900/60">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Cluster Health</span>
          <div className="text-xl font-bold text-purple-400">
            {metrics?.system_health || 'OPTIMAL'}
          </div>
        </Card>
      </div>

      {/* Domain Vector Storage Table */}
      <Card className="p-6 border-slate-800 bg-slate-900/60 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span>Domain Partition Storage & Query Velocity</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Business Domain</th>
                <th className="p-3">Indexed Documents</th>
                <th className="p-3">Retrieval Queries</th>
                <th className="p-3">Vector Partition Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {domainUsage.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-sans">
                    No active domain vector partitions recorded.
                  </td>
                </tr>
              ) : (
                domainUsage.map((d: any) => (
                  <tr key={d.domain} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-white font-sans">{d.domain}</td>
                    <td className="p-3 text-indigo-400">{d.documents}</td>
                    <td className="p-3 text-emerald-400">{d.queries.toLocaleString()}</td>
                    <td className="p-3 text-blue-400">{d.storageGb} GB</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
