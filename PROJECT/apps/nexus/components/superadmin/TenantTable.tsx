"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Shield,
  Eye,
  Trash2,
  ExternalLink,
  Users,
  Layers,
  HardDrive,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface TenantTableItem {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  plan: string;
  plan_name?: string;
  adminName?: string;
  adminEmail?: string;
  usersCount?: number;
  domainsCount?: number;
  storageUsage?: string;
  aiUsage?: string;
  createdAt?: string;
  created_at?: string;
}

export interface TenantTableProps {
  tenants: TenantTableItem[];
  loading?: boolean;
  onSuspend?: (id: string) => void;
  onActivate?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-indigo-600 to-blue-600",
    "from-purple-600 to-indigo-600",
    "from-blue-600 to-cyan-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  loading = false,
  onSuspend,
  onActivate,
  onDelete,
}) => {
  if (loading && tenants.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-mono text-slate-400">Loading provisioned organization workspaces...</p>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">No organizations found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No active or pending organization workspaces match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Tenant Organization</th>
              <th className="py-3.5 px-4 font-semibold">Subdomain</th>
              <th className="py-3.5 px-4 font-semibold">Plan Tier</th>
              <th className="py-3.5 px-4 font-semibold">Domains</th>
              <th className="py-3.5 px-4 font-semibold">Members</th>
              <th className="py-3.5 px-4 font-semibold">Storage</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tenants.map((t) => {
              const initial = t.name.charAt(0).toUpperCase();
              const isApproved = t.status === "active" || t.status === "approved";

              return (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors group">
                  {/* Tenant Name */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/superadmin/tenants/${t.id}`}
                      className="flex items-center gap-3 group-hover:text-indigo-300 transition"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                          t.name
                        )} flex items-center justify-center text-white font-extrabold text-xs shadow-md shrink-0`}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs sm:text-sm group-hover:text-indigo-400 transition truncate">
                          {t.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 truncate">
                          {t.slug}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Subdomain */}
                  <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 whitespace-nowrap">
                    {t.subdomain}.nexusrag.com
                  </td>

                  {/* Plan */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 text-[10px] font-bold font-mono">
                      {t.plan || t.plan_name || "Standard"}
                    </span>
                  </td>

                  {/* Domains */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                    {t.domainsCount || 3} Domains
                  </td>

                  {/* Users */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                    <span className="font-bold text-white">{t.usersCount || 0}</span> Users
                  </td>

                  {/* Storage */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                    {t.storageUsage || "4.2 GB"}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {t.status.toUpperCase()}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        href={`/superadmin/tenants/${t.id}`}
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="text-slate-300 hover:text-white"
                      >
                        Inspect
                      </Button>

                      {isApproved ? (
                        <button
                          onClick={() => onSuspend?.(t.id)}
                          title="Suspend Organization"
                          className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-950/40 transition border border-transparent hover:border-amber-800/50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate?.(t.id)}
                          title="Activate Organization"
                          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40 transition border border-transparent hover:border-emerald-800/50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          onClick={() => onDelete(t.id, t.name)}
                          title="Delete Organization"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition border border-transparent hover:border-rose-800/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
