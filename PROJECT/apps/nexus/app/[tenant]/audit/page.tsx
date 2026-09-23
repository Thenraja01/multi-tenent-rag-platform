'use client';

import React from 'react';
import { useAudit } from '@/hooks/use-audit';
import { useTenantStore } from '@/stores/tenant-store';
import { FileCheck2, ShieldCheck } from 'lucide-react';

export default function TenantAuditPage() {
  const { tenant } = useTenantStore();
  const { events, isLoading } = useAudit({ tenant_id: tenant?.id });

  const displayEvents = events;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Tenant Compliance & Audit Trail</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed security log tracking all document uploads, role grants, and AI queries in this workspace
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                <th className="px-5 py-3.5 font-semibold">Employee</th>
                <th className="px-5 py-3.5 font-semibold">Action</th>
                <th className="px-5 py-3.5 font-semibold">Resource Details</th>
                <th className="px-5 py-3.5 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : displayEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No compliance audit events recorded for this workspace.
                  </td>
                </tr>
              ) : (
                displayEvents.map((ev: any) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(ev.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">{ev.user_email}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {ev.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-300 text-[11px]">
                      {ev.resource_type}: {ev.resource_id}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                      {ev.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
