'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Lock,
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { superadminApi } from '@/lib/api/superadmin';

export default function RolesCatalogPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editRole, setEditRole] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('platform');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState('');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editPermSearch, setEditPermSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        superadminApi.getRoles(),
        superadminApi.getCatalogPermissions(),
      ]);
      setRoles(rolesData || []);
      setAvailablePermissions(permsData || []);
    } catch (err) {
      console.error('Failed to fetch platform roles/permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllPerms = (select: boolean) => {
    setSelectedPermissions(
      select ? availablePermissions.map((p) => p.permission_key || p.key || p.slug) : []
    );
  };

  const handleToggleEditPermission = (key: string) => {
    setEditPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllEditPerms = (select: boolean) => {
    setEditPermissions(
      select ? availablePermissions.map((p) => p.permission_key || p.key || p.slug) : []
    );
  };

  const handleOpenEdit = (role: any) => {
    setEditRole(role);
    setEditName(role.name || '');
    setEditDescription(role.description || '');
    setEditPermissions(role.permission_keys || role.permissions || []);
    setEditPermSearch('');
    setError(null);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await superadminApi.createRole({
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
        description: description.trim() || undefined,
        scope,
        permission_keys: selectedPermissions,
      });
      setIsCreateOpen(false);
      setName('');
      setSlug('');
      setDescription('');
      setSelectedPermissions([]);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to create role:', err);
      setError(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create role.');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRole) return;
    setEditing(true);
    setError(null);
    try {
      await superadminApi.updateRole(editRole.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        permission_keys: editPermissions,
      });
      setEditRole(null);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to update role:', err);
      setError(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to update role.');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      await superadminApi.deleteRole(roleToDelete.id);
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
      setRoleToDelete(null);
    } catch (err) {
      console.error('Failed to delete role:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Group permissions by resource for create
  const groupedPermissions: Record<string, any[]> = {};
  availablePermissions
    .filter((p) => {
      const key = (p.permission_key || p.key || p.slug || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return key.includes(permSearch.toLowerCase()) || desc.includes(permSearch.toLowerCase());
    })
    .forEach((p) => {
      const res = p.resource || (p.permission_key || p.key || '').split(':')[0] || 'general';
      if (!groupedPermissions[res]) {
        groupedPermissions[res] = [];
      }
      groupedPermissions[res].push(p);
    });

  // Group permissions by resource for edit
  const groupedEditPermissions: Record<string, any[]> = {};
  availablePermissions
    .filter((p) => {
      const key = (p.permission_key || p.key || p.slug || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return key.includes(editPermSearch.toLowerCase()) || desc.includes(editPermSearch.toLowerCase());
    })
    .forEach((p) => {
      const res = p.resource || (p.permission_key || p.key || '').split(':')[0] || 'general';
      if (!groupedEditPermissions[res]) {
        groupedEditPermissions[res] = [];
      }
      groupedEditPermissions[res].push(p);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Roles & Access Control</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Define hierarchical platform and tenant roles with granular capability and permission bindings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setError(null);
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Active Roles" value={roles.length} change="Live Backend DB" />
        <KpiCard title="System Roles" value={roles.filter((r) => r.is_system).length} change="Platform Predefined" />
        <KpiCard title="Custom Roles" value={roles.filter((r) => !r.is_system).length} change="Custom Defined" />
        <KpiCard title="System Permissions" value={availablePermissions.length} change="Capability Catalog" />
      </div>

      {/* Role Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span>Loading RBAC roles and permissions from backend API...</span>
        </div>
      ) : roles.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-3xl bg-slate-950/60 space-y-2">
          <p className="text-sm font-bold text-slate-300">No roles configured.</p>
          <p className="text-xs text-slate-500">Create a role or sync default roles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{role.name}</h3>
                      <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase">{role.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {role.is_system ? 'System Root' : 'Tenant Role'}
                    </span>
                    {!role.is_system && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(role)}
                          className="p-1 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition"
                          title="Edit Role & Permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRoleToDelete(role)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                          title="Delete Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[32px]">
                  {role.description || 'Configured access role with verified resource-action permissions.'}
                </p>
              </div>

              {/* Assigned Permissions Preview */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Assigned Capabilities</span>
                  <span className="text-indigo-400 font-semibold">
                    {(role.permission_keys || role.permissions || []).length} keys
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {(role.permission_keys || role.permissions || []).map((key: string) => (
                    <span
                      key={key}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Role Modal with Integrated Permissions Matrix */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Create RBAC Role & Assign Permissions</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                    }}
                    placeholder="e.g. Compliance Officer"
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Slug / Key *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="compliance_officer"
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="platform">Platform Level (Global)</option>
                  <option value="tenant">Organization Level</option>
                  <option value="domain">Domain Level</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Responsibilities and access limitations..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Permissions Selection Matrix */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Assign Capabilities ({selectedPermissions.length} selected)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectAllPerms(true)}
                      className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllPerms(false)}
                      className="text-slate-400 hover:text-slate-300 transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Search Bar for Permissions */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Filter permissions by key or description..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Grouped Permissions Checklist */}
                <div className="space-y-3 max-h-60 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {Object.keys(groupedPermissions).length === 0 ? (
                    <div className="p-4 text-center text-slate-500 font-mono text-xs">
                      No permissions match your search.
                    </div>
                  ) : (
                    Object.entries(groupedPermissions).map(([resource, perms]) => (
                      <div key={resource} className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 px-1 block">
                          {resource}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {perms.map((p) => {
                            const pKey = p.permission_key || p.key || p.slug;
                            const isChecked = selectedPermissions.includes(pKey);
                            return (
                              <label
                                key={pKey}
                                className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer transition select-none border ${
                                  isChecked
                                    ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(pKey)}
                                  className="w-3.5 h-3.5 mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                />
                                <div className="truncate flex-1">
                                  <span className="text-[11px] font-mono font-bold block leading-tight truncate text-slate-200">
                                    {pKey}
                                  </span>
                                  {p.description && (
                                    <span className="text-[10px] text-slate-500 block truncate leading-tight">
                                      {p.description}
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 transition shadow-lg shadow-indigo-600/25"
                >
                  {creating ? 'Creating Role...' : 'Create Role & Save Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Role: {editRole.name}</h3>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase">{editRole.slug}</span>
                </div>
              </div>
              <button
                onClick={() => setEditRole(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditRole} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Responsibilities and access limitations..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Edit Permissions Selection Matrix */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Assigned Capabilities ({editPermissions.length} selected)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectAllEditPerms(true)}
                      className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllEditPerms(false)}
                      className="text-slate-400 hover:text-slate-300 transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Search Bar for Edit Permissions */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={editPermSearch}
                    onChange={(e) => setEditPermSearch(e.target.value)}
                    placeholder="Filter permissions by key or description..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Grouped Permissions Checklist */}
                <div className="space-y-3 max-h-60 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {Object.keys(groupedEditPermissions).length === 0 ? (
                    <div className="p-4 text-center text-slate-500 font-mono text-xs">
                      No permissions match your search.
                    </div>
                  ) : (
                    Object.entries(groupedEditPermissions).map(([resource, perms]) => (
                      <div key={resource} className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 px-1 block">
                          {resource}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {perms.map((p) => {
                            const pKey = p.permission_key || p.key || p.slug;
                            const isChecked = editPermissions.includes(pKey);
                            return (
                              <label
                                key={pKey}
                                className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer transition select-none border ${
                                  isChecked
                                    ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleEditPermission(pKey)}
                                  className="w-3.5 h-3.5 mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                />
                                <div className="truncate flex-1">
                                  <span className="text-[11px] font-mono font-bold block leading-tight truncate text-slate-200">
                                    {pKey}
                                  </span>
                                  {p.description && (
                                    <span className="text-[10px] text-slate-500 block truncate leading-tight">
                                      {p.description}
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditRole(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 transition shadow-lg shadow-indigo-600/25"
                >
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleDeleteRole}
        title={`Delete Role: ${roleToDelete?.name}`}
        description={`Are you sure you want to permanently delete the custom role "${roleToDelete?.name}"?`}
        confirmText={deleting ? 'Deleting...' : 'Delete Role'}
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}


