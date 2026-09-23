'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield,
  Plus,
  Lock,
  Check,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  Save,
  Trash2,
  Edit3,
  Sparkles,
  KeyRound,
  RotateCcw,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Copy,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface RoleItem {
  id: string;
  name: string;
  slug: string;
  tier_level?: number;
  tier_label?: string;
  is_system?: boolean;
  is_active?: boolean;
  description?: string;
  permission_keys?: string[];
  created_at?: string;
}

interface PermissionItem {
  id: string;
  permission_key: string;
  resource: string;
  action: string;
  description?: string;
}

export default function TenantRolesPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'globex';

  const [rolesList, setRolesList] = useState<RoleItem[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  // Role Permission Customization State
  const [selectedPermKeys, setSelectedPermKeys] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [roleSearch, setRoleSearch] = useState('');
  const [permSearch, setPermSearch] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [permStatusFilter, setPermStatusFilter] = useState<'ALL' | 'GRANTED' | 'DENIED'>('ALL');

  // Create Role Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleSlug, setNewRoleSlug] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Role Meta Modal
  const [editMetaModalOpen, setEditMetaModalOpen] = useState(false);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiClient.get<RoleItem[]>('/roles').catch(() => ({ data: [] })),
        apiClient.get<PermissionItem[]>('/permissions').catch(() => ({ data: [] })),
      ]);

      const roles = Array.isArray(rolesRes.data) ? rolesRes.data : [];
      const perms = Array.isArray(permsRes.data) ? permsRes.data : [];

      setRolesList(roles);
      setPermissionsCatalog(perms);

      if (roles.length > 0) {
        const current = selectedRole ? roles.find((r) => r.id === selectedRole.id) || roles[0] : roles[0];
        setSelectedRole(current);
        const initialKeys = current.permission_keys?.includes('*')
          ? perms.map((p) => p.permission_key)
          : current.permission_keys || [];
        setSelectedPermKeys(initialKeys);
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Failed to load roles/permissions from API:', err);
      setError('Could not connect to API backend to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  // When selected role changes, load its assigned permission keys
  const handleSelectRole = (role: RoleItem) => {
    if (isDirty) {
      if (!confirm('You have unsaved changes on the current role. Discard changes and switch?')) {
        return;
      }
    }
    setSelectedRole(role);
    const initialKeys = role.permission_keys?.includes('*')
      ? permissionsCatalog.map((p) => p.permission_key)
      : role.permission_keys || [];
    setSelectedPermKeys(initialKeys);
    setIsDirty(false);
    setSaveSuccess(false);
  };

  // Toggle single permission key for the currently selected role
  const handleTogglePermKey = (key: string) => {
    setSelectedPermKeys((prev) => {
      const updated = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      setIsDirty(true);
      setSaveSuccess(false);
      return updated;
    });
  };

  // Toggle all permissions in a resource category
  const handleToggleCategory = (categoryPerms: PermissionItem[], shouldEnable: boolean) => {
    const catKeys = categoryPerms.map((p) => p.permission_key);
    setSelectedPermKeys((prev) => {
      let updated: string[];
      if (shouldEnable) {
        const set = new Set([...prev, ...catKeys]);
        updated = Array.from(set);
      } else {
        updated = prev.filter((k) => !catKeys.includes(k));
      }
      setIsDirty(true);
      setSaveSuccess(false);
      return updated;
    });
  };

  // Grant ALL permissions in entire catalog
  const handleGrantAll = () => {
    const allKeys = permissionsCatalog.map((p) => p.permission_key);
    setSelectedPermKeys(allKeys);
    setIsDirty(true);
    setSaveSuccess(false);
  };

  // Revoke ALL permissions
  const handleRevokeAll = () => {
    setSelectedPermKeys([]);
    setIsDirty(true);
    setSaveSuccess(false);
  };

  // Preset: Read-Only (view/read only)
  const handlePresetReadOnly = () => {
    const readKeys = permissionsCatalog
      .filter((p) => {
        const act = p.action.toLowerCase();
        return act.includes('view') || act.includes('read') || act.includes('query') || act.includes('search');
      })
      .map((p) => p.permission_key);
    setSelectedPermKeys(readKeys);
    setIsDirty(true);
    setSaveSuccess(false);
  };

  // Reset to role's saved state
  const handleResetChanges = () => {
    if (!selectedRole) return;
    const initialKeys = selectedRole.permission_keys?.includes('*')
      ? permissionsCatalog.map((p) => p.permission_key)
      : selectedRole.permission_keys || [];
    setSelectedPermKeys(initialKeys);
    setIsDirty(false);
    setSaveSuccess(false);
  };

  // Save updated permissions for the selected role
  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    setSavingPerms(true);
    setError(null);
    try {
      await apiClient.put(`/roles/${selectedRole.id}`, {
        name: selectedRole.name,
        description: selectedRole.description,
        permission_keys: selectedPermKeys,
      });

      // Update local state
      setRolesList((prev) =>
        prev.map((r) => (r.id === selectedRole.id ? { ...r, permission_keys: selectedPermKeys } : r))
      );
      setSelectedRole((prev) => (prev ? { ...prev, permission_keys: selectedPermKeys } : null));
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to save role permissions:', err);
      setError(err.response?.data?.detail || 'Failed to save updated permissions.');
    } finally {
      setSavingPerms(false);
    }
  };

  // Create new custom role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post<RoleItem>('/roles', {
        name: newRoleName.trim(),
        slug: newRoleSlug.trim() || newRoleName.toLowerCase().replace(/\s+/g, '_'),
        description: newRoleDesc.trim(),
        permission_keys: [],
      });

      const created = res.data;
      setRolesList((prev) => [...prev, created]);
      setSelectedRole(created);
      setSelectedPermKeys(created.permission_keys || []);
      setIsDirty(false);
      setCreateModalOpen(false);
      setNewRoleName('');
      setNewRoleSlug('');
      setNewRoleDesc('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create custom role.');
    } finally {
      setSubmitting(false);
    }
  };

  // Clone current role into a new custom role template
  const handleCloneRole = () => {
    if (!selectedRole) return;
    setNewRoleName(`${selectedRole.name} (Copy)`);
    setNewRoleSlug(`${selectedRole.slug}_copy`);
    setNewRoleDesc(`Cloned template from ${selectedRole.name}. ${selectedRole.description || ''}`);
    setCreateModalOpen(true);
  };

  // Update role title/desc
  const handleUpdateRoleMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !editRoleName.trim()) return;

    try {
      await apiClient.put(`/roles/${selectedRole.id}`, {
        name: editRoleName.trim(),
        description: editRoleDesc.trim(),
      });

      setRolesList((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id ? { ...r, name: editRoleName.trim(), description: editRoleDesc.trim() } : r
        )
      );
      setSelectedRole((prev) =>
        prev ? { ...prev, name: editRoleName.trim(), description: editRoleDesc.trim() } : null
      );
      setEditMetaModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update role details.');
    }
  };

  // Delete custom role
  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this custom role? Users assigned to it will lose access.')) {
      return;
    }

    try {
      await apiClient.delete(`/roles/${roleId}`);
      setRolesList((prev) => prev.filter((r) => r.id !== roleId));
      if (selectedRole?.id === roleId) {
        const remaining = rolesList.filter((r) => r.id !== roleId);
        if (remaining.length > 0) handleSelectRole(remaining[0]);
        else setSelectedRole(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete role.');
    }
  };

  // Group catalog permissions by resource
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    permissionsCatalog.forEach((p) => {
      const groupKey = p.resource || 'general';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(p);
    });
    return groups;
  }, [permissionsCatalog]);

  const categories = useMemo(() => {
    return ['ALL', ...Object.keys(groupedPermissions)];
  }, [groupedPermissions]);

  // Filtered Roles List
  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return rolesList;
    const q = roleSearch.toLowerCase();
    return rolesList.filter(
      (r) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q)
    );
  }, [rolesList, roleSearch]);

  const getActionBadgeStyle = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('view') || act.includes('read') || act.includes('query')) {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
    if (act.includes('create') || act.includes('apply') || act.includes('mark') || act.includes('upload')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (act.includes('update') || act.includes('manage') || act.includes('edit')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (act.includes('delete') || act.includes('reject') || act.includes('revoke')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (act.includes('approve') || act.includes('pay') || act.includes('admin')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-10">
      {/* Top Header & Analytics Summary Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Roles & Permissions Studio
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[11px] font-mono font-bold uppercase tracking-wider">
                  {tenantSlug}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-mono font-semibold">
                  Live RBAC Matrix
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-12">
              Select any role to view or customize its capabilities. Toggle permissions interactively with instant real-time saves to the database.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm active:scale-95"
              title="Refresh Live API Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                setNewRoleName('');
                setNewRoleSlug('');
                setNewRoleDesc('');
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 border border-blue-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Role</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Roles</div>
              <div className="text-base font-bold text-white font-mono">{rolesList.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Custom Roles</div>
              <div className="text-base font-bold text-purple-300 font-mono">
                {rolesList.filter((r) => !r.is_system && r.slug !== 'org_admin').length}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Capabilities</div>
              <div className="text-base font-bold text-emerald-300 font-mono">{permissionsCatalog.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Selected Role Granted</div>
              <div className="text-base font-bold text-amber-300 font-mono">
                {selectedPermKeys.length} / {permissionsCatalog.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Studio 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Role Directory (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-xl flex flex-col max-h-[calc(100vh-120px)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Roles Directory ({filteredRoles.length})
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Role Cards Roster (Internal Scrollable) */}
          <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {loading && rolesList.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 animate-pulse h-20" />
                ))}
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-1">
                <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-slate-300 font-semibold">No Roles Found</div>
                <p className="text-[11px]">No roles matching "{roleSearch}"</p>
              </div>
            ) : (
              filteredRoles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                const isSystem = role.is_system || role.slug === 'org_admin';
                const grantedCount = isSelected
                  ? selectedPermKeys.length
                  : role.permission_keys?.includes('*')
                  ? permissionsCatalog.length
                  : role.permission_keys?.length || 0;

                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                              : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{role.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">/{role.slug}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isSystem
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                          }`}
                        >
                          {isSystem ? 'SYSTEM' : 'CUSTOM'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          <strong className={isSelected ? 'text-blue-300 font-bold' : 'text-slate-300'}>
                            {grantedCount}
                          </strong>{' '}
                          / {permissionsCatalog.length} caps
                        </span>
                      </div>
                    </div>

                    {role.description && (
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{role.description}</p>
                    )}

                    {/* Quick Edit Indicator */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Editable RBAC</span>
                      </span>
                      <span className="text-blue-400 group-hover:text-blue-300 font-semibold flex items-center gap-1">
                        <span>{isSelected ? 'Active Studio' : 'Edit Capabilities'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Permission Capability Studio (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[calc(100vh-120px)] backdrop-blur-xl overflow-hidden">
            {selectedRole ? (
              <>
                {/* Pinned Sticky Control Studio Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl shrink-0 space-y-4 z-10">
                  {/* Top Bar: Role Meta & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <span className="truncate">{selectedRole.name}</span>
                          <button
                            onClick={() => {
                              setEditRoleName(selectedRole.name);
                              setEditRoleDesc(selectedRole.description || '');
                              setEditMetaModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Edit Role Title & Description"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </h2>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                          {selectedRole.slug}
                        </span>
                        {isDirty && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono animate-pulse flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" />
                            Unsaved Permission Edits
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-xl">
                        {selectedRole.description ||
                          'Click any capability toggle to grant or revoke specific permissions.'}
                      </p>
                    </div>

                    {/* Action Buttons: Save, Reset, Clone, Delete */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {saveSuccess && (
                        <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/25 font-semibold animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved Successfully
                        </span>
                      )}

                      {isDirty && (
                        <button
                          onClick={handleResetChanges}
                          className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
                          title="Discard unsaved edits"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      )}

                      <button
                        onClick={handleSaveRolePermissions}
                        disabled={savingPerms || !isDirty}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg active:scale-95 ${
                          isDirty
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                            : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingPerms ? 'Saving Changes...' : isDirty ? 'Save Role Permissions' : 'Permissions Saved'}</span>
                      </button>

                      <button
                        onClick={handleCloneRole}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Clone as New Custom Role"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {!selectedRole.is_system && selectedRole.slug !== 'org_admin' && (
                        <button
                          onClick={() => handleDeleteRole(selectedRole.id)}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition"
                          title="Delete Custom Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset Fast Actions Strip */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/60 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-semibold text-slate-300">Fast Presets:</span>
                      <button
                        type="button"
                        onClick={handlePresetReadOnly}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition"
                      >
                        Read-Only
                      </button>
                      <button
                        type="button"
                        onClick={handleGrantAll}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 text-[11px] font-mono transition font-semibold"
                      >
                        Grant All ({permissionsCatalog.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleRevokeAll}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-[11px] font-mono transition"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Filter Granted vs Denied */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
                      <button
                        onClick={() => setPermStatusFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          permStatusFilter === 'ALL'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All ({permissionsCatalog.length})
                      </button>
                      <button
                        onClick={() => setPermStatusFilter('GRANTED')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          permStatusFilter === 'GRANTED'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Granted ({selectedPermKeys.length})
                      </button>
                      <button
                        onClick={() => setPermStatusFilter('DENIED')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          permStatusFilter === 'DENIED'
                            ? 'bg-rose-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Denied ({permissionsCatalog.length - selectedPermKeys.length})
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar: Category Tabs & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-xs overflow-x-auto w-full sm:w-auto max-w-full scrollbar-thin scrollbar-thumb-slate-800">
                      {categories.map((cat) => {
                        const countInCat =
                          cat === 'ALL'
                            ? permissionsCatalog.length
                            : groupedPermissions[cat]?.length || 0;
                        const grantedInCat =
                          cat === 'ALL'
                            ? selectedPermKeys.length
                            : groupedPermissions[cat]?.filter((p) =>
                                selectedPermKeys.includes(p.permission_key)
                              ).length || 0;

                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveCategoryFilter(cat)}
                            className={`px-3 py-1 rounded-lg font-medium transition capitalize whitespace-nowrap flex items-center gap-1.5 ${
                              activeCategoryFilter === cat
                                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                          >
                            <span>{cat}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                activeCategoryFilter === cat
                                  ? 'bg-blue-700 text-white font-bold'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {grantedInCat}/{countInCat}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Capability Search */}
                    <div className="relative w-full sm:w-60 shrink-0">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search capability keys..."
                        value={permSearch}
                        onChange={(e) => setPermSearch(e.target.value)}
                        className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Scrollable Capabilities Matrix Viewport */}
                <div className="p-5 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {Object.entries(groupedPermissions)
                    .filter(([res]) => activeCategoryFilter === 'ALL' || activeCategoryFilter === res)
                    .map(([resourceName, perms]) => {
                      const filteredPerms = perms.filter((p) => {
                        const matchesSearch =
                          p.permission_key.toLowerCase().includes(permSearch.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(permSearch.toLowerCase()));

                        const isGranted = selectedPermKeys.includes(p.permission_key);
                        const matchesStatus =
                          permStatusFilter === 'ALL' ||
                          (permStatusFilter === 'GRANTED' && isGranted) ||
                          (permStatusFilter === 'DENIED' && !isGranted);

                        return matchesSearch && matchesStatus;
                      });

                      if (filteredPerms.length === 0) return null;

                      const totalInGroup = perms.length;
                      const enabledInGroup = perms.filter((p) =>
                        selectedPermKeys.includes(p.permission_key)
                      ).length;

                      return (
                        <div
                          key={resourceName}
                          className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-md"
                        >
                          {/* Category Header Bar with Batch Toggle */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                <Lock className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-white capitalize tracking-wide">
                                {resourceName} Capabilities
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
                                {enabledInGroup} of {totalInGroup} active
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-[11px] font-mono">
                              <button
                                type="button"
                                onClick={() => handleToggleCategory(perms, true)}
                                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-semibold transition"
                              >
                                Enable All
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleCategory(perms, false)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                              >
                                Disable All
                              </button>
                            </div>
                          </div>

                          {/* Capabilities Responsive Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredPerms.map((perm) => {
                              const isGranted = selectedPermKeys.includes(perm.permission_key);

                              return (
                                <div
                                  key={perm.id}
                                  onClick={() => handleTogglePermKey(perm.permission_key)}
                                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer select-none transition-all group ${
                                    isGranted
                                      ? 'bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-900/60 border-blue-500/60 shadow-md shadow-blue-500/5 hover:border-blue-400'
                                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                                  }`}
                                >
                                  <div className="min-w-0 space-y-1 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-xs font-mono font-bold block truncate ${
                                          isGranted ? 'text-blue-200' : 'text-slate-300'
                                        }`}
                                      >
                                        {perm.permission_key}
                                      </span>
                                      <span
                                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold ${getActionBadgeStyle(
                                          perm.action
                                        )}`}
                                      >
                                        {perm.action}
                                      </span>
                                    </div>
                                    {perm.description && (
                                      <span className="text-[11px] text-slate-400 block leading-relaxed line-clamp-2">
                                        {perm.description}
                                      </span>
                                    )}
                                  </div>

                                  {/* Explicit Editable Button / Toggle */}
                                  <div className="shrink-0 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePermKey(perm.permission_key);
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                                        isGranted
                                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500/25'
                                          : 'bg-slate-800/80 text-slate-400 border border-slate-700 group-hover:text-slate-200 group-hover:bg-slate-700'
                                      }`}
                                    >
                                      {isGranted ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span>GRANTED</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-3 h-3 text-slate-500" />
                                          <span>DENIED</span>
                                        </>
                                      )}
                                    </button>

                                    {/* Toggle Switch */}
                                    <div
                                      className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                                        isGranted ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                                      }`}
                                    >
                                      <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="p-16 text-center text-xs text-slate-400 space-y-3">
                <Shield className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="font-bold text-white text-sm">No Role Selected</div>
                <p>Choose a role from the left directory to inspect and edit capabilities.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create Custom Role</h3>
                  <p className="text-[11px] text-slate-400">Define authorization role identity and description.</p>
                </div>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Talent Recruiter"
                  value={newRoleName}
                  onChange={(e) => {
                    setNewRoleName(e.target.value);
                    if (!newRoleSlug) {
                      setNewRoleSlug(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                    }
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Slug (Key) *</label>
                <input
                  type="text"
                  placeholder="e.g. hr_recruiter"
                  value={newRoleSlug}
                  onChange={(e) => setNewRoleSlug(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Define responsibilities and authorization scope for this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newRoleName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50 transition active:scale-95"
                >
                  {submitting ? 'Creating Role...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Metadata Modal */}
      {editMetaModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Edit Role Details</h3>
                  <p className="text-[11px] text-slate-400">Update role display name and description.</p>
                </div>
              </div>
              <button onClick={() => setEditMetaModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoleMeta} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Title *</label>
                <input
                  type="text"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditMetaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition active:scale-95"
                >
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
