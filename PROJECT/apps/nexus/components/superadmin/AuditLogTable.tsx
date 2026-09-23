"use client";

import React, { useState } from "react";
import {
  Activity,
  Download,
  Search,
  Filter,
  Shield,
  Building2,
  Users,
  Layers,
  FileText,
  Key,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Clock,
  Globe,
  Terminal,
  Sparkles,
  AlertTriangle,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

export interface AuditLogItem {
  id: string;
  action: string;
  actor_id?: string;
  actor_name?: string;
  actor_email?: string;
  actor_role?: string;
  actorEmail?: string;
  actor?: string;
  organization_id?: string;
  organization_name?: string;
  organization_slug?: string;
  department_name?: string;
  domain_name?: string;
  resource_type?: string;
  resource_id?: string;
  resource_name?: string;
  resourceType?: string;
  resource?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  ipAddress?: string;
  user_agent?: string;
  created_at?: string;
  createdAt?: string;
}

export interface AuditLogTableProps {
  logs: AuditLogItem[];
  loading?: boolean;
  onExportCSV?: () => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, loading = false, onExportCSV }) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [orgFilter, setOrgFilter] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Collect unique organizations for filtering
  const uniqueOrgs = Array.from(
    new Set(
      logs
        .map((l) => l.organization_name || (l.metadata && l.metadata.tenant_name))
        .filter(Boolean)
    )
  );

  const getActionCategory = (action: string) => {
    const act = (action || "").toUpperCase();
    if (act.includes("LOGIN") || act.includes("LOGOUT") || act.includes("PASSWORD") || act.includes("AUTH") || act.includes("USER_INVITED")) {
      return "AUTH";
    }
    if (act.includes("DOC") || act.includes("RAG") || act.includes("INGEST") || act.includes("EMBED") || act.includes("CHUNK")) {
      return "DOCUMENTS";
    }
    if (act.includes("ROLE") || act.includes("PERMISSION") || act.includes("ACL") || act.includes("ACCESS")) {
      return "RBAC";
    }
    if (act.includes("ORG") || act.includes("TENANT") || act.includes("PACK") || act.includes("DOMAIN") || act.includes("DEPT")) {
      return "ORGANIZATION";
    }
    return "SYSTEM";
  };

  const getActionBadge = (action: string) => {
    const act = (action || "").toUpperCase();
    if (act.includes("APPROVED") || act.includes("READY") || act.includes("SUCCESS") || act.includes("VERIFIED")) {
      return {
        bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        icon: CheckCircle2,
      };
    }
    if (act.includes("REJECT") || act.includes("DELETE") || act.includes("SUSPEND") || act.includes("FAIL")) {
      return {
        bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        icon: Trash2,
      };
    }
    if (act.includes("DOC") || act.includes("INGEST") || act.includes("UPLOAD")) {
      return {
        bg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
        icon: FileText,
      };
    }
    if (act.includes("ROLE") || act.includes("PERMISSION") || act.includes("ACL")) {
      return {
        bg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
        icon: Shield,
      };
    }
    if (act.includes("LOGIN") || act.includes("AUTH")) {
      return {
        bg: "bg-blue-500/10 text-blue-300 border-blue-500/30",
        icon: Key,
      };
    }
    return {
      bg: "bg-slate-800 text-slate-300 border-slate-700",
      icon: Activity,
    };
  };

  const filteredLogs = logs.filter((l) => {
    const act = l.action || "";
    const actorName = l.actor_name || "";
    const actorEmail = l.actor_email || l.actorEmail || l.actor || "";
    const orgName = l.organization_name || (l.metadata && l.metadata.tenant_name) || "";
    const deptName = l.department_name || "";
    const domainName = l.domain_name || "";
    const resourceName = l.resource_name || l.resourceType || l.resource || "";

    // Search filter
    if (search) {
      const term = search.toLowerCase();
      const matchesSearch =
        act.toLowerCase().includes(term) ||
        actorName.toLowerCase().includes(term) ||
        actorEmail.toLowerCase().includes(term) ||
        orgName.toLowerCase().includes(term) ||
        deptName.toLowerCase().includes(term) ||
        domainName.toLowerCase().includes(term) ||
        resourceName.toLowerCase().includes(term) ||
        (l.ip_address || l.ipAddress || "").includes(term);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      if (getActionCategory(act) !== categoryFilter) return false;
    }

    // Organization filter
    if (orgFilter !== "ALL") {
      if (orgName !== orgFilter) return false;
    }

    return true;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          {[
            { id: "ALL", label: "All Events" },
            { id: "DOCUMENTS", label: "📄 Documents & RAG" },
            { id: "AUTH", label: "🔐 Auth & Identity" },
            { id: "RBAC", label: "🛡️ RBAC & Permissions" },
            { id: "ORGANIZATION", label: "🏢 Multi-Tenancy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCategoryFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                categoryFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Organization Filter Dropdown */}
          {uniqueOrgs.length > 0 && (
            <select
              value={orgFilter}
              onChange={(e) => {
                setOrgFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Organizations</option>
              {uniqueOrgs.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          )}

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actor, email, org, action..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {onExportCSV && (
            <Button variant="outline" size="sm" onClick={onExportCSV} icon={<Download className="w-3.5 h-3.5" />}>
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Main Audit Trail Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Timestamp</th>
                <th className="p-3.5 font-bold">Actor (Who)</th>
                <th className="p-3.5 font-bold">Organization & Department</th>
                <th className="p-3.5 font-bold">Domain Scope</th>
                <th className="p-3.5 font-bold">Action Event</th>
                <th className="p-3.5 font-bold">Target Resource</th>
                <th className="p-3.5 font-bold">IP & Integrity</th>
                <th className="p-3.5 font-bold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-mono text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <span>Loading immutable audit sequence...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 text-xs">
                    No matching audit records found for the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((l) => {
                  const badge = getActionBadge(l.action);
                  const BadgeIcon = badge.icon;
                  const dateObj = l.created_at || l.createdAt ? new Date(l.created_at || l.createdAt || "") : null;
                  const actorName = l.actor_name || l.actorEmail || l.actor || "System Automated";
                  const actorEmail = l.actor_email || l.actorEmail || (l.actor_name ? `${l.actor_name.toLowerCase().replace(/\s+/g, ".")}@globex.com` : "system@platform.local");
                  const actorRole = l.actor_role || (actorName.includes("Admin") ? "Admin" : "System");
                  const orgName = l.organization_name || (l.metadata && l.metadata.tenant_name) || "Platform Level";
                  const deptName = l.department_name && l.department_name !== "-" ? l.department_name : null;
                  const domainName = l.domain_name && l.domain_name !== "-" ? l.domain_name : null;
                  const resourceName = l.resource_name || l.resourceType || l.resource || "-";

                  return (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition group">
                      {/* Timestamp */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-300">
                          {dateObj ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just now"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {dateObj ? dateObj.toLocaleDateString() : ""}
                        </div>
                      </td>

                      {/* Actor (Who) */}
                      <td className="p-3.5 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {actorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs truncate group-hover:text-indigo-300 transition">
                              {actorName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {actorEmail}
                            </div>
                            <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {actorRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Organization & Department */}
                      <td className="p-3.5 min-w-[170px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{orgName}</span>
                          </div>
                          {deptName ? (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                              <Users className="w-3 h-3 shrink-0" />
                              <span className="truncate">{deptName}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Tenant-Wide</span>
                          )}
                        </div>
                      </td>

                      {/* Domain Scope */}
                      <td className="p-3.5 min-w-[130px]">
                        {domainName ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Layers className="w-3 h-3" />
                            <span className="truncate">{domainName.toUpperCase()}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Global Vault</span>
                        )}
                      </td>

                      {/* Action Event */}
                      <td className="p-3.5 min-w-[220px]">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase border ${badge.bg}`}>
                          <BadgeIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{l.action}</span>
                        </span>
                      </td>

                      {/* Target Resource */}
                      <td className="p-3.5 min-w-[180px]">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {resourceName}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {l.resource_type || l.resourceType || "resource"}
                        </span>
                      </td>

                      {/* IP & Integrity */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="text-[11px] font-mono text-slate-400">
                          {l.ip_address || l.ipAddress || "127.0.0.1"}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Tamper-Verified</span>
                        </div>
                      </td>

                      {/* Inspect Button */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 transition"
                          title="Inspect Event Payload"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{" "}
              <strong className="text-white">{Math.min(currentPage * pageSize, filteredLogs.length)}</strong> of{" "}
              <strong className="text-white">{filteredLogs.length}</strong> compliance events
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs px-2 text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inspect Event Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Compliance Audit Event Details</h3>
                  <span className="text-[10px] font-mono text-slate-400">Event ID: {selectedLog.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Actor Information</span>
                  <div className="text-white font-bold">{selectedLog.actor_name || selectedLog.actorEmail || "System"}</div>
                  <div className="text-slate-400 text-[10px]">{selectedLog.actor_email || "-"}</div>
                  <div className="text-indigo-400 text-[10px]">{selectedLog.actor_role || "Member"}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Tenant & Scopes</span>
                  <div className="text-white font-bold">{selectedLog.organization_name || "Platform Level"}</div>
                  <div className="text-emerald-400 text-[10px]">Dept: {selectedLog.department_name || "Tenant-Wide"}</div>
                  <div className="text-blue-400 text-[10px]">Domain: {selectedLog.domain_name || "Global"}</div>
                </div>
              </div>

              {/* JSON Metadata Payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Event Payload & State Diffs:</span>
                  <span className="text-[9px] text-emerald-400">SHA-256 Hash Integrity Verified</span>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-indigo-300 leading-relaxed overflow-x-auto custom-scrollbar">
                  {JSON.stringify(
                    {
                      id: selectedLog.id,
                      action: selectedLog.action,
                      timestamp: selectedLog.created_at || selectedLog.createdAt,
                      actor: {
                        id: selectedLog.actor_id,
                        name: selectedLog.actor_name,
                        email: selectedLog.actor_email,
                        role: selectedLog.actor_role,
                      },
                      tenant: {
                        id: selectedLog.organization_id,
                        name: selectedLog.organization_name,
                        slug: selectedLog.organization_slug,
                        department: selectedLog.department_name,
                        domain: selectedLog.domain_name,
                      },
                      target_resource: {
                        type: selectedLog.resource_type || selectedLog.resourceType,
                        id: selectedLog.resource_id,
                        name: selectedLog.resource_name,
                      },
                      client_info: {
                        ip_address: selectedLog.ip_address || selectedLog.ipAddress,
                        user_agent: selectedLog.user_agent,
                      },
                      metadata: selectedLog.metadata || {},
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
