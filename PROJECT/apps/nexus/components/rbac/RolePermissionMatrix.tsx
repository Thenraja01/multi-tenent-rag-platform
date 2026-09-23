"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Role } from "@/types/role";
import { Permission } from "@/types/permission";

export interface RolePermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  onToggle?: (roleId: string, permissionCode: string) => void;
}

export const RolePermissionMatrix: React.FC<RolePermissionMatrixProps> = ({
  roles,
  permissions,
  onToggle,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
          <tr>
            <th className="p-4">Permission / Resource</th>
            {roles.map((role) => (
              <th key={role.id} className="p-4 text-center">
                <span className="text-white block font-bold">{role.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{role.slug}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {permissions.map((perm) => {
            const permCode = perm.permissionCode || perm.key || `${perm.resource}.${perm.action}`;
            return (
              <tr key={perm.id} className="hover:bg-slate-800/30">
                <td className="p-4">
                  <div className="font-semibold text-white">{perm.description || permCode}</div>
                  <div className="text-[10px] font-mono text-blue-400">{permCode}</div>
                </td>
                {roles.map((role) => {
                  const isGranted = role.permissions?.includes(permCode) || role.slug === "tenant-admin";
                  return (
                    <td key={role.id} className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggle?.(role.id, permCode)}
                        className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors ${
                          isGranted
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-950 text-slate-600 border border-slate-800"
                        }`}
                      >
                        {isGranted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
