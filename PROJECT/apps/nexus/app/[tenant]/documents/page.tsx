'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Database,
  Lock,
  Layers,
  Sparkles,
  Table,
  Image as ImageIcon,
  Presentation,
  CheckCircle2,
  X,
  Eye,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  ScanText,
  Shield,
  Users,
  Network,
  UserCheck,
  Clock,
  ShieldAlert,
  Cpu,
  Check,
  CheckCircle,
  ThumbsDown,
  LayoutGrid,
  List,
  ExternalLink,
  Plus,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useWorkspace } from '@/providers/WorkspaceProvider';

function parseApiError(err: any, fallback = 'Operation failed.'): string {
  if (!err) return fallback;
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.detail) {
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.detail === 'object') {
      return data.detail.error || data.detail.message || JSON.stringify(data.detail);
    }
  }
  if (data?.error) {
    if (typeof data.error === 'string') return data.error;
    if (typeof data.error === 'object') {
      return data.error.message || data.error.error || JSON.stringify(data.error);
    }
  }
  if (data?.message) {
    return typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
  }
  if (err?.message) return String(err.message);
  return fallback;
}

export default function TenantDocumentsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { can, user, domains, organization } = useWorkspace();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: Grid or Table
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Approval & Processing state
  const [approvingDocId, setApprovingDocId] = useState<string | null>(null);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'PENDING_APPROVAL'>('ALL');
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reference data for ACL controls
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [roleList, setRoleList] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);

  // Search & Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'DOCS' | 'STRUCTURED' | 'VISUAL'>('ALL');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Granular Access Control State
  const [accessScope, setAccessScope] = useState<'ORGANIZATION' | 'DEPARTMENT' | 'ROLE' | 'USER'>('ORGANIZATION');
  const [targetDepartmentId, setTargetDepartmentId] = useState<string>('');
  const [targetRoleId, setTargetRoleId] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [accessLevel, setAccessLevel] = useState<'READ' | 'WRITE' | 'ADMIN'>('READ');

  // Multi-Tab Document Inspector Modal
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);
  const [inspectTab, setInspectTab] = useState<'chunks' | 'text' | 'acl' | 'meta'>('chunks');
  const [chunks, setChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [docACL, setDocACL] = useState<{ users: any[]; departments: any[]; roles: any[] }>({
    users: [],
    departments: [],
    roles: [],
  });
  const [loadingACL, setLoadingACL] = useState(false);
  const [newACLTargetType, setNewACLTargetType] = useState<'user' | 'department' | 'role'>('department');
  const [newACLTargetId, setNewACLTargetId] = useState('');
  const [newACLLevel, setNewACLLevel] = useState<'READ' | 'WRITE' | 'ADMIN'>('READ');
  const [aclSaving, setAclSaving] = useState(false);
  const isPlatformOrOrgAdmin = !!(user?.is_org_admin || user?.is_superadmin);
  const canUpload = !!(
    isPlatformOrOrgAdmin ||
    can('document:upload') ||
    can('document:create') ||
    can('document:manage') ||
    can('*')
  );

  const canApprove = !!(
    isPlatformOrOrgAdmin ||
    can('document:approve') ||
    can('document:manage') ||
    can('*')
  );

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/knowledge/documents');
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setError(err?.response?.data?.detail || 'Failed to load documents from knowledge base.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (docId: string, filename: string) => {
    setApprovingDocId(docId);
    setActionAlert(null);
    try {
      const res = await apiClient.post(`/documents/${docId}/approve`);
      setActionAlert({
        type: 'success',
        text: `"${filename}" approved! OCR extraction & RAG vector ingestion complete (${res.data.chunk_count || 0} chunks indexed).`,
      });
      await fetchDocuments();
      if (inspectDoc?.id === docId) {
        setInspectDoc({ ...inspectDoc, status: 'READY', chunk_count: res.data.chunk_count });
        fetchChunks(docId);
      }
    } catch (err: any) {
      console.error('Approval failed:', err);
      setActionAlert({
        type: 'error',
        text: parseApiError(err, `Failed to approve and ingest "${filename}".`),
      });
    } finally {
      setApprovingDocId(null);
    }
  };

  const handleReject = async (docId: string, filename: string) => {
    if (!confirm(`Are you sure you want to reject "${filename}" from RAG ingestion?`)) return;
    setRejectingDocId(docId);
    setActionAlert(null);
    try {
      await apiClient.post(`/documents/${docId}/reject`);
      setActionAlert({
        type: 'success',
        text: `"${filename}" was rejected from knowledge base ingestion.`,
      });
      await fetchDocuments();
      if (inspectDoc?.id === docId) {
        setInspectDoc(null);
      }
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        text: parseApiError(err, `Failed to reject "${filename}".`),
      });
    } finally {
      setRejectingDocId(null);
    }
  };

  const fetchMetadataForACL = async () => {
    try {
      const [deptRes, roleRes, userRes] = await Promise.allSettled([
        apiClient.get('/departments'),
        apiClient.get('/roles'),
        apiClient.get('/users'),
      ]);

      if (deptRes.status === 'fulfilled' && Array.isArray(deptRes.value.data)) {
        setDepartmentList(deptRes.value.data);
      }
      if (roleRes.status === 'fulfilled' && Array.isArray(roleRes.value.data)) {
        setRoleList(roleRes.value.data);
      }
      if (userRes.status === 'fulfilled' && Array.isArray(userRes.value.data)) {
        setUserList(userRes.value.data);
      }
    } catch (err) {
      console.debug('Failed to fetch ACL metadata', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    if (canUpload) {
      fetchMetadataForACL();
    }
  }, [canUpload]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedDomainId) {
        formData.append('domain_id', selectedDomainId);
      }

      // Append Granular Access Control
      formData.append('access_scope', accessScope);
      formData.append('access_level', accessLevel);

      if (accessScope === 'DEPARTMENT' && targetDepartmentId) {
        formData.append('department_id', targetDepartmentId);
      } else if (accessScope === 'ROLE' && targetRoleId) {
        formData.append('role_id', targetRoleId);
      } else if (accessScope === 'USER' && targetUserId) {
        formData.append('target_user_id', targetUserId);
      }

      await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedDomainId('');
      setAccessScope('ORGANIZATION');
      setTargetDepartmentId('');
      setTargetRoleId('');
      setTargetUserId('');
      setActionAlert({
        type: 'success',
        text: `Document uploaded and staged securely. Click "Approve & Ingest RAG" to index into memory.`,
      });
      fetchDocuments();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(parseApiError(err, 'Document upload and parsing failed.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}" and its vector chunks?`)) return;
    try {
      await apiClient.delete(`/documents/${id}`);
      setActionAlert({ type: 'success', text: `"${filename}" was deleted successfully.` });
      fetchDocuments();
      if (inspectDoc?.id === id) setInspectDoc(null);
    } catch (err: any) {
      alert(parseApiError(err, 'Failed to delete document.'));
    }
  };

  const fetchChunks = async (docId: string) => {
    setLoadingChunks(true);
    setChunks([]);
    try {
      const res = await apiClient.get(`/documents/${docId}/chunks`);
      setChunks(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to load chunks:', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const fetchDocACL = async (docId: string) => {
    setLoadingACL(true);
    try {
      const res = await apiClient.get(`/documents/${docId}/acl`);
      setDocACL(res.data || { users: [], departments: [], roles: [] });
    } catch (err) {
      console.debug('Failed to fetch doc ACL', err);
    } finally {
      setLoadingACL(false);
    }
  };

  const openInspectModal = (doc: any, initialTab: 'chunks' | 'text' | 'acl' | 'meta' = 'chunks') => {
    setInspectDoc(doc);
    setInspectTab(initialTab);
    fetchChunks(doc.id);
    fetchDocACL(doc.id);
  };

  const handleAddACLRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectDoc || !newACLTargetId) return;
    setAclSaving(true);
    try {
      const payload: any = { access_level: newACLLevel };
      if (newACLTargetType === 'user') payload.user_id = newACLTargetId;
      else if (newACLTargetType === 'department') payload.department_id = newACLTargetId;
      else if (newACLTargetType === 'role') payload.role_id = newACLTargetId;

      await apiClient.post(`/documents/${inspectDoc.id}/acl`, payload);
      setNewACLTargetId('');
      fetchDocACL(inspectDoc.id);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to add ACL rule');
    } finally {
      setAclSaving(false);
    }
  };

  const handleRevokeACLRule = async (aclType: 'user' | 'department' | 'role', targetId: string) => {
    if (!inspectDoc) return;
    try {
      await apiClient.delete(`/documents/${inspectDoc.id}/acl/${aclType}/${targetId}`);
      fetchDocACL(inspectDoc.id);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to revoke ACL rule');
    }
  };

  const getFormatDetails = (filename: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) {
      return {
        category: 'DOCS',
        label: ext === 'pdf' ? 'PDF Document' : ext.includes('doc') ? 'Word Document' : 'Text Document',
        icon: FileText,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        pipeline: 'Direct Semantic Parsing',
      };
    }
    if (['ppt', 'pptx'].includes(ext)) {
      return {
        category: 'DOCS',
        label: 'Presentation (PPT)',
        icon: Presentation,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        pipeline: 'Slide & Shape Parser',
      };
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return {
        category: 'STRUCTURED',
        label: ext === 'csv' ? 'CSV Dataset' : 'Excel Matrix',
        icon: Table,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        pipeline: 'Table Matrix Parser',
      };
    }
    if (['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(ext)) {
      return {
        category: 'VISUAL',
        label: 'Scanned Image / OCR',
        icon: ScanText,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        pipeline: 'Optical Character Recognition (OCR)',
      };
    }
    return {
      category: 'DOCS',
      label: 'Document',
      icon: FileText,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      pipeline: 'UTF-8 Parser',
    };
  };

  const pendingCount = documents.filter((d) => d.status === 'PENDING_APPROVAL').length;
  const readyCount = documents.filter((d) => d.status === 'READY').length;
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  const filteredDocuments = documents.filter((doc) => {
    const details = getFormatDetails(doc.filename);
    const matchesCategory = activeTab === 'ALL' || details.category === activeTab;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'READY' ? doc.status === 'READY' : doc.status === 'PENDING_APPROVAL');
    const matchesSearch =
      !searchQuery.trim() ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.domain_name && doc.domain_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Documents & Knowledge Vault</h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              Zero-Trust Staging & ACL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise document storage with two-stage review & RAG vector ingestion for{' '}
            <span className="text-indigo-300 font-semibold">{organization?.name || tenantSlug.toUpperCase()}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDocuments}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh Knowledge Index"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {canUpload && (
            <button
              onClick={() => {
                setUploadError(null);
                setShowUploadModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Store Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total Documents</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{documents.length}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Stored across all domains</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>RAG Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{readyCount}</div>
          <span className="text-[10px] text-emerald-500/80 mt-0.5 block">{totalChunks} Vector Chunks Embedded</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-amber-500/80 mt-0.5 block">Awaiting admin review</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Security Engine</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white mt-1">Zero-Trust ACL</div>
          <span className="text-[10px] text-blue-400 mt-0.5 block">Row-level partition isolation</span>
        </div>
      </div>

      {/* Action Notification Alert Banner */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            actionAlert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionAlert.text}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800/80 mr-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setStatusFilter('READY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'READY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              RAG Ready ({readyCount})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING_APPROVAL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                statusFilter === 'PENDING_APPROVAL'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {[
            { id: 'ALL', label: 'All Formats' },
            { id: 'DOCS', label: 'PDF / Word / PPT' },
            { id: 'STRUCTURED', label: 'Excel / CSV' },
            { id: 'VISUAL', label: 'OCR / Images' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indexed assets..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Document Content Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span>Loading knowledge vault partitions...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">No matching knowledge documents found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchQuery
                ? `No documents matching "${searchQuery}". Try changing your filter.`
                : statusFilter === 'PENDING_APPROVAL'
                ? 'No documents currently awaiting approval. All stored documents are ingested!'
                : 'Upload PDFs, Word docs, Excel spreadsheets, PPT presentations, or scanned image policies.'}
            </p>
          </div>
          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Store Document Now</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => {
            const format = getFormatDetails(doc.filename);
            const Icon = format.icon;
            const isPending = doc.status === 'PENDING_APPROVAL';
            const isProcessing = doc.status === 'PROCESSING' || approvingDocId === doc.id;
            const isReady = doc.status === 'READY' && !isProcessing;

            return (
              <div
                key={doc.id}
                className={`p-5 rounded-3xl bg-slate-900/60 border backdrop-blur-xl shadow-xl flex flex-col justify-between transition group space-y-4 ${
                  isPending
                    ? 'border-amber-500/30 hover:border-amber-500/50'
                    : isProcessing
                    ? 'border-blue-500/40'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-3 rounded-2xl border ${format.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                          {doc.filename}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {format.label} • {doc.file_size ? (doc.file_size / 1024).toFixed(1) + ' KB' : 'Stored'}
                        </span>
                      </div>
                    </div>

                    {isReady ? (
                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    ) : isProcessing ? (
                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                        <Cpu className="w-3 h-3 animate-spin" />
                        <span>Ingesting</span>
                      </span>
                    ) : isPending ? (
                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {doc.status}
                      </span>
                    )}
                  </div>

                  {/* Pending Staging Callout */}
                  {isPending && (
                    <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300/90 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>Stored in Staging</span>
                      </div>
                      <p className="text-[10px] text-amber-400/80 leading-relaxed">
                        Securely saved. Click approve to run OCR, chunking, and index vectors for RAG.
                      </p>
                    </div>
                  )}

                  {/* Processing Callout */}
                  {isProcessing && (
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Extracting OCR text, calculating chunks & embeddings...</span>
                    </div>
                  )}

                  {/* Processing Pipeline & Access Metadata */}
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/40 space-y-1.5 text-[10px] font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Pipeline:</span>
                      <span className="text-slate-200 font-semibold">{format.pipeline}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Vector Chunks:</span>
                      <span className={isReady ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                        {isReady ? `${doc.chunk_count || 0} Chunks Indexed` : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="space-y-3 pt-2">
                  {/* Approve / Ingest Actions for Pending Documents */}
                  {isPending && canApprove && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(doc.id, doc.filename)}
                        disabled={isProcessing || rejectingDocId === doc.id}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-1.5"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Ingesting RAG...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Approve & Ingest RAG</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(doc.id, doc.filename)}
                        disabled={isProcessing || rejectingDocId === doc.id}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
                        title="Reject Document"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openInspectModal(doc, 'chunks')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => openInspectModal(doc, 'acl')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition"
                      >
                        <Lock className="w-3 h-3 text-indigo-400" />
                        <span>ACL</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500 mr-2">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Stored'}
                      </span>
                      {canUpload && (
                        <button
                          onClick={() => handleDelete(doc.id, doc.filename)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Format & Pipeline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Stored Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDocuments.map((doc) => {
                  const format = getFormatDetails(doc.filename);
                  const Icon = format.icon;
                  const isPending = doc.status === 'PENDING_APPROVAL';
                  const isProcessing = doc.status === 'PROCESSING' || approvingDocId === doc.id;
                  const isReady = doc.status === 'READY' && !isProcessing;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border ${format.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{doc.filename}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {doc.file_size ? (doc.file_size / 1024).toFixed(1) + ' KB' : 'Stored'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        <div>{format.label}</div>
                        <div className="text-[10px] text-slate-500">{format.pipeline}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isReady ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Ready
                          </span>
                        ) : isProcessing ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Ingesting
                          </span>
                        ) : isPending ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {doc.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold">
                        {isReady ? `${doc.chunk_count || 0} chunks` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Stored'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && canApprove && (
                            <button
                              onClick={() => handleApprove(doc.id, doc.filename)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}
                          <Link
                            href={`/${tenantSlug}/documents/${doc.id}?tab=overview`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Open Document Viewer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {canUpload && (
                            <button
                              onClick={() => handleDelete(doc.id, doc.filename)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal with Granular ACL Controls */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Store Document & Set Access Limits</h3>
                  <p className="text-[11px] text-slate-400">Files are staged securely and queued for RAG approval</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{typeof uploadError === 'string' ? uploadError : parseApiError(uploadError)}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 font-mono uppercase text-[11px] flex items-center justify-between">
                  <span>Target Knowledge Domain</span>
                  {!isPlatformOrOrgAdmin && (
                    <span className="text-[10px] text-indigo-400 font-normal">Department Locked</span>
                  )}
                </label>

                {isPlatformOrOrgAdmin ? (
                  <select
                    value={selectedDomainId}
                    onChange={(e) => setSelectedDomainId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Default Knowledge Vault</option>
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.slug})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-white">
                          {user?.department?.name || 'Human Resources'}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Scoped strictly to your assigned department vault
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Active
                    </span>
                  </div>
                )}
              </div>

              {/* Drag & Drop Multi-Format File Box */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 font-mono uppercase">Document, Spreadsheet, or Image *</label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`p-6 rounded-2xl border-2 border-dashed transition text-center space-y-2 ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <Table className="w-4 h-4 text-emerald-400" />
                    <Presentation className="w-4 h-4 text-amber-400" />
                    <ScanText className="w-4 h-4 text-purple-400" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-200 font-medium">
                      Drag & drop file here, or{' '}
                      <label className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer underline">
                        browse
                        <input
                          type="file"
                          required={!selectedFile}
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.tiff,.bmp"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      PDF, DOCX, PPTX, XLSX, CSV, JPG, PNG & Scanned Docs
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] font-mono text-indigo-300 flex items-center justify-between">
                      <span className="truncate">{selectedFile.name}</span>
                      <span className="text-slate-400 shrink-0 ml-2">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Granular Access Control (ACL) Section */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs font-mono uppercase">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Document Access Limits (Zero-Trust ACL)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">By Default: Org Admin + Allowed</span>
                </div>

                {/* Access Scope Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ORGANIZATION', label: 'All Org Members', icon: Users },
                    { id: 'DEPARTMENT', label: 'Department', icon: Network },
                    { id: 'ROLE', label: 'Specific Role', icon: Shield },
                    { id: 'USER', label: 'Particular User', icon: UserCheck },
                  ].map((scope) => {
                    const Icon = scope.icon;
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => setAccessScope(scope.id as any)}
                        className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
                          accessScope === scope.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{scope.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Conditional Sub-selectors based on Access Scope */}
                {accessScope === 'DEPARTMENT' && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-semibold">Select Target Department:</label>
                    <select
                      value={targetDepartmentId}
                      onChange={(e) => setTargetDepartmentId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Department...</option>
                      {departmentList.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {accessScope === 'ROLE' && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-semibold">Select Target Role:</label>
                    <select
                      value={targetRoleId}
                      onChange={(e) => setTargetRoleId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Role...</option>
                      {roleList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {accessScope === 'USER' && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-semibold">Select Specific Member:</label>
                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select User...</option>
                      {userList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || u.email} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isPlatformOrOrgAdmin && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Granted Access Level:</span>
                    <div className="flex items-center gap-2">
                      {(['READ', 'WRITE', 'ADMIN'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setAccessLevel(lvl)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition ${
                            accessLevel === lvl
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 transition shadow-lg shadow-indigo-600/25 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading & Staging...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Store Document (Queue for Approval)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Tab Document Inspector Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{inspectDoc.filename}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                    {inspectDoc.status}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  ID: {inspectDoc.id} • {inspectDoc.chunk_count || 0} Chunks Indexed
                </p>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center px-5 border-b border-slate-800 gap-4 text-xs font-semibold">
              <button
                onClick={() => setInspectTab('chunks')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  inspectTab === 'chunks'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Vector Chunks ({chunks.length})</span>
              </button>
              <button
                onClick={() => setInspectTab('acl')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  inspectTab === 'acl'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Access Control (ACL)</span>
              </button>
              <button
                onClick={() => setInspectTab('meta')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  inspectTab === 'meta'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Storage Metadata</span>
              </button>
            </div>

            {/* Modal Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              {inspectTab === 'chunks' && (
                <div>
                  {loadingChunks ? (
                    <div className="py-12 text-center text-slate-500 text-xs font-mono flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading vector chunks...</span>
                    </div>
                  ) : chunks.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No vector chunks extracted yet. Click "Approve & Ingest RAG" to parse document.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chunks.map((chk, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs shadow-sm"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="font-bold text-indigo-400">Chunk #{chk.chunk_index + 1}</span>
                            <span>Page / Sheet: {chk.page_number || 1}</span>
                          </div>
                          <p className="text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                            {chk.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {inspectTab === 'acl' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
                    <span>Manage live access permissions for this document.</span>
                    <span className="text-[10px] font-mono text-indigo-400">Zero-Trust Isolation</span>
                  </div>

                  {/* Add New ACL Rule */}
                  {canUpload && (
                    <form onSubmit={handleAddACLRule} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Grant New Access Rule</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                          value={newACLTargetType}
                          onChange={(e) => {
                            setNewACLTargetType(e.target.value as any);
                            setNewACLTargetId('');
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                        >
                          <option value="department">Department</option>
                          <option value="role">Role</option>
                          <option value="user">Specific User</option>
                        </select>

                        <select
                          value={newACLTargetId}
                          onChange={(e) => setNewACLTargetId(e.target.value)}
                          required
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                        >
                          <option value="">Select Target...</option>
                          {newACLTargetType === 'department' &&
                            departmentList.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          {newACLTargetType === 'role' &&
                            roleList.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          {newACLTargetType === 'user' &&
                            userList.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.full_name || u.email}
                              </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2">
                          <select
                            value={newACLLevel}
                            onChange={(e) => setNewACLLevel(e.target.value as any)}
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white flex-1"
                          >
                            <option value="READ">READ</option>
                            <option value="WRITE">WRITE</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            type="submit"
                            disabled={aclSaving || !newACLTargetId}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Existing Rules List */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 font-mono uppercase">Assigned Permissions</h4>
                    {loadingACL ? (
                      <div className="py-6 text-center text-slate-500 text-xs">Loading ACL rules...</div>
                    ) : docACL.departments.length === 0 && docACL.roles.length === 0 && docACL.users.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-500 text-xs">
                        Default Organization-wide access (all approved members).
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {docACL.departments.map((d) => {
                          const deptName = departmentList.find((x) => x.id === d.department_id)?.name || d.department_id;
                          return (
                            <div
                              key={d.department_id}
                              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Network className="w-3.5 h-3.5 text-blue-400" />
                                <div>
                                  <span className="font-bold text-white">{deptName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">Department</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[10px] font-bold">
                                  {d.access_level}
                                </span>
                                {canUpload && (
                                  <button
                                    onClick={() => handleRevokeACLRule('department', d.department_id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {docACL.roles.map((r) => {
                          const roleName = roleList.find((x) => x.id === r.role_id)?.name || r.role_id;
                          return (
                            <div
                              key={r.role_id}
                              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-amber-400" />
                                <div>
                                  <span className="font-bold text-white">{roleName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">Role</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[10px] font-bold">
                                  {r.access_level}
                                </span>
                                {canUpload && (
                                  <button
                                    onClick={() => handleRevokeACLRule('role', r.role_id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {docACL.users.map((u) => {
                          const uObj = userList.find((x) => x.id === u.user_id);
                          const uName = uObj ? (uObj.full_name || uObj.email) : u.user_id;
                          return (
                            <div
                              key={u.user_id}
                              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <div>
                                  <span className="font-bold text-white">{uName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">User</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[10px] font-bold">
                                  {u.access_level}
                                </span>
                                {canUpload && (
                                  <button
                                    onClick={() => handleRevokeACLRule('user', u.user_id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {inspectTab === 'meta' && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Document ID:</span>
                    <span className="text-white select-all">{inspectDoc.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Original Filename:</span>
                    <span className="text-white">{inspectDoc.filename}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>File Size:</span>
                    <span className="text-white">{inspectDoc.file_size ? `${(inspectDoc.file_size / 1024).toFixed(2)} KB` : 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Current Status:</span>
                    <span className="text-indigo-400 font-bold">{inspectDoc.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Page Count:</span>
                    <span className="text-white">{inspectDoc.page_count || 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Indexed Chunks:</span>
                    <span className="text-emerald-400 font-bold">{inspectDoc.chunk_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Created Date:</span>
                    <span className="text-white">{inspectDoc.created_at ? new Date(inspectDoc.created_at).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
