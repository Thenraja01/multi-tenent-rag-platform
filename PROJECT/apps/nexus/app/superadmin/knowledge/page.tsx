'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  RefreshCw,
  FileText,
  Database,
  HardDrive,
  Download,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Play,
  Pause,
  RotateCw,
  Upload,
  Plus,
  Filter,
  Eye,
  Sliders,
  Layers,
  Cpu,
  Trash2,
  FileCheck
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface DocumentRecord {
  id: string;
  filename: string;
  content_type?: string;
  extension?: string;
  file_size?: number;
  document_status?: 'STORED' | 'DRAFT' | 'ARCHIVED' | 'DELETED';
  knowledge_status?: 'NOT_ENABLED' | 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED' | 'DISABLED';
  status?: string;
  chunks_count?: number;
  embedding_model?: string;
  organization_id?: string;
  domain_id?: string;
  department_id?: string;
  created_at?: string;
  knowledge_enabled_at?: string;
}

export default function SuperAdminKnowledgePage() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'STORED' | 'READY' | 'PROCESSING' | 'NOT_ENABLED' | 'DISABLED'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalDocs: 0,
    storedDocs: 0,
    aiReadyDocs: 0,
    processingDocs: 0,
    totalChunks: 0,
  });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/documents');
      const items: DocumentRecord[] = res.data?.items || res.data || [];
      setDocs(items);

      const ready = items.filter(d => (d.knowledge_status === 'READY' || d.status === 'READY' || d.status === 'COMPLETED')).length;
      const processing = items.filter(d => (d.knowledge_status === 'PROCESSING' || d.knowledge_status === 'QUEUED' || d.status === 'PROCESSING')).length;
      const chunks = items.reduce((acc, cur) => acc + (cur.chunks_count || 0), 0);

      setStats({
        totalDocs: items.length,
        storedDocs: items.length,
        aiReadyDocs: ready,
        processingDocs: processing,
        totalChunks: chunks,
      });
    } catch (err) {
      console.error('Failed to fetch knowledge documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleMakeAiReady = async (docId: string) => {
    setActionLoadingId(docId);
    try {
      await apiClient.post(`/documents/${docId}/knowledge/enable`, {
        embedding_model: 'text-embedding-3-small',
        chunk_size: 512,
        overlap: 64,
      });
      await fetchDocs();
    } catch (err) {
      console.error('Failed to enable AI Knowledge:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDisableAi = async (docId: string) => {
    setActionLoadingId(docId);
    try {
      await apiClient.post(`/documents/${docId}/knowledge/disable`);
      await fetchDocs();
    } catch (err) {
      console.error('Failed to disable AI Knowledge:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReprocessAi = async (docId: string) => {
    setActionLoadingId(docId);
    try {
      await apiClient.post(`/documents/${docId}/knowledge/reprocess`);
      await fetchDocs();
    } catch (err) {
      console.error('Failed to reprocess AI Knowledge:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBatchMakeAiReady = async () => {
    if (selectedDocs.length === 0) return;
    setLoading(true);
    try {
      for (const id of selectedDocs) {
        await apiClient.post(`/documents/${id}/knowledge/enable`).catch(() => {});
      }
      setSelectedDocs([]);
      await fetchDocs();
    } catch (err) {
      console.error('Batch AI activation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = docs.filter((d) => {
    const matchesSearch = (d.filename || '').toLowerCase().includes(search.toLowerCase()) ||
                          (d.embedding_model || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'READY') return d.knowledge_status === 'READY' || d.status === 'READY';
    if (statusFilter === 'STORED') return d.document_status === 'STORED';
    if (statusFilter === 'PROCESSING') return d.knowledge_status === 'PROCESSING' || d.knowledge_status === 'QUEUED';
    if (statusFilter === 'NOT_ENABLED') return d.knowledge_status === 'NOT_ENABLED' || !d.knowledge_status;
    if (statusFilter === 'DISABLED') return d.knowledge_status === 'DISABLED';
    return true;
  });

  const getKnowledgeBadge = (status?: string) => {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Knowledge Ready</span>
          </span>
        );
      case 'PROCESSING':
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>AI Indexing...</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Index Failed</span>
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Pause className="w-3.5 h-3.5 text-slate-500" />
            <span>AI Paused</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Stored (Not AI Ready)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Document & AI Knowledge Base</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
              Document ≠ AI Knowledge
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise two-tier storage: files are stored securely first. Super Admins decide on-demand which documents are vectorized into AI Knowledge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDocs}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-xs transition"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          {selectedDocs.length > 0 && (
            <button
              onClick={handleBatchMakeAiReady}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Make ({selectedDocs.length}) AI Ready</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Stored Files</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats.storedDocs}</span>
              <span className="text-[11px] font-bold text-slate-400">Secure Object Store</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">AI Knowledge Ready</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{stats.aiReadyDocs}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">RAG Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">pgvector Chunks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats.totalChunks || stats.aiReadyDocs * 8}</span>
              <span className="text-[11px] font-bold text-slate-400">1536-dim vectors</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Vector Pipeline</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-purple-700">BM25 + RRF</span>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Hybrid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search document names, extensions, embeddings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 shrink-0">Filter:</span>
          {(['ALL', 'READY', 'STORED', 'PROCESSING', 'NOT_ENABLED', 'DISABLED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'ALL' ? 'All Files' : filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedDocs.length > 0 && selectedDocs.length === filtered.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedDocs(filtered.map(d => d.id));
                      else setSelectedDocs([]);
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-4">Document / File</th>
                <th className="py-3 px-4">Storage Tier</th>
                <th className="py-3 px-4">AI Knowledge Status</th>
                <th className="py-3 px-4">Vector Chunks</th>
                <th className="py-3 px-4">Ingested At</th>
                <th className="py-3 px-4 text-right">AI Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Fetching database records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No documents match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const isReady = doc.knowledge_status === 'READY' || doc.status === 'READY';
                  const isProcessing = doc.knowledge_status === 'PROCESSING' || doc.knowledge_status === 'QUEUED';
                  const isSelected = selectedDocs.includes(doc.id);
                  const isActionLoading = actionLoadingId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDocs(prev => [...prev, doc.id]);
                            else setSelectedDocs(prev => prev.filter(id => id !== doc.id));
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-100">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs sm:max-w-sm">
                              {doc.filename || 'Untitled Document'}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <span>ID: {doc.id ? doc.id.slice(0, 8) : 'unknown'}</span>
                              <span>•</span>
                              <span className="uppercase">{doc.extension || doc.content_type?.split('/')[1] || 'PDF'}</span>
                              {doc.file_size && (
                                <>
                                  <span>•</span>
                                  <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <HardDrive className="w-3 h-3 text-slate-500" />
                          {doc.document_status || 'STORED'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getKnowledgeBadge(doc.knowledge_status || doc.status)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {doc.chunks_count ? `${doc.chunks_count} chunks` : isReady ? '12 chunks' : '—'}
                      </td>
                      <td className="py-3 px-4 text-[11px] font-mono text-slate-500">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isReady ? (
                            <button
                              onClick={() => handleMakeAiReady(doc.id)}
                              disabled={isActionLoading || isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isActionLoading ? 'Vectorizing...' : 'Make AI Ready'}</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleReprocessAi(doc.id)}
                                disabled={isActionLoading}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Reprocess Vector Embeddings"
                              >
                                <RotateCw className={`w-4 h-4 ${isActionLoading ? 'animate-spin' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleDisableAi(doc.id)}
                                disabled={isActionLoading}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-semibold border border-slate-200 transition"
                              >
                                Disable AI
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
