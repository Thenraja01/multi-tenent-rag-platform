'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Network,
  Plus,
  Layers,
  Users,
  Search,
  Building2,
  CheckCircle2,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';

interface DepartmentItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  domain_id?: string;
  status?: string;
}

interface DomainItem {
  id: string;
  name: string;
  slug: string;
  status?: string;
}

export default function TenantDepartmentsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';

  const [departmentsList, setDepartmentsList] = useState<DepartmentItem[]>([]);
  const [domainsList, setDomainsList] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for new Department
  const [newDomainId, setNewDomainId] = useState('');
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptRes, domRes] = await Promise.all([
        apiClient.get<DepartmentItem[]>('/departments').catch(() => ({ data: [] })),
        apiClient.get<DomainItem[]>('/domains').catch(() => ({ data: [] })),
      ]);

      const depts = Array.isArray(deptRes.data) ? deptRes.data : [];
      const doms = Array.isArray(domRes.data) ? domRes.data : [];

      setDepartmentsList(depts);
      setDomainsList(doms);
      if (doms.length > 0 && !newDomainId) {
        setNewDomainId(doms[0].id);
      }
    } catch (err) {
      console.error('Failed to load departments/domains from API:', err);
      setError('Could not connect to API backend to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const filteredDepts = departmentsList.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'ALL' || dept.domain_id === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: newName.trim(),
        slug: newSlug.trim() || newName.toLowerCase().replace(/\s+/g, '-'),
        description: newDesc.trim() || undefined,
        domain_id: newDomainId || undefined,
      };

      const res = await apiClient.post<DepartmentItem>('/departments', payload);
      if (res.data) {
        setDepartmentsList((prev) => [...prev, res.data]);
      }
      setNewName('');
      setNewSlug('');
      setNewDesc('');
      setCreateModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create department via API:', err);
      alert(err.response?.data?.detail || 'Failed to create department on the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Departments Directory</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-semibold">
              {tenantSlug.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize business functions into hierarchical departments under your active domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Live API Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hierarchy Info Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
        <Network className="w-5 h-5 text-blue-400 shrink-0" />
        <div className="flex-1 min-w-0 font-mono text-[11px]">
          <span className="text-slate-400">Hierarchy: </span>
          <span className="text-white font-bold">{tenantSlug.toUpperCase()}</span>
          <span className="text-blue-400"> → </span>
          <span className="text-indigo-300">Domain</span>
          <span className="text-blue-400"> → </span>
          <span className="text-emerald-400">Department</span>
          <span className="text-blue-400"> → </span>
          <span className="text-amber-400">User / Role</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedDomain('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              selectedDomain === 'ALL'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Domains ({departmentsList.length})
          </button>
          {domainsList.map((dom) => {
            const count = departmentsList.filter((d) => d.domain_id === dom.id).length;
            return (
              <button
                key={dom.id}
                onClick={() => setSelectedDomain(dom.id)}
                className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                  selectedDomain === dom.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dom.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && departmentsList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse h-36" />
          ))}
        </div>
      ) : filteredDepts.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center bg-slate-900/40 border-slate-800 space-y-3">
          <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-bold text-white">No Departments Found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by creating your first department under an active domain.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            + Create First Department
          </button>
        </Card>
      ) : (
        /* Departments Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepts.map((dept) => {
            const parentDomain = domainsList.find((d) => d.id === dept.domain_id);
            return (
              <Card
                key={dept.id}
                className="p-5 bg-slate-900/60 border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      Domain: {parentDomain?.name || 'General'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">{dept.id}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{dept.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">/{dept.slug}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {dept.description || 'Department workspace for team workflows and document assets.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Active Partition</span>
                  </span>
                  <span className="text-blue-400 font-semibold cursor-pointer hover:underline">
                    Live Backend
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Department Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white">Create Department</h2>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {domainsList.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Parent Domain</label>
                  <select
                    value={newDomainId}
                    onChange={(e) => setNewDomainId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {domainsList.map((dom) => (
                      <option key={dom.id} value={dom.id}>
                        {dom.name} ({dom.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Employee Relations"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Slug URL Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. employee-relations"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of department scope..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold shadow-md transition"
                >
                  {submitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
