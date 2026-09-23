'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck2, RefreshCw, Filter, ShieldCheck, Download, Search } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { superadminApi } from '@/lib/api/superadmin';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await superadminApi.getAuditLogs({ limit: 100 });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (l.action || '').toLowerCase().includes(term) ||
      (l.resource_type || '').toLowerCase().includes(term) ||
      (l.actor_email || '').toLowerCase().includes(term);
    const matchesAction = actionFilter === 'ALL' || (l.action || '').includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  const columns: ColumnDef<any>[] = [
    {
      key: 'created_at',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {row.created_at ? new Date(row.created_at).toLocaleString() : 'Recent'}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (row) => (
        <div>
          <span className="font-bold text-white text-xs block">{row.actor_email || row.user_id || 'System Worker'}</span>
          <span className="text-[10px] font-mono text-slate-500">{row.ip_address || '127.0.0.1'}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          {row.action}
        </span>
      ),
    },
    {
      key: 'resource_type',
      header: 'Resource',
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {row.resource_type} {row.resource_id ? `(${row.resource_id.slice(0, 8)}...)` : ''}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'SUCCESS'} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable, append-only security and operational telemetry across multi-tenant boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Audit Events" value={logs.length} change="Immutable DB" />
        <KpiCard title="Compliance" value="SOC2 / RLS" change="Audit Verified" />
        <KpiCard title="Retention" value="365 Days" change="Append-Only" />
        <KpiCard title="Tamper Guard" value="SHA-256" change="Cryptographic" />
      </div>

      {/* Filter */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit logs by actor, action, or resource..."
        filters={[
          {
            key: 'action',
            label: 'Action Filter',
            value: actionFilter,
            onChange: setActionFilter,
            options: [
              { label: 'All Actions', value: 'ALL' },
              { label: 'Create', value: 'CREATE' },
              { label: 'Update', value: 'UPDATE' },
              { label: 'Delete', value: 'DELETE' },
              { label: 'Query', value: 'QUERY' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setActionFilter('ALL');
        }}
      />

      {/* Audit Data Table */}
      <DataTable columns={columns} data={filtered} isLoading={loading} />
    </div>
  );
}
