'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Save, RotateCcw, Check, ArrowLeft, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import { superadminApi } from '@/lib/api/superadmin';

export default function RolePermissionMatrixPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('ORG_ADMIN');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Matrix state: roleSlug -> set of permission keys
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({
    SUPER_ADMIN: new Set(['*']),
    ORG_ADMIN: new Set([
      'organization.read', 'organization.update',
      'user.read', 'user.create', 'user.update', 'user.delete',
      'department.read', 'department.create', 'department.update', 'department.delete',
      'domain.read', 'domain.create', 'domain.update',
      'module.read', 'module.create', 'module.update',
      'document.read', 'document.upload', 'document.delete',
      'rag.query', 'rag.document_access', 'audit.read',
    ]),
    DOMAIN_ADMIN: new Set([
      'domain.read', 'domain.update',
      'module.read', 'module.update',
      'document.read', 'document.upload', 'document.delete',
      'rag.query', 'rag.document_access',
    ]),
    EMPLOYEE: new Set([
      'document.read', 'rag.query', 'rag.document_access',
    ]),
  });

  const resources = [
    'organization',
    'user',
    'department',
    'domain',
    'module',
    'document',
    'rag',
    'audit',
  ];

  const actions = ['read', 'create', 'update', 'delete', 'export'];

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        superadminApi.getRoles(),
        superadminApi.getCatalogPermissions(),
      ]);
      setRoles(rolesData || []);
      setPermissions(permsData || []);

      if (rolesData && rolesData.length > 0) {
        const newMatrix: Record<string, Set<string>> = { ...matrix };
        rolesData.forEach((r: any) => {
          const key = (r.slug || r.name).toUpperCase();
          if (r.permissions && r.permissions.length > 0) {
            newMatrix[key] = new Set(r.permissions);
          }
        });
        setMatrix(newMatrix);
        setSelectedRole((rolesData[0].slug || rolesData[0].name).toUpperCase());
      }
    } catch (err) {
      console.error('Failed to load matrix data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const togglePermission = (resource: string, action: string) => {
    const key = `${resource}.${action}`;
    setMatrix((prev) => {
      const currentSet = new Set(prev[selectedRole] || []);
      if (currentSet.has(key)) {
        currentSet.delete(key);
      } else {
        currentSet.add(key);
      }
      return { ...prev, [selectedRole]: currentSet };
    });
    setSaved(false);
  };

  const handleSelectAll = () => {
    const allKeys = new Set<string>();
    resources.forEach((r) => {
      actions.forEach((a) => allKeys.add(`${r}.${a}`));
    });
    setMatrix((prev) => ({ ...prev, [selectedRole]: allKeys }));
    setSaved(false);
  };

  const handleClearAll = () => {
    setMatrix((prev) => ({ ...prev, [selectedRole]: new Set() }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const activeRoleObj = roles.find(
        (r) => (r.slug || r.name).toUpperCase() === selectedRole.toUpperCase()
      );

      const permKeys = Array.from(matrix[selectedRole] || []);

      if (activeRoleObj) {
        await superadminApi.updateRole(activeRoleObj.id, {
          permissions: permKeys,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error('Failed to save permissions matrix:', err);
      setError(err?.response?.data?.message || err?.response?.data?.detail || 'Failed to save permissions to backend.');
    } finally {
      setSaving(false);
    }
  };

  const hasPerm = (resource: string, action: string) => {
    const roleSet = matrix[selectedRole];
    if (!roleSet) return false;
    if (roleSet.has('*')) return true;
    return roleSet.has(`${resource}.${action}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/roles"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Role Permission Matrix</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Granular resource-action matrix enforcing multi-tenant and domain RBAC boundaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            Clear All
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : saved ? 'Saved Successfully!' : 'Save Permissions'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selector Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Active Role Target</span>
            <span className="text-[11px] text-slate-400">Select role to view and edit effective capabilities</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['SUPER_ADMIN', 'ORG_ADMIN', 'DOMAIN_ADMIN', 'EMPLOYEE'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                selectedRole === role
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Matrix Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Resource Namespace
              </th>
              {actions.map((act) => (
                <th key={act} className="px-4 py-4 text-center font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  {act}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {resources.map((res) => (
              <tr key={res} className="hover:bg-slate-900/40 transition">
                <td className="px-6 py-3.5 font-mono font-bold text-white capitalize">
                  {res}
                </td>
                {actions.map((act) => {
                  const checked = hasPerm(res, act);
                  const isReadOnly = selectedRole === 'SUPER_ADMIN';
                  return (
                    <td key={act} className="px-4 py-3.5 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => !isReadOnly && togglePermission(res, act)}
                        disabled={isReadOnly}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center mx-auto transition ${
                          checked
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
