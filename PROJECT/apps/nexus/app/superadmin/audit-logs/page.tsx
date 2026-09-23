"use client";

import React, { useState, useEffect } from "react";
import { AuditLogTable } from '@/components/superadmin/AuditLogTable';
import { Button } from "@/components/ui/Button";
import { RefreshCw, Download, ShieldCheck, AlertCircle } from "lucide-react";
import { superadminApi } from '@/lib/api/superadmin';

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superadminApi.getAuditLogs({ limit: 100 });
      setLogs(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Timestamp,ActorName,ActorEmail,ActorRole,Organization,Department,Domain,Action,ResourceType,ResourceName,IPAddress"]
        .concat(
          logs.map(
            (l) =>
              `"${l.created_at || l.createdAt || ""}","${(l.actor_name || l.actor || "").replace(/"/g, '""')}","${(l.actor_email || l.actorEmail || "").replace(/"/g, '""')}","${(l.actor_role || "").replace(/"/g, '""')}","${(l.organization_name || "").replace(/"/g, '""')}","${(l.department_name || "").replace(/"/g, '""')}","${(l.domain_name || "").replace(/"/g, '""')}","${(l.action || "").replace(/"/g, '""')}","${(l.resource_type || l.resourceType || "").replace(/"/g, '""')}","${(l.resource_name || l.resource || "").replace(/"/g, '""')}","${l.ip_address || l.ipAddress || ""}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexusrag_audit_trail_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Cryptographic Compliance Trail
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Immutable Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tamper-proof event logs recording every administrative state mutation, login, tenant provisioning, and role assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            {loading ? "Refreshing..." : "Refresh Trail"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
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
          <Button variant="outline" size="sm" onClick={fetchLogs} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      <AuditLogTable logs={logs} loading={loading} />
    </div>
  );
}
