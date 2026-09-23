'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, ExternalLink, MoreVertical, Shield, Users, Layers, Download, RefreshCw } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { KpiCard } from '@/components/shared/KpiCard';
import { superadminApi, OrganizationDTO } from '@/lib/api/superadmin';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationDTO | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<OrganizationDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const data = await superadminApi.getOrganizations({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter.toLowerCase() : undefined,
      });
      setOrganizations(data || []);
    } catch (err) {
      console.error('Failed to fetch organizations from backend API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [statusFilter]);

  const handleSearchSubmit = () => {
    fetchOrgs();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await superadminApi.deleteOrganization(deleteTarget.id);
      setDeleteTarget(null);
      await fetchOrgs();
    } catch (err) {
      console.error('Failed to delete organization:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    setActionLoading(true);
    try {
      if (suspendTarget.status === 'suspended') {
        await superadminApi.activateOrganization(suspendTarget.id);
      } else {
        await superadminApi.suspendOrganization(suspendTarget.id, 'Administrative suspension');
      }
      setSuspendTarget(null);
      await fetchOrgs();
    } catch (err) {
      console.error('Failed to update organization status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<OrganizationDTO>[] = [
    {
      key: 'name',
      header: 'Organization',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {row.name.charAt(0)}
          </div>
          <div>
            <Link
              href={`/superadmin/organizations/${row.id}`}
              className="text-xs font-bold text-white hover:text-indigo-400 transition block truncate"
            >
              {row.name}
            </Link>
            <span className="text-[10px] font-mono text-slate-500">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Assigned Pack',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-500/20">
          {row.plan || row.plan_name || 'Standard Suite'}
        </span>
      ),
    },
    {
      key: 'subdomain',
      header: 'Subdomain',
      render: (row) => (
        <span className="text-xs font-mono text-sky-400 flex items-center gap-1">
          <span>{row.subdomain}.nexusrag.com</span>
        </span>
      ),
    },
    {
      key: 'domainsCount',
      header: 'Domains',
      sortable: true,
      render: (row) => <span className="font-mono text-xs text-slate-300">{row.domainsCount ?? row.domains?.length ?? 0} Domains</span>,
    },
    {
      key: 'usersCount',
      header: 'Users',
      sortable: true,
      render: (row) => <span className="font-mono text-xs text-slate-300">{row.usersCount ?? 0} Users</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-400 font-mono">{row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Active'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="relative inline-block text-left">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === row.id ? null : row.id);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {activeMenuId === row.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <Link
                href={`/superadmin/organizations/${row.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <span>View Details</span>
              </Link>
              <Link
                href={`/superadmin/organizations/${row.id}?tab=users`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <span>Manage Users</span>
              </Link>
              <button
                onClick={() => {
                  setSuspendTarget(row);
                  setActiveMenuId(null);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-amber-400 hover:bg-amber-500/10 transition"
              >
                <span>{row.status === 'suspended' ? 'Activate' : 'Suspend'}</span>
              </button>
              <button
                onClick={() => {
                  setDeleteTarget(row);
                  setActiveMenuId(null);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition"
              >
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" onClick={() => setActiveMenuId(null)}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Organizations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-tenant organizations, provisioned packs, subdomains, and domain allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrgs}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <Link
            href="/superadmin/organizations/create"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Organization</span>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Total Organizations" value={organizations.length} change="Live API" />
        <KpiCard title="Active Tenants" value={organizations.filter(o => o.status === 'active').length} trend="up" change="Operational" />
        <KpiCard title="Suspended" value={organizations.filter(o => o.status === 'suspended').length} trend="down" change="Blocked" />
        <KpiCard title="Pending" value={organizations.filter(o => o.status === 'pending').length} trend="neutral" change="In Review" />
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search organizations by name or slug..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active', value: 'active' },
              { label: 'Suspended', value: 'suspended' },
              { label: 'Pending', value: 'pending' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('ALL');
        }}
      />

      {/* Organizations Data Table */}
      <DataTable columns={columns} data={organizations} isLoading={loading} />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={actionLoading}
        title="Delete Organization"
        description={`Are you sure you want to delete ${deleteTarget?.name}? All associated domains, modules, user memberships, and pgvector knowledge chunks will be permanently removed.`}
        confirmText="Delete Organization"
        variant="danger"
      />

      {/* Confirm Suspend Dialog */}
      <ConfirmDialog
        isOpen={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleConfirmSuspend}
        isLoading={actionLoading}
        title={suspendTarget?.status === 'suspended' ? 'Activate Organization' : 'Suspend Organization'}
        description={`When suspended, users under ${suspendTarget?.name} will be immediately blocked from accessing their workspace and running RAG queries.`}
        confirmText={suspendTarget?.status === 'suspended' ? 'Activate' : 'Suspend'}
        variant={suspendTarget?.status === 'suspended' ? 'info' : 'warning'}
      />
    </div>
  );
}
