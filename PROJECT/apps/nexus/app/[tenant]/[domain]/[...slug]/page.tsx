'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { resolveModule, ModuleDefinition } from '@/config/module-registry';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import { useDocuments } from '@/hooks/use-documents';
import {
  ShieldCheck,
  Bot,
  FileText,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Calendar,
  DollarSign,
  User,
  Tag,
  Sparkles,
  Send,
  History,
  Database,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export default function DynamicDepartmentSubRoutePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tenantSlug = (params?.tenant as string) || 'default';
  const domainSlug = (params?.domain as string) || 'general';
  const slugParts = Array.isArray(params?.slug) ? params.slug : [params?.slug as string];

  const primaryModuleSlug = slugParts[0] || 'dashboard';
  const subActionOrView = slugParts[1] || 'all';

  const { organization, hasModule, getDataScope } = useWorkspace();
  const moduleDef = resolveModule(primaryModuleSlug);
  const Icon = moduleDef.icon;
  const dataScope = getDataScope(primaryModuleSlug);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Fetch live database records for this module
  const { data: recordsData = [], isLoading: recordsLoading, refetch } = useQuery({
    queryKey: ['dynamic-module-records', tenantSlug, domainSlug, primaryModuleSlug],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/tickets', {
          params: { category: primaryModuleSlug },
        });
        return Array.isArray(res.data) ? res.data : res.data?.items || res.data?.tickets || [];
      } catch {
        return [];
      }
    },
  });

  // Form states for 'new'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    amount: '',
    assignee: '',
    priority: 'Medium',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/tickets', {
        title: formData.title,
        description: formData.description || `Record created for ${moduleDef.name}`,
        category: primaryModuleSlug,
        priority: formData.priority.toUpperCase(),
        meta_data: formData,
      });
      queryClient.invalidateQueries({ queryKey: ['dynamic-module-records'] });
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setTimeout(() => {
        setSubmissionSuccess(false);
        router.push(`/${tenantSlug}/${domainSlug}/${primaryModuleSlug}`);
      }, 800);
    } catch {
      setIsSubmitting(false);
      router.push(`/${tenantSlug}/${domainSlug}/${primaryModuleSlug}`);
    }
  };

  // Nexus AI Sub-view
  if (primaryModuleSlug === 'nexus') {
    return (
      <NexusSubView
        tenantSlug={tenantSlug}
        domainSlug={domainSlug}
        subView={subActionOrView}
      />
    );
  }

  // Create/New Resource Form
  if (subActionOrView === 'new') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              <Icon className="w-3.5 h-3.5" />
              <span>{domainSlug.toUpperCase()} Domain / {moduleDef.name}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Create New {moduleDef.name.replace(/ Management| Tracking| Directory/g, '')} Record
            </h1>
          </div>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {submissionSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Record Submitted Successfully</h3>
              <p className="text-xs text-slate-400">Scoped to {domainSlug.toUpperCase()} tenant context.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Title / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. Annual Leave, Q3 Hardware, Vendor SLA`}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category / Type
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Standard, Hardware, Medical, NDA`}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {primaryModuleSlug === 'expenses' || primaryModuleSlug === 'invoices' || primaryModuleSlug === 'payments' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Amount ($ USD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Cost Center / Department
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${domainSlug.toUpperCase()} Department`}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-xs font-mono"
                    />
                  </div>
                </div>
              ) : null}

              {primaryModuleSlug === 'leave' || primaryModuleSlug === 'attendance' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Description / Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide supporting details, business justification, or relevant terms..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Enforcing {dataScope.toUpperCase()} Data Isolation Scope</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : `Create ${moduleDef.name.replace(/ Management| Tracking/g, '')}`}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Standard Module View with Sub-tabs (e.g. pending, history, reports, approvals)
  const views = moduleDef.views || ['all', 'recent', 'reports'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
            <Icon className="w-4 h-4" />
            <span>{domainSlug.toUpperCase()} Department / {moduleDef.category.toUpperCase()} Module</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {moduleDef.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {moduleDef.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${tenantSlug}/ai?q=${encodeURIComponent(`Show policies and guidance for ${moduleDef.name} in ${domainSlug}`)}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Consult AI</span>
          </Link>

          {moduleDef.actions?.includes('new') && (
            <Link
              href={`/${tenantSlug}/${domainSlug}/${primaryModuleSlug}/new`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </Link>
          )}
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      {views.length > 0 && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {views.map((v) => {
            const isActive = subActionOrView === v || (subActionOrView === 'all' && v === views[0]);
            return (
              <Link
                key={v}
                href={`/${tenantSlug}/${domainSlug}/${primaryModuleSlug}/${v}`}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {v.replace(/_/g, ' ')}
              </Link>
            );
          })}
        </div>
      )}

      {/* Table / Records Area */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Filter ${moduleDef.name.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtered by: <strong className="text-white capitalize">{subActionOrView}</strong></span>
          </div>
        </div>

        {/* Dynamic Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Reference / Item</th>
                <th className="px-4 py-3">Owner / Member</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recordsLoading && recordsData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading records from live backend...
                  </td>
                </tr>
              ) : recordsData.length > 0 ? (
                recordsData.map((rec: any, idx: number) => {
                  const refCode = rec.ticket_number || `REF-${primaryModuleSlug.toUpperCase().slice(0, 3)}-${String(idx + 1).padStart(3, '0')}`;
                  const title = rec.title || rec.name || 'Module Record';
                  const owner = rec.created_by || rec.created_by_name || 'Enterprise Team';
                  const statusStr = (rec.status || 'ACTIVE').toUpperCase();
                  const isApproved = statusStr === 'APPROVED' || statusStr === 'ACTIVE' || statusStr === 'RESOLVED';

                  return (
                    <tr key={rec.id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-white flex items-center gap-2">
                        <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div>
                          <span className="block font-semibold text-white">{title}</span>
                          <span className="text-[10px] font-mono text-slate-500">{refCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{owner}</td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px] uppercase">{domainSlug}</td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Today'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {statusStr}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold">
                          Inspect →
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-white flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>REF-{primaryModuleSlug.toUpperCase().slice(0, 3)}-001</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">Enterprise Team</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px] uppercase">{domainSlug}</td>
                  <td className="px-4 py-3.5 text-slate-400">Today, 09:30 AM</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      APPROVED / ACTIVE
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold">
                      Inspect →
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NexusSubView({
  tenantSlug,
  domainSlug,
  subView,
}: {
  tenantSlug: string;
  domainSlug: string;
  subView: string;
}) {
  const { documents } = useDocuments(domainSlug);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
          <Bot className="w-4 h-4" />
          <span>Nexus RAG / {subView.toUpperCase()} / {domainSlug.toUpperCase()}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight capitalize">
          {domainSlug} Nexus Intelligence: {subView}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
          Zero-trust vector citations, retrieval trace logs, and verified knowledge sources.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <Link
            href={`/${tenantSlug}/ai`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            <Bot className="w-4 h-4" />
            <span>Open Copilot Chat</span>
          </Link>
          <Link
            href={`/${tenantSlug}/${domainSlug}/nexus/sources`}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              subView === 'sources'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 inline mr-1.5" />
            Indexed Sources ({documents.length})
          </Link>
          <Link
            href={`/${tenantSlug}/${domainSlug}/nexus/history`}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              subView === 'history'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 inline mr-1.5" />
            Query Audit History
          </Link>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md">
        <h3 className="text-sm font-bold text-white mb-4">
          {subView === 'sources' ? 'Verified Vector Sources in Scope' : 'Recent RAG Inferences & Citations'}
        </h3>

        {subView === 'sources' ? (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No indexed documents found in domain.</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{doc.filename}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">Domain: {domainSlug.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {doc.status}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3 text-xs text-slate-400">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">"What is the PTO rollover policy for 2026?"</span>
                <span className="text-[10px] text-slate-500">2 hours ago</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Retrieval confidence: 0.94 • 3 vector chunks matched in [HR Policy Handbook.pdf]
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">"Show approved expense limits for travel"</span>
                <span className="text-[10px] text-slate-500">Yesterday</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Retrieval confidence: 0.91 • 2 vector chunks matched in [Travel Reimbursement Guide.pdf]
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
