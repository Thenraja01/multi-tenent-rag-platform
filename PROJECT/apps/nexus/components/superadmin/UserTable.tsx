"use client";

import React from "react";
import { Users, Shield, Edit3, Trash2, Power, Building2, Calendar, CheckCircle2, Ban } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant: string;
  tenant_id?: string;
  tenantSubdomain?: string;
  isActive: boolean;
  domains?: string[];
  roles?: string[];
  createdAt?: string;
  created_at?: string;
}

export interface UserTableProps {
  users: UserItem[];
  loading?: boolean;
  onEdit?: (user: UserItem) => void;
  onDelete?: (id: string, name: string) => void;
  onSuspend?: (id: string) => void;
  onActivate?: (id: string) => void;
}

function getRoleBadgeVariant(role: any): "purple" | "indigo" | "blue" | "emerald" | "amber" | "outline" | "red" {
  const roleStr = typeof role === 'string' ? role : role?.name || role?.slug || '';
  const r = (roleStr || "").toUpperCase();
  if (r.includes("SUPER") || r === "SUPER_ADMIN") return "purple";
  if (r.includes("ORG_ADMIN") || r.includes("ADMIN")) return "indigo";
  if (r.includes("MANAGER") || r.includes("LEAD")) return "blue";
  if (r.includes("HR") || r.includes("RECRUIT")) return "emerald";
  if (r.includes("FINANCE") || r.includes("ACCOUNT")) return "amber";
  return "outline";
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-blue-600 to-indigo-600",
    "from-indigo-600 to-purple-600",
    "from-purple-600 to-pink-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
    "from-rose-600 to-red-600",
    "from-cyan-600 to-blue-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  onEdit,
  onDelete,
  onSuspend,
  onActivate,
}) => {
  if (loading && users.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-mono text-slate-400">Loading global platform users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">No platform users found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No user accounts match your search filters. Try adjusting your query or provision a new user.
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
              <th className="py-3.5 px-4 font-semibold">User Profile</th>
              <th className="py-3.5 px-4 font-semibold">Tenant Partition</th>
              <th className="py-3.5 px-4 font-semibold">Role</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Joined Date</th>
              <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => {
              const initial = (u.name || u.email || "U").charAt(0).toUpperCase();
              const formattedDate = u.createdAt || u.created_at
                ? new Date(u.createdAt || u.created_at!).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Platform Default";

              return (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                  {/* User Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                          u.name || u.email
                        )} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs sm:text-sm truncate">
                          {u.name || u.email.split("@")[0]}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tenant Partition */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-medium text-slate-200 block truncate">
                          {u.tenant || "Platform Global"}
                        </span>
                        {u.tenantSubdomain && (
                          <span className="text-[10px] font-mono text-indigo-400 block">
                            {u.tenantSubdomain}.nexusrag.com
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    {(() => {
                      const roleDisplay = typeof u.role === 'string' ? u.role : (u.role as any)?.name || (u.role as any)?.slug || "EMPLOYEE";
                      return (
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          <Shield className="w-2.5 h-2.5 mr-1 inline" />
                          {roleDisplay}
                        </Badge>
                      );
                    })()}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        SUSPENDED
                      </span>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit?.(u)}
                        title="Edit User Details & Role"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition border border-transparent hover:border-indigo-800/50"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Suspend / Activate Toggle */}
                      {u.isActive ? (
                        <button
                          onClick={() => onSuspend?.(u.id)}
                          title="Suspend User Access"
                          className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-950/40 transition border border-transparent hover:border-amber-800/50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate?.(u.id)}
                          title="Activate User Access"
                          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40 transition border border-transparent hover:border-emerald-800/50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete?.(u.id, u.name || u.email)}
                        title="Delete User"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition border border-transparent hover:border-rose-800/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
