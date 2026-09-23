"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { TenantDetails } from '@/components/superadmin/TenantDetails';
import { Button } from "@/components/ui/Button";
import { superadminApi } from '@/lib/api/superadmin';

export default function TenantGovernanceDetailPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTenant = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await superadminApi.getOrganization(tenantId);
      setTenant(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load tenant workspace.");
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [tenantId]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      await superadminApi.suspendOrganization(tenantId);
      fetchTenant();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await superadminApi.activateOrganization(tenantId);
      fetchTenant();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button href="/superadmin/tenants" variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Tenants Directory
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTenant} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {loading && !tenant && (
        <div className="p-12 text-center text-xs font-mono text-slate-500">
          Loading workspace inspection telemetry...
        </div>
      )}

      {tenant && (
        <TenantDetails
          tenant={tenant}
          onSuspend={handleSuspend}
          onActivate={handleActivate}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}
