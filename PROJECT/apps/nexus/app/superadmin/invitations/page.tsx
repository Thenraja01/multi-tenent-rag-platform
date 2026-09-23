'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MailCheck,
  Plus,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Sliders,
  UserCheck,
} from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { superadminApi, OrganizationDTO } from '@/lib/api/superadmin';
import { apiClient } from '@/lib/api/client';

export default function SuperAdminInvitationsAndApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'approvals' | 'invitations'>('approvals');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('ALL');

  // Organizations & Requests State
  const [organizations, setOrganizations] = useState<OrganizationDTO[]>([]);
  const [approvalModalData, setApprovalModalData] = useState<{
    isOpen: boolean;
    org: any | null;
    activationUrl?: string;
    token?: string;
    copied: boolean;
    loading: boolean;
  }>({
    isOpen: false,
    org: null,
    copied: false,
    loading: false,
  });

  // Invitations State
  const [invitations, setInvitations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: '',
    organization_id: '',
    role_name: 'Member',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgsRes, invRes, rolesRes] = await Promise.all([
        superadminApi.getOrganizations(),
        apiClient.get('/invitations').then((r) => r.data).catch(() => []),
        superadminApi.getRoles().catch(() => []),
      ]);
      setOrganizations(orgsRes || []);
      setInvitations(invRes || []);
      setRoles(rolesRes || []);
      if (orgsRes && orgsRes.length > 0 && !newInvite.organization_id) {
        setNewInvite((prev) => ({ ...prev, organization_id: prev.organization_id || orgsRes[0].id }));
      }
    } catch (err) {
      console.error('Failed to load invitations & org approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Approve Organization & Generate Activation Link
  const handleOpenApproveModal = async (org: any) => {
    setApprovalModalData({
      isOpen: true,
      org,
      activationUrl: undefined,
      token: undefined,
      copied: false,
      loading: true,
    });

    try {
      const res = await superadminApi.approveOrganization(org.id);
      const fullUrl = `${window.location.origin}${res.activation_url}`;
      setApprovalModalData((prev) => ({
        ...prev,
        activationUrl: fullUrl,
        token: res.activation_token,
        loading: false,
      }));
      fetchData();
    } catch (err: any) {
      // If already active or fallback to activate
      try {
        await superadminApi.activateOrganization(org.id);
        setApprovalModalData((prev) => ({
          ...prev,
          activationUrl: `${window.location.origin}/${org.slug}/dashboard`,
          loading: false,
        }));
        fetchData();
      } catch {
        alert(err?.response?.data?.detail || 'Failed to generate approval activation token.');
        setApprovalModalData((prev) => ({ ...prev, isOpen: false, loading: false }));
      }
    }
  };

  const handleRejectOrg = async (orgId: string) => {
    if (!confirm('Are you sure you want to reject/suspend this organization registration?')) return;
    try {
      await superadminApi.rejectOrganization(orgId, 'Superadmin rejection');
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to reject organization.');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await apiClient.post('/invitations', {
        email: newInvite.email,
        organization_id: newInvite.organization_id,
        role_name: newInvite.role_name,
      });
      setIsInviteOpen(false);
      setNewInvite({ email: '', organization_id: organizations[0]?.id || '', role_name: 'Member' });
      await fetchData();
    } catch (err) {
      console.error('Failed to send invitation:', err);
    } finally {
      setInviteLoading(false);
    }
  };

  const pendingOrgsCount = organizations.filter(
    (o) => (o.status || '').toUpperCase() === 'PENDING' || (o.status || '').toUpperCase() === 'PENDING_APPROVAL'
  ).length;

  // Filtered Organizations
  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      (org.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (org.slug || '').toLowerCase().includes(search.toLowerCase()) ||
      (org.subdomain || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const orgStatus = (org.status || '').toUpperCase();
    if (statusFilter === 'PENDING') {
      return orgStatus === 'PENDING' || orgStatus === 'PENDING_APPROVAL';
    }
    if (statusFilter === 'ACTIVE') {
      return orgStatus === 'ACTIVE' || orgStatus === 'APPROVED';
    }
    if (statusFilter === 'REJECTED') {
      return orgStatus === 'REJECTED' || orgStatus === 'SUSPENDED';
    }
    return true;
  });

  // Filtered Invitations
  const filteredInvitations = invitations.filter(
    (inv) =>
      (inv.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.organization_name || inv.tenant || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.role_name || '').toLowerCase().includes(search.toLowerCase())
  );

  // Columns for Organization Approvals
  const orgColumns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Organization',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 shrink-0">
            {row.name.charAt(0)}
          </div>
          <div>
            <Link
              href={`/superadmin/organizations/${row.id}`}
              className="text-xs font-bold text-white hover:text-indigo-400 transition block truncate"
            >
              {row.name}
            </Link>
            <span className="text-[10px] font-mono text-slate-400 block">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'subdomain',
      header: 'Assigned Subdomain',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
          {row.subdomain || `${row.slug}.nexusrag.app`}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Subscription Pack',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-300 font-medium">
          {typeof row.plan === 'object' ? row.plan?.name : row.plan_name || row.plan || 'Enterprise Plan'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Approval Status',
      sortable: true,
      render: (row) => {
        const s = (row.status || 'PENDING').toUpperCase();
        const isPending = s === 'PENDING' || s === 'PENDING_APPROVAL';
        return (
          <div className="flex items-center gap-1.5">
            <StatusBadge status={isPending ? 'PENDING' : s === 'ACTIVE' || s === 'APPROVED' ? 'ACTIVE' : 'SUSPENDED'} />
            {isPending && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            )}
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Registered',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-slate-400">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'SuperAdmin Actions',
      render: (row) => {
        const s = (row.status || '').toUpperCase();
        const isPending = s === 'PENDING' || s === 'PENDING_APPROVAL';

        return (
          <div className="flex items-center gap-2">
            {isPending ? (
              <>
                <button
                  onClick={() => handleOpenApproveModal(row)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Org</span>
                </button>
                <button
                  onClick={() => handleRejectOrg(row.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold border border-rose-500/20 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenApproveModal(row)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/20 transition cursor-pointer"
                  title="Generate signed activation token link"
                >
                  Activation Link
                </button>
                <Link
                  href={`/superadmin/organizations/${row.id}`}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Manage Organization"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // Columns for Invitations
  const invColumns: ColumnDef<any>[] = [
    {
      key: 'email',
      header: 'Recipient Email',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
            @
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{row.email}</span>
            <span className="text-[10px] font-mono text-slate-500">ID: {row.id?.slice(0, 8) || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'organization',
      header: 'Target Organization',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-slate-300">
          {row.organization_name || row.tenant || 'Global Scope'}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          {row.role_name || row.role || 'Member'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        const s = (row.status || 'PENDING').toUpperCase();
        return <StatusBadge status={s === 'ACTIVE' || s === 'ACCEPTED' ? 'ACTIVE' : s === 'EXPIRED' ? 'SUSPENDED' : 'PENDING'} />;
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-slate-400">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Platform Governance & Onboarding</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Tenant Approvals & Member Invitations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review incoming organization signup requests, grant approvals, and dispatch tenant invitations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Member Invite</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Pending Approvals"
          value={pendingOrgsCount}
          trend={pendingOrgsCount > 0 ? 'up' : 'neutral'}
          change={pendingOrgsCount > 0 ? 'Awaiting Action' : 'All Clear'}
        />
        <KpiCard title="Total Organizations" value={organizations.length} change="Tenants" />
        <KpiCard title="Active Invitations" value={invitations.length} change="Sent" />
        <KpiCard
          title="Active Tenants"
          value={organizations.filter((o) => (o.status || '').toUpperCase() === 'ACTIVE').length}
          trend="up"
          change="Provisioned"
        />
      </div>

      {/* Navigation Segmented Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Organization Approvals & Requests</span>
            {pendingOrgsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px]">
                {pendingOrgsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'invitations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MailCheck className="w-3.5 h-3.5" />
            <span>Member Invitations</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px]">
              {invitations.length}
            </span>
          </button>
        </div>

        {activeTab === 'approvals' && (
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'PENDING', 'ACTIVE', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Pending' : st === 'ACTIVE' ? 'Active' : 'Rejected'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === 'approvals'
            ? 'Search organization by name, slug, or subdomain...'
            : 'Search invitations by email, organization, or role...'
        }
        onReset={() => setSearch('')}
      />

      {/* Dynamic Tab View */}
      {activeTab === 'approvals' ? (
        <DataTable columns={orgColumns} data={filteredOrgs} isLoading={loading} />
      ) : (
        <DataTable columns={invColumns} data={filteredInvitations} isLoading={loading} />
      )}

      {/* Approval & Activation Token Modal */}
      {approvalModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Organization Approved: {approvalModalData.org?.name}
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">Ready for Setup Wizard</span>
                </div>
              </div>
              <button
                onClick={() => setApprovalModalData((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {approvalModalData.loading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span>Signing one-time tenant activation token...</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-white">{approvalModalData.org?.name}</strong> has been approved. The tenant administrator can now complete their 3-step setup wizard (domain selection & master admin password).
                </p>

                {approvalModalData.activationUrl && (
                  <div className="space-y-1.5">
                    <label className="font-mono text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      One-Time Signed Activation Link
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={approvalModalData.activationUrl}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none select-all"
                      />
                      <button
                        onClick={() => {
                          if (approvalModalData.activationUrl) {
                            navigator.clipboard.writeText(approvalModalData.activationUrl);
                            setApprovalModalData((prev) => ({ ...prev, copied: true }));
                            setTimeout(() => setApprovalModalData((prev) => ({ ...prev, copied: false })), 2000);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-lg shadow-emerald-600/25"
                      >
                        {approvalModalData.copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{approvalModalData.copied ? 'Copied' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Tenant Slug:</span>
                    <strong className="font-mono text-slate-200">{approvalModalData.org?.slug}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Subdomain:</span>
                    <strong className="font-mono text-sky-400">{approvalModalData.org?.subdomain}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setApprovalModalData((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition cursor-pointer"
                  >
                    Done
                  </button>
                  {approvalModalData.activationUrl && (
                    <a
                      href={approvalModalData.activationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                    >
                      <span>Open Setup Wizard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Member Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MailCheck className="w-4 h-4 text-indigo-400" />
                <span>Send Member Invitation</span>
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 font-mono">Recipient Email *</label>
                <input
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  placeholder="colleague@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 font-mono">Target Organization *</label>
                <select
                  value={newInvite.organization_id}
                  onChange={(e) => setNewInvite({ ...newInvite, organization_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  required
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 font-mono">Assigned Role</label>
                <select
                  value={newInvite.role_name}
                  onChange={(e) => setNewInvite({ ...newInvite, role_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {roles.length === 0 ? (
                    <>
                      <option value="Organization Admin">Organization Admin</option>
                      <option value="Domain Admin">Domain Admin</option>
                      <option value="Member">Member / Employee</option>
                    </>
                  ) : (
                    roles
                      .filter((r) => r.slug !== 'super_admin')
                      .map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} {r.is_system ? '— (System)' : '— (Custom RBAC)'}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 cursor-pointer"
                >
                  {inviteLoading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
