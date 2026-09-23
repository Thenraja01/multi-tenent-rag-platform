'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, Plus, Trash2, RefreshCw, Edit, X } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { KpiCard } from '@/components/shared/KpiCard';
import { superadminApi } from '@/lib/api/superadmin';

export default function ModulesCatalogPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const data = await superadminApi.getCatalogModules();
      setModules(data || []);
    } catch (err) {
      console.error('Failed to fetch catalog modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    try {
      await superadminApi.updateCatalogModule(editTarget.id, {
        name: editTarget.name,
        slug: editTarget.slug,
        description: editTarget.description,
        category: editTarget.category,
        route: editTarget.route,
        status: editTarget.status || 'ACTIVE',
      });
      setEditTarget(null);
      await fetchModules();
    } catch (err) {
      console.error('Failed to update module:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await superadminApi.deleteCatalogModule(deleteTarget.id);
      setDeleteTarget(null);
      await fetchModules();
    } catch (err) {
      console.error('Failed to delete module:', err);
    }
  };

  const filtered = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Module Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{row.name}</span>
            <span className="text-[10px] font-mono text-slate-500">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-bold uppercase">
          {row.category || 'Business'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-xs text-slate-400 truncate max-w-sm block">
          {row.description || 'Modular plug-and-play workflow and document engine.'}
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
            onClick={() => setEditTarget({ ...row })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Edit Module"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Delete Module"
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Module Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Reusable business applications (Attendance, Leave, Documents, Projects, Knowledge) available across tenant domains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchModules}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh Modules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Total Modules" value={modules.length} change="Live API Catalog" />
        <KpiCard title="Active Modules" value={modules.filter((m) => m.status === 'ACTIVE' || !m.status).length} trend="up" change="Available" />
        <KpiCard title="Architecture" value="Modular Monolith" change="Hot Pluggable" />
        <KpiCard title="Dynamic Mount" value="Enabled" change="Prefix Scoped" />
      </div>

      {/* Search */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search modules by name or key..."
        onReset={() => setSearch('')}
      />

      {/* Modules Table */}
      <DataTable columns={columns} data={filtered} isLoading={loading} />

      {/* Edit Module Modal (PUT) */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Platform Module</h3>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Module Name *</label>
                <input
                  type="text"
                  value={editTarget.name}
                  onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Module Slug *</label>
                <input
                  type="text"
                  value={editTarget.slug}
                  onChange={(e) => setEditTarget({ ...editTarget, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Category</label>
                <select
                  value={editTarget.category || 'business'}
                  onChange={(e) => setEditTarget({ ...editTarget, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="business">Business Operations</option>
                  <option value="knowledge">Knowledge & RAG</option>
                  <option value="developer">Developer & Infrastructure</option>
                  <option value="governance">Security & Governance</option>
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

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25"
                >
                  {editLoading ? 'Saving...' : 'Save Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Module"
        description={`Are you sure you want to delete ${deleteTarget?.name}? It will be removed from all domain bindings.`}
        confirmText="Delete Module"
        variant="danger"
      />
    </div>
  );
}
