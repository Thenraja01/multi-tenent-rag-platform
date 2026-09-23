"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, User, Mail, Globe, CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { superadminApi } from '@/lib/api/superadmin';

export default function RequestDetailPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = use(params);
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const org = await superadminApi.getOrganization(requestId);
      if (org) {
        setReq({
          id: org.id,
          organizationName: org.name,
          adminName: org.admin_name || 'Administrator',
          businessEmail: org.admin_email || `${org.slug}@localfix.app`,
          selectedPlan: org.plan || org.plan_name || 'Standard Enterprise',
          requestedDomains: org.domains || ['hr', 'it'],
          country: 'Global',
          industry: 'Enterprise',
          status: org.status === 'active' || org.status === 'ACTIVE' ? 'APPROVED' : org.status === 'pending' || org.status === 'PENDING' ? 'PENDING_APPROVAL' : 'REJECTED',
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load organization onboarding application.");
      setReq(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  if (loading) {
    return <div className="py-12 text-center text-slate-400 font-mono text-xs">Loading request details...</div>;
  }

  if (error || !req) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Button href="/superadmin/organization-requests" variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Requests Queue
        </Button>
        <div className="p-6 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error || "Organization request not found."}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequest} className="text-xs h-7">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button href="/superadmin/organization-requests" variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
        Back to Requests Queue
      </Button>

      <Card className="p-6 sm:p-8 border-slate-800 bg-slate-900/80 shadow-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{req.organizationName}</h1>
            <span className="text-xs font-mono text-slate-400">Request ID: {req.id}</span>
          </div>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 uppercase font-mono block mb-1">Primary Administrator</span>
            <div className="text-sm font-bold text-white">{req.adminName}</div>
            <div className="text-blue-400 font-mono mt-0.5">{req.businessEmail}</div>
          </div>

          <div>
            <span className="text-slate-500 uppercase font-mono block mb-1">Selected Plan</span>
            <div className="text-sm font-bold text-white">{req.selectedPlan || "Starter Tier"}</div>
            <div className="text-slate-400 font-mono mt-0.5">Billing Quota Tier</div>
          </div>

          <div>
            <span className="text-slate-500 uppercase font-mono block mb-1">Company Profile</span>
            <div className="text-slate-200">
              {req.industry || "General Enterprise"} • {req.companySize || "1-50"} Employees
            </div>
            <div className="text-slate-400 mt-0.5">Country: {req.country || "Global"}</div>
          </div>

          <div>
            <span className="text-slate-500 uppercase font-mono block mb-1">Requested Business Domains</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {req.requestedDomains?.length > 0 ? (
                req.requestedDomains.map((d: any, idx: number) => {
                  const name = typeof d === 'string' ? d : (d?.name || d?.slug || d?.id || 'Domain');
                  const key = typeof d === 'string' ? d : (d?.id || d?.slug || `req-dom-${idx}`);
                  return (
                    <span key={key} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-blue-700 dark:text-blue-300 uppercase">
                      {name}
                    </span>
                  );
                })
              ) : (
                <span className="text-slate-500 font-mono">No initial domains specified</span>
              )}
            </div>
          </div>
        </div>

        {req.rejectionReason && (
          <div className="mt-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs">
            <span className="font-bold text-red-400 block mb-1">Rejection Justification:</span>
            <span className="text-slate-300">{req.rejectionReason}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
