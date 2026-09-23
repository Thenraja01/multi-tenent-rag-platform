'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Plus, Trash2, RefreshCw, FolderGit2, Edit, X, Boxes, CheckSquare, Square, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { KpiCard } from '@/components/shared/KpiCard';
import { superadminApi } from '@/lib/api/superadmin';

export default function DomainsCatalogPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [availablePacks, setAvailablePacks] = useState<any[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Create Form State
  const [newDomain, setNewDomain] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'ACTIVE',
    module_ids: [] as string[],
  });

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const [domainsData, modulesData, packsData] = await Promise.all([
        superadminApi.getCatalogDomains(),
        superadminApi.getCatalogModules(),
        superadminApi.getPlans(),
      ]);
      setDomains(domainsData || []);
      const activeMods = modulesData || [];
      setAvailableModules(activeMods);
      setAvailablePacks(packsData || []);

      if (activeMods.length > 0 && newDomain.module_ids.length === 0) {
        setNewDomain((prev) => ({
          ...prev,
          module_ids: activeMods.map((m: any) => m.id),
        }));
      }
    } catch (err) {
      console.error('Failed to fetch catalog domains/modules/packs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleApplyPackToCreate = (pack: any) => {
    setSelectedPackId(pack.id);
    const packModuleIds = (pack.modules || []).map((m: any) => m.id);
    setNewDomain((prev) => ({
      ...prev,
      name: prev.name ? prev.name : pack.name,
      slug: prev.slug ? prev.slug : pack.slug,
      description: prev.description ? prev.description : pack.description || '',
      module_ids: packModuleIds.length > 0 ? packModuleIds : prev.module_ids,
    }));
  };

  const handleApplyPackToEdit = (pack: any) => {
    if (!editTarget) return;
    const packModuleIds = (pack.modules || []).map((m: any) => m.id);
    setEditTarget((prev: any) => ({
      ...prev,
      module_ids: packModuleIds.length > 0 ? packModuleIds : prev.module_ids,
    }));
  };

  const handleToggleCreateModule = (moduleId: string) => {
    setNewDomain((prev) => {
      const exists = prev.module_ids.includes(moduleId);
      return {
        ...prev,
        module_ids: exists
          ? prev.module_ids.filter((id) => id !== moduleId)
          : [...prev.module_ids, moduleId],
      };
    });
  };

  const handleToggleEditModule = (moduleId: string) => {
    if (!editTarget) return;
    const currentIds: string[] = editTarget.module_ids || [];
    const exists = currentIds.includes(moduleId);
    setEditTarget({
      ...editTarget,
      module_ids: exists ? currentIds.filter((id) => id !== moduleId) : [...currentIds, moduleId],
    });
  };

  const handleSelectAllCreate = (select: boolean) => {
    setSelectedPackId(null);
    setNewDomain((prev) => ({
      ...prev,
      module_ids: select ? availableModules.map((m) => m.id) : [],
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await superadminApi.createCatalogDomain({
        name: newDomain.name,
        slug: newDomain.slug || newDomain.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        description: newDomain.description || undefined,
        status: newDomain.status,
        module_ids: newDomain.module_ids,
      });
      setIsCreateOpen(false);
      setSelectedPackId(null);
      setNewDomain({
        name: '',
        slug: '',
        description: '',
        status: 'ACTIVE',
        module_ids: availableModules.map((m) => m.id),
      });
      await fetchDomains();
    } catch (err) {
      console.error('Failed to create domain:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    try {
      await superadminApi.updateCatalogDomain(editTarget.id, {
        name: editTarget.name,
        slug: editTarget.slug,
        description: editTarget.description,
        status: editTarget.status || 'ACTIVE',
        module_ids: editTarget.module_ids,
      });
      setEditTarget(null);
      await fetchDomains();
    } catch (err) {
      console.error('Failed to update domain:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await superadminApi.deleteCatalogDomain(deleteTarget.id);
      setDeleteTarget(null);
      await fetchDomains();
    } catch (err) {
      console.error('Failed to delete domain:', err);
    }
  };

  const filtered = domains.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.slug.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Domain Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{row.name}</span>
            <span className="text-[10px] font-mono text-slate-500">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'modules',
      header: 'Assigned Modules',
      render: (row) => {
        const mods = row.modules || [];
        if (mods.length === 0) {
          return <span className="text-[10px] font-mono text-slate-500">None Assigned</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {mods.slice(0, 3).map((m: any) => (
              <span
                key={m.id || m.slug}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {m.name || m.slug}
              </span>
            ))}
            {mods.length > 3 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                +{mods.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-xs text-slate-400 truncate max-w-xs block">
          {row.description || 'General business domain with scoped vector chunks'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() =>
              setEditTarget({
                ...row,
                module_ids: (row.modules || []).map((m: any) => m.id),
              })
            }
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Edit Domain"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Delete Domain"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Domain Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Global catalog of business domains (HR, IT, Finance, Engineering, Legal) with assigned application modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDomains}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh Domains"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Domain</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Total Domains" value={domains.length} change="Catalog" />
        <KpiCard title="Active" value={domains.filter((d) => d.status === 'ACTIVE' || !d.status).length} trend="up" change="Available" />
        <KpiCard title="Catalog Modules" value={availableModules.length} change="Pluggable Apps" />
        <KpiCard title="Storage Partitioning" value="PostgreSQL RLS" change="Scoped Vector DB" />
      </div>

      {/* Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search domains by name or slug..."
        onReset={() => setSearch('')}
      />

      {/* Domains Table */}
      <DataTable columns={columns} data={filtered} isLoading={loading} />

      {/* Create Domain Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Create Platform Domain</span>
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 font-mono">Domain Name *</label>
                  <input
                    type="text"
                    value={newDomain.name}
                    onChange={(e) =>
                      setNewDomain({
                        ...newDomain,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                      })
                    }
                    placeholder="e.g. Human Resources"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 font-mono">Domain Slug *</label>
                  <input
                    type="text"
                    value={newDomain.slug}
                    onChange={(e) => setNewDomain({ ...newDomain, slug: e.target.value })}
                    placeholder="hr"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Status</label>
                <select
                  value={newDomain.status}
                  onChange={(e) => setNewDomain({ ...newDomain, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ACTIVE">Active (Available for Packs)</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Description</label>
                <textarea
                  value={newDomain.description}
                  onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
                  placeholder="Scope of ground-truth documents and AI reasoning capabilities."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Available Packs Preset Selection */}
              {availablePacks.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      <span>Apply Pack Preset (Auto-select modules)</span>
                    </label>
                    <Link
                      href="/superadmin/packs"
                      className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 transition"
                      target="_blank"
                    >
                      Manage Packs →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availablePacks.map((pack) => {
                      const isSelected = selectedPackId === pack.id;
                      return (
                        <button
                          key={pack.id}
                          type="button"
                          onClick={() => handleApplyPackToCreate(pack)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                            isSelected
                              ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500 shadow-md shadow-purple-500/10'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <Package className="w-3 h-3 text-purple-400" />
                          <span>{pack.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {pack.modules?.length || pack.modules_count || 0} mods
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Modules Checkbox List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Available Modules (Assign to this Domain)</span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectAllCreate(true)}
                      className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllCreate(false)}
                      className="text-slate-400 hover:text-slate-300 transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  {availableModules.length === 0 ? (
                    <div className="col-span-2 p-3 text-center text-xs text-slate-500 font-mono">
                      No modules registered in catalog.
                    </div>
                  ) : (
                    availableModules.map((mod) => {
                      const isChecked = newDomain.module_ids.includes(mod.id);
                      return (
                        <label
                          key={mod.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition select-none border ${
                            isChecked
                              ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCreateModule(mod.id)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                          />
                          <div className="truncate flex-1">
                            <span className="text-xs font-semibold block leading-tight truncate">
                              {mod.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 block truncate">
                              {mod.slug}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Domain Modal (PUT) */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Edit Platform Domain</span>
              </h3>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 font-mono">Domain Name *</label>
                  <input
                    type="text"
                    value={editTarget.name}
                    onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 font-mono">Domain Slug *</label>
                  <input
                    type="text"
                    value={editTarget.slug}
                    onChange={(e) => setEditTarget({ ...editTarget, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Status</label>
                <select
                  value={editTarget.status || 'ACTIVE'}
                  onChange={(e) => setEditTarget({ ...editTarget, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Description</label>
                <textarea
                  value={editTarget.description || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Available Packs Preset in Edit */}
              {availablePacks.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      <span>Apply Pack Preset</span>
                    </label>
                    <Link
                      href="/superadmin/packs"
                      className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 transition"
                      target="_blank"
                    >
                      Manage Packs →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availablePacks.map((pack) => (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => handleApplyPackToEdit(pack)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:bg-purple-600/20 hover:border-purple-500 hover:text-white transition"
                      >
                        <Package className="w-3 h-3 text-purple-400" />
                        <span>{pack.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {pack.modules?.length || pack.modules_count || 0} mods
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Module Checklist in Edit */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assigned Modules</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  {availableModules.map((mod) => {
                    const isChecked = (editTarget.module_ids || []).includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition select-none border ${
                          isChecked
                            ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEditModule(mod.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                        />
                        <div className="truncate flex-1">
                          <span className="text-xs font-semibold block leading-tight truncate">
                            {mod.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block truncate">
                            {mod.slug}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Domain"
        description={`Are you sure you want to delete ${deleteTarget?.name}? It will be removed from the platform catalog.`}
        confirmText="Delete Domain"
        variant="danger"
      />
    </div>
  );
}
