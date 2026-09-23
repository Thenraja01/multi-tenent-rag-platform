'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DynamicModuleView } from '@/components/modules/DynamicModuleView';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { MODULE_REGISTRY } from '@/config/module-registry';
import { useDocuments } from '@/hooks/use-documents';
import { ShieldCheck, MessageSquare, Upload, BookOpen, Search, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DynamicDomainOrModulePage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const slug = (params?.domain as string) || 'hr';
  const { hasDomain, hasModule } = useWorkspace();

  // If this slug is a known module or active pack module, render the isolated DynamicModuleView
  if (MODULE_REGISTRY[slug] || hasModule(slug)) {
    return <DynamicModuleView moduleSlug={slug} />;
  }

  // Otherwise, render Domain Knowledge Hub
  return <DomainKnowledgeHub tenantSlug={tenantSlug} domainSlug={slug} />;
}

function DomainKnowledgeHub({ tenantSlug, domainSlug }: { tenantSlug: string; domainSlug: string }) {
  const { documents, isLoading } = useDocuments(domainSlug);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Domain Hero */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Department Partition: {domainSlug.toUpperCase()}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight capitalize">
          {domainSlug} Intelligent Knowledge Hub
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
          Search indexed documentation, consult the AI Copilot with citations, or upload new policies & spreadsheets.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <Link
            href={`/${tenantSlug}/ai`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start AI Consultation</span>
          </Link>
          <Link
            href={`/${tenantSlug}/documents`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href={`/${tenantSlug}/ai`}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition shadow-xl group"
        >
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-4 group-hover:scale-110 transition">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">AI Copilot</h3>
          <p className="text-xs text-slate-400">Stream answers with real-time source attribution.</p>
        </Link>

        <Link
          href={`/${tenantSlug}/documents`}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition shadow-xl group"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4 group-hover:scale-110 transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Knowledge Base</h3>
          <p className="text-xs text-slate-400">Manage vector indexed manuals, specs & policies.</p>
        </Link>

        <Link
          href={`/${tenantSlug}/documents`}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition shadow-xl group"
        >
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 w-fit mb-4 group-hover:scale-110 transition">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Hybrid Search</h3>
          <p className="text-xs text-slate-400">Keyword and vector dense semantic search.</p>
        </Link>
      </div>

      {/* Knowledge Base Overview */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Domain Knowledge Assets</h3>
          <Link
            href={`/${tenantSlug}/documents`}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            View All Assets →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Document Name</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    Loading domain knowledge assets...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    No documents indexed in this domain yet.
                  </td>
                </tr>
              ) : (
                documents.slice(0, 5).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      {doc.filename}
                    </td>
                    <td className="px-4 py-3 text-slate-400 uppercase font-mono text-[11px]">
                      {doc.domain_id || domainSlug}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
