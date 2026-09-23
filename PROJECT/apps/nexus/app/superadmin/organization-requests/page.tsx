"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/tabs";
import { ApprovalDialog } from "@/components/superadmin/ApprovalDialog";
import { RejectionDialog } from "@/components/superadmin/RejectionDialog";
import { superadminApi } from '@/lib/api/superadmin';
import { useSuperAdminEvents } from "@/hooks/useSuperAdminEvents";

export default function OrganizationRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  // Modals
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgs = await superadminApi.getOrganizations();
      const mapped = (orgs || []).map((o: any) => ({
        id: o.id,
        organizationName: o.name,
        adminName: o.admin_name || 'Administrator',
        businessEmail: o.admin_email || `${o.slug}@localfix.app`,
        selectedPlan: o.plan || o.plan_name || 'Standard Enterprise',
        requestedDomains: o.domains || ['hr', 'it'],
        emailVerified: true,
        country: 'Global',
        industry: 'Enterprise',
        createdAt: o.created_at,
        status: o.status === 'active' || o.status === 'ACTIVE' ? 'APPROVED' : o.status === 'pending' || o.status === 'PENDING' ? 'PENDING_APPROVAL' : 'REJECTED',
      }));
      setRequests(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load organization requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Real-time automatic updates
  useSuperAdminEvents((event) => {
    if (
      event.type === "ORGANIZATION_REGISTERED" ||
      event.type === "ORGANIZATION_APPROVED" ||
      event.type === "ORGANIZATION_REJECTED"
    ) {
      fetchRequests();
    }
  });

  const handleApproveConfirm = async (subdomain: string, domains: string[]) => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      await superadminApi.activateOrganization(selectedReq.id);
      setApproveOpen(false);
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Approval failed. Please check server logs.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      await superadminApi.suspendOrganization(selectedReq.id, reason);
      setRejectOpen(false);
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Rejection failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "pending" && r.status !== "PENDING_APPROVAL") return false;
    if (activeTab === "approved" && r.status !== "APPROVED") return false;
    if (activeTab === "rejected" && r.status !== "REJECTED") return false;

    if (search) {
      const term = search.toLowerCase();
      return (
        (r.organizationName || "").toLowerCase().includes(term) ||
        (r.adminName || "").toLowerCase().includes(term) ||
        (r.businessEmail || "").toLowerCase().includes(term)
      );
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING_APPROVAL").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  const tabs = [
    { id: "all", label: "All Requests", count: requests.length },
    { id: "pending", label: "Pending Approval", count: pendingCount },
    { id: "approved", label: "Approved", count: approvedCount },
    { id: "rejected", label: "Rejected", count: rejectedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              Organization Provisioning Gateway
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Organization Onboarding Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review company verification status, requested business domains, and provision isolated tenant workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            {loading ? "Refreshing..." : "Refresh Queue"}
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company, admin, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Plan & Domains</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && requests.length === 0 ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-6 px-4">
                      <div className="h-4 bg-slate-800/60 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-800/40 rounded w-1/2" />
                    </td>
                  </tr>
                ))
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No organization onboarding applications match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div>{req.organizationName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {req.country || "Global"} • {req.industry || "Enterprise"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{req.adminName}</div>
                      <div className="text-[11px] text-blue-400 font-mono">{req.businessEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-300">{req.selectedPlan}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {req.requestedDomains?.slice(0, 3).map((d: any, idx: number) => {
                          const name = typeof d === 'string' ? d : (d?.name || d?.slug || d?.id || 'Domain');
                          const key = typeof d === 'string' ? d : (d?.id || d?.slug || `req-dom-${idx}`);
                          return (
                            <span key={key} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 uppercase">
                              {name}
                            </span>
                          );
                        })}
                        {req.requestedDomains?.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{req.requestedDomains.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {req.emailVerified ? (
                        <Badge variant="emerald" className="gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </Badge>
                      ) : (
                        <Badge variant="amber" className="gap-1 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>Pending Token</span>
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          req.status === "APPROVED"
                            ? "emerald"
                            : req.status === "REJECTED"
                            ? "red"
                            : "amber"
                        }
                      >
                        {req.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          href={`/superadmin/organization-requests/${req.id}`}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>

                        {req.status === "PENDING_APPROVAL" && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                              onClick={() => {
                                setSelectedReq(req);
                                setApproveOpen(true);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                              onClick={() => {
                                setSelectedReq(req);
                                setRejectOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approval Modal */}
      {selectedReq && (
        <ApprovalDialog
          isOpen={approveOpen}
          onClose={() => setApproveOpen(false)}
          onConfirmApprove={handleApproveConfirm}
          organizationName={selectedReq.organizationName}
          initialSubdomain={selectedReq.organizationName ? selectedReq.organizationName.toLowerCase().replace(/[^a-z0-9]/g, "") : "tenant"}
          loading={actionLoading}
        />
      )}

      {/* Rejection Modal */}
      {selectedReq && (
        <RejectionDialog
          isOpen={rejectOpen}
          onClose={() => setRejectOpen(false)}
          onConfirmReject={handleRejectConfirm}
          organizationName={selectedReq.organizationName}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
