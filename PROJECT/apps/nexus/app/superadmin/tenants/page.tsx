"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  RefreshCw,
  AlertCircle,
  Plus,
  Trash2,
  X,
  CreditCard,
  Mail,
  User,
  Lock,
  Globe,
} from "lucide-react";
import { TenantTable, TenantTableItem } from '@/components/superadmin/TenantTable';
import { Button } from "@/components/ui/Button";
import { superadminApi } from '@/lib/api/superadmin';
import { useSuperAdminEvents } from "@/hooks/useSuperAdminEvents";

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantTableItem[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    admin_email: "",
    admin_name: "",
    admin_password: "Password123!",
    plan_id: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tenantsRes, plansRes] = await Promise.all([
        superadminApi.getOrganizations(),
        superadminApi.getPlans(),
      ]);
      setTenants(Array.isArray(tenantsRes) ? (tenantsRes as any) : []);
      const plansList = Array.isArray(plansRes) ? plansRes : [];
      setPlans(plansList);
      if (plansList.length > 0 && !formData.plan_id) {
        setFormData((prev) => ({ ...prev, plan_id: plansList[0].id }));
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load organizations.");
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time automatic updates
  useSuperAdminEvents((event) => {
    if (
      event.type === "ORGANIZATION_REGISTERED" ||
      event.type === "ORGANIZATION_APPROVED" ||
      event.type === "ORGANIZATION_SUSPENDED" ||
      event.type === "ORGANIZATION_ACTIVATED"
    ) {
      fetchData();
    }
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await superadminApi.createOrganization({
        name: formData.name,
        subdomain: formData.subdomain || formData.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        plan_id: formData.plan_id || undefined,
        admin_email: formData.admin_email || undefined,
        admin_name: formData.admin_name || undefined,
        admin_password: formData.admin_password || undefined,
      });

      setIsCreateModalOpen(false);
      setFormData({
        name: "",
        subdomain: "",
        admin_email: "",
        admin_name: "",
        admin_password: "Password123!",
        plan_id: plans[0]?.id || "",
      });
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to create organization.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await superadminApi.deleteOrganization(deleteTarget.id);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to delete organization.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspend = async (tenantId: string) => {
    try {
      await superadminApi.suspendOrganization(tenantId);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, status: "suspended" } : t))
      );
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to suspend tenant.");
    }
  };

  const handleActivate = async (tenantId: string) => {
    try {
      await superadminApi.activateOrganization(tenantId);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, status: "active" } : t))
      );
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to activate tenant.");
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      (t.name || "").toLowerCase().includes(term) ||
      (t.slug || "").toLowerCase().includes(term) ||
      (t.subdomain || "").toLowerCase().includes(term) ||
      (t.adminEmail || "").toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && (t.status === "active" || t.status === "approved")) ||
      (statusFilter === "SUSPENDED" && t.status === "suspended");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">
              Multi-Tenant Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tenant Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage provisioned organizations, domain partitions, quota limits, and lifecycle status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Organization
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by workspace, slug, subdomain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Workspaces</option>
            <option value="SUSPENDED">Suspended Workspaces</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <TenantTable
        tenants={filteredTenants}
        loading={loading}
        onSuspend={handleSuspend}
        onActivate={handleActivate}
        onDelete={(id, name) => {
          setDeleteTarget({ id, name });
          setIsDeleteModalOpen(true);
        }}
      />

      {/* ── CREATE ORGANIZATION MODAL ────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Tenant Workspace</h3>
                  <p className="text-[11px] text-slate-400">Provision dedicated partitioned RAG environment</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Globex International"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const sub = name.toLowerCase().replace(/[^a-z0-9]/g, "");
                    setFormData({ ...formData, name, subdomain: sub });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                  Subdomain Prefix
                </label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <input
                    type="text"
                    required
                    placeholder="globex"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-transparent text-white text-xs focus:outline-none"
                  />
                  <span className="px-3 text-xs font-mono text-slate-500 border-l border-slate-800">
                    .nexusrag.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                  Subscription Pack Tier
                </label>
                <select
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  {plans.length === 0 && (
                    <option value="">Standard Tier (Default Platform Pack)</option>
                  )}
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${((p.price_cents || 0) / 100).toFixed(0)}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Globex Admin"
                    value={formData.admin_name}
                    onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@globex.com"
                    value={formData.admin_email}
                    onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? "Provisioning..." : "Provision Workspace"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE ORGANIZATION MODAL ────────────────────────────────── */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-rose-900/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/50 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Tenant Workspace</h3>
                <p className="text-[11px] text-slate-400 font-mono">{deleteTarget.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete this organization? All vector documents, users, and department mappings in this workspace will be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60"
                onClick={handleDeleteOrg}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
