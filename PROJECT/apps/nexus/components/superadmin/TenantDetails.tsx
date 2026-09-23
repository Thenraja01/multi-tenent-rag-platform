"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  Layers,
  Shield,
  CreditCard,
  HardDrive,
  Activity,
  Power,
  Settings,
  Mail,
  Calendar,
  ExternalLink,
  Search,
  CheckCircle2,
  Ban,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/tabs";

export interface TenantUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface TenantDetailsProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    status: string;
    orgEmail?: string;
    adminName?: string;
    adminEmail?: string;
    plan: {
      id: string;
      name: string;
      maxUsers: number;
      maxDomains: number;
    };
    domains: Array<{ id: string; name: string; slug: string; icon: string; status: string }>;
    users?: TenantUserItem[];
    roles?: Array<{ id: string; name: string; slug: string; isSystemRole: boolean }>;
    settings?: Record<string, any>;
    branding?: Record<string, any>;
    createdAt: string;
  };
  onSuspend: () => Promise<void>;
  onActivate: () => Promise<void>;
  loading?: boolean;
  actionLoading?: boolean;
}

function getRoleBadgeVariant(role: any): "purple" | "indigo" | "blue" | "emerald" | "amber" | "outline" {
  const roleStr = typeof role === 'string' ? role : role?.name || role?.slug || '';
  const r = (roleStr || "").toUpperCase();
  if (r.includes("SUPER")) return "purple";
  if (r.includes("ORG_ADMIN") || r.includes("ADMIN")) return "indigo";
  if (r.includes("MANAGER") || r.includes("LEAD")) return "blue";
  if (r.includes("HR") || r.includes("RECRUIT")) return "emerald";
  if (r.includes("FINANCE") || r.includes("ACCOUNT")) return "amber";
  return "outline";
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-indigo-600 to-blue-600",
    "from-purple-600 to-indigo-600",
    "from-pink-600 to-purple-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const TenantDetails: React.FC<TenantDetailsProps> = ({
  tenant,
  onSuspend,
  onActivate,
  loading = false,
  actionLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");

  const usersList = tenant.users || [];
  const domainsList = tenant.domains || [];
  const rolesList = tenant.roles || [];

  const filteredUsers = usersList.filter(
    (u) => {
      const uRoleStr = typeof u.role === 'string' ? u.role : (u.role as any)?.name || (u.role as any)?.slug || '';
      return (
        (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
        uRoleStr.toLowerCase().includes(userSearch.toLowerCase())
      );
    }
  );

  const adminCount = usersList.filter(
    (u) => {
      const uRoleStr = typeof u.role === 'string' ? u.role : (u.role as any)?.name || (u.role as any)?.slug || '';
      return uRoleStr.toUpperCase().includes("ADMIN");
    }
  ).length;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Organization Users", count: usersList.length },
    { id: "domains", label: "Domains & Modules", count: domainsList.length },
    { id: "roles", label: "RBAC Roles", count: rolesList.length },
    { id: "plan", label: "Plan & Quotas" },
    { id: "config", label: "Tenant JSON Config" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Profile Card */}
      <Card className="p-6 border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20 shrink-0">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{tenant.name}</h1>
                <Badge variant={tenant.status === "active" || tenant.status === "approved" ? "emerald" : "amber"}>
                  {tenant.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mt-1">
                <span>{tenant.subdomain}.nexusrag.com</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Plan: {tenant.plan?.name || "Standard"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tenant.status === "active" || tenant.status === "approved" ? (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-900/60 text-amber-400 hover:bg-amber-950/40"
                disabled={loading || actionLoading}
                onClick={onSuspend}
              >
                {actionLoading ? "Processing..." : "Suspend Organization"}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500"
                disabled={loading || actionLoading}
                onClick={onActivate}
              >
                {actionLoading ? "Processing..." : "Reinstate Workspace"}
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pt-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </Card>

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 border-slate-800 bg-slate-900/60 space-y-2 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Total Members</span>
              <div className="text-2xl font-extrabold text-white">{usersList.length}</div>
              <div className="text-[11px] text-slate-400">{adminCount} Administrators</div>
            </Card>

            <Card className="p-5 border-slate-800 bg-slate-900/60 space-y-2 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Active Domains</span>
              <div className="text-2xl font-extrabold text-indigo-400">{domainsList.length}</div>
              <div className="text-[11px] text-slate-400">HR, Finance, IT, Legal</div>
            </Card>

            <Card className="p-5 border-slate-800 bg-slate-900/60 space-y-2 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Subscription Tier</span>
              <div className="text-xl font-bold text-white">{tenant.plan?.name || "Standard"}</div>
              <div className="text-[11px] text-emerald-400 font-mono">Quota: {tenant.plan?.maxUsers || 100} users</div>
            </Card>

            <Card className="p-5 border-slate-800 bg-slate-900/60 space-y-2 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Isolation Partition</span>
              <div className="text-xl font-bold text-white">PostgreSQL + pgvector</div>
              <div className="text-[11px] text-indigo-400 font-mono">HNSW Partitioned</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-slate-800 bg-slate-900/60 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Workspace Metadata
              </h3>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Organization Slug:</span>
                  <span className="text-white font-bold">{tenant.slug}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Dedicated Subdomain:</span>
                  <span className="text-indigo-400 font-bold">{tenant.subdomain}.nexusrag.com</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Provisioned Date:</span>
                  <span className="text-slate-300">
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "Default"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Lifecycle State:</span>
                  <Badge variant={tenant.status === "active" ? "emerald" : "amber"}>
                    {tenant.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-800 bg-slate-900/60 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Security & Isolation
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Tenant Host & Vector Boundary</span>
                    <span className="text-[11px] text-slate-400">Queries are scoped exclusively to tenant_id before retrieval.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Role-Based Access Control</span>
                    <span className="text-[11px] text-slate-400">Granular document ACLs enforced across organizational departments.</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 2: ORGANIZATION USERS ───────────────────────────────── */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search organization users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div className="text-xs font-mono text-slate-400">
              Showing {filteredUsers.length} of {usersList.length} members
            </div>
          </div>

          <Card className="border-slate-800 bg-slate-900/60 overflow-hidden rounded-xl">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-slate-500">
                No users found for this organization.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 font-mono">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => {
                      const initial = (u.name || u.email).charAt(0).toUpperCase();
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                                  u.name || u.email
                                )} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}
                              >
                                {initial}
                              </div>
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {u.name || u.email.split("@")[0]}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-indigo-400">{u.email}</td>
                          <td className="py-3 px-4">
                            {(() => {
                              const roleDisplay = typeof u.role === 'string' ? u.role : (u.role as any)?.name || (u.role as any)?.slug || 'Member';
                              return (
                                <Badge variant={getRoleBadgeVariant(u.role)}>
                                  <Shield className="w-2.5 h-2.5 mr-1 inline" />
                                  {roleDisplay}
                                </Badge>
                              );
                            })()}
                          </td>
                          <td className="py-3 px-4">
                            {u.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                SUSPENDED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Default"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 3: DOMAINS & MODULES ────────────────────────────────── */}
      {activeTab === "domains" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {domainsList.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs font-mono text-slate-500">
              No domains enabled for this organization yet.
            </div>
          ) : (
            domainsList.map((dom: any, idx: number) => {
              const domName = typeof dom === 'string' ? dom : dom?.name || dom?.slug || `Domain ${idx + 1}`;
              const domSlug = typeof dom === 'string' ? dom.toLowerCase() : dom?.slug || dom?.name?.toLowerCase() || '';
              const domStatus = typeof dom === 'object' && dom?.status ? dom.status : 'ACTIVE';
              const key = typeof dom === 'object' && dom?.id ? dom.id : `${domSlug}-${idx}`;

              return (
                <Card key={key} className="p-5 border-slate-800 bg-slate-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <Badge variant="emerald">{domStatus}</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-white">{domName}</h3>
                  <div className="text-xs font-mono text-indigo-400">{domSlug}</div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 4: ROLES ────────────────────────────────────────────── */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rolesList.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs font-mono text-slate-500">
              No custom roles configured. Inheriting standard organization roles (Org Admin, Manager, Employee).
            </div>
          ) : (
            rolesList.map((r: any, idx: number) => {
              const rName = typeof r === 'string' ? r : r?.name || r?.slug || `Role ${idx + 1}`;
              const rSlug = typeof r === 'string' ? r.toLowerCase() : r?.slug || r?.name?.toLowerCase() || '';
              const key = typeof r === 'object' && r?.id ? r.id : `${rSlug}-${idx}`;

              return (
                <Card key={key} className="p-5 border-slate-800 bg-slate-900/60 rounded-xl">
                  <Shield className="w-5 h-5 text-indigo-400 mb-2" />
                  <h3 className="text-sm font-bold text-white">{rName}</h3>
                  <div className="text-xs font-mono text-indigo-400">{rSlug}</div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 5: PLAN & QUOTAS ────────────────────────────────────── */}
      {activeTab === "plan" && (
        <Card className="p-6 border-slate-800 bg-slate-900/60 rounded-xl space-y-4">
          <h3 className="text-base font-bold text-white">Plan: {tenant.plan?.name || "Standard Plan"}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Users Allocated</span>
              <span className="text-white font-bold text-sm">{usersList.length} / {tenant.plan?.maxUsers || 100}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Domains Enabled</span>
              <span className="text-white font-bold text-sm">{domainsList.length} / {tenant.plan?.maxDomains || 5}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">Vector Storage</span>
              <span className="text-emerald-400 font-bold text-sm">4.2 GB Allocated</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">AI Tokens</span>
              <span className="text-indigo-400 font-bold text-sm">Unlimited</span>
            </div>
          </div>
        </Card>
      )}

      {/* ── TAB 6: CONFIG ───────────────────────────────────────────── */}
      {activeTab === "config" && (
        <Card className="p-6 border-slate-800 bg-slate-900/60 rounded-xl space-y-4 text-xs font-mono text-slate-300">
          <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">Tenant JSON Configuration</h3>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-[11px] text-indigo-300">
            {JSON.stringify(tenant.settings || {}, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};
