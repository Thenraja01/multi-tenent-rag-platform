'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Plus, RefreshCw, Lock, Edit, Trash2, X } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { KpiCard } from '@/components/shared/KpiCard';
import { superadminApi } from '@/lib/api/superadmin';

export default function FeaturesCatalogPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [newFeature, setNewFeature] = useState({
    name: '',
    slug: '',
    permission_key: '',
    description: '',
    status: 'ACTIVE',
  });

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const data = await superadminApi.getCatalogFeatures();
      setFeatures(data || []);
    } catch (err) {
      console.error('Failed to fetch catalog features:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await superadminApi.createCatalogFeature({
        name: newFeature.name,
        slug: newFeature.slug || newFeature.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        permission_key: newFeature.permission_key || `${newFeature.slug}.access`,
        description: newFeature.description || undefined,
        status: newFeature.status,
      });
      setIsCreateOpen(false);
      setNewFeature({ name: '', slug: '', permission_key: '', description: '', status: 'ACTIVE' });
      await fetchFeatures();
    } catch (err) {
      console.error('Failed to create feature:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    try {
      await superadminApi.updateCatalogFeature(editTarget.id, {
        name: editTarget.name,
        slug: editTarget.slug,
        permission_key: editTarget.permission_key,
        description: editTarget.description,
        status: editTarget.status || 'ACTIVE',
      });
      setEditTarget(null);
      await fetchFeatures();
    } catch (err) {
      console.error('Failed to update feature:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await superadminApi.deleteCatalogFeature(deleteTarget.id);
      setDeleteTarget(null);
      await fetchFeatures();
    } catch (err) {
      console.error('Failed to delete feature:', err);
    }
  };

  const filtered = features.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.slug.toLowerCase().includes(search.toLowerCase()) ||
      (f.permission_key || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Feature Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{row.name}</span>
            <span className="text-[10px] font-mono text-slate-500">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'permission_key',
      header: 'Required Permission',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          <Lock className="w-3 h-3 text-indigo-400" />
          <span>{row.permission_key || `${row.slug}.execute`}</span>
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-xs text-slate-400 truncate max-w-sm block">
          {row.description || 'Granular interactive feature capability.'}
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
            title="Edit Feature"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Delete Feature"
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Features Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fine-grained action capabilities (Upload, Download, Search, RAG Query, Delete, Export) bound to permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeatures}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Feature</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard title="Total Features" value={features.length} change="Platform Catalog" />
        <KpiCard title="Active" value={features.filter((f) => f.status === 'ACTIVE' || !f.status).length} trend="up" change="Available" />
        <KpiCard title="Granular RBAC" value="resource.action" change="Syntax Bound" />
        <KpiCard title="UI Gates" value="<FeatureGate />" change="Declarative" />
      </div>

      {/* Search */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search features by name, slug, or permission key..."
        onReset={() => setSearch('')}
      />

      {/* Features Table */}
      <DataTable columns={columns} data={filtered} isLoading={loading} />

      {/* Create Feature Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Platform Feature</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Feature Name *</label>
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) =>
                    setNewFeature({
                      ...newFeature,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                    })
                  }
                  placeholder="e.g. RAG Hybrid Search Query"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Feature Key / Slug *</label>
                <input
                  type="text"
                  value={newFeature.slug}
                  onChange={(e) => setNewFeature({ ...newFeature, slug: e.target.value })}
                  placeholder="rag.query"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Required Permission Key *</label>
                <input
                  type="text"
                  value={newFeature.permission_key}
                  onChange={(e) => setNewFeature({ ...newFeature, permission_key: e.target.value })}
                  placeholder="rag.query"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Description</label>
                <textarea
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  placeholder="Feature execution capability."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25"
                >
                  {createLoading ? 'Creating...' : 'Create Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Platform Feature</h3>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Feature Name *</label>
                <input
                  type="text"
                  value={editTarget.name}
                  onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Feature Key / Slug *</label>
                <input
                  type="text"
                  value={editTarget.slug}
                  onChange={(e) => setEditTarget({ ...editTarget, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Required Permission Key *</label>
                <input
                  type="text"
                  value={editTarget.permission_key || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, permission_key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
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
                  {editLoading ? 'Saving...' : 'Save Feature'}
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
        title="Delete Feature"
        description={`Are you sure you want to delete ${deleteTarget?.name}? It will be removed from all permissions.`}
        confirmText="Delete Feature"
        variant="danger"
      />
    </div>
  );
}
