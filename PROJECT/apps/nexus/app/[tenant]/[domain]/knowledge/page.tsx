'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDocuments } from '@/hooks/use-documents';
import { BookOpen, Upload, Search, FileText, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function DomainKnowledgePage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const domainSlug = (params?.domain as string) || 'hr';
  const { documents, isLoading, deleteDocument, isDeleting } = useDocuments(domainSlug);
  const [search, setSearch] = useState('');

  const filtered = documents.filter((d) =>
    d.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {domainSlug.toUpperCase()} Knowledge Base
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Vector-embedded documents and enterprise manuals partitioned for this department
          </p>
        </div>

        <Link
          href={`/${tenantSlug}/${domainSlug}/knowledge/upload`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
        <Search className="w-4 h-4 text-slate-500 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter documents by filename..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Document File</th>
                <th className="px-5 py-3.5 font-semibold">Mime Type</th>
                <th className="px-5 py-3.5 font-semibold">Pages / Chunks</th>
                <th className="px-5 py-3.5 font-semibold">Vector Status</th>
                <th className="px-5 py-3.5 font-semibold">Indexed Date</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    Loading knowledge documents...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No documents found. Click &ldquo;Upload Document&rdquo; to add new knowledge.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-medium text-white flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-xs">{doc.filename}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                      {doc.mime_type || 'application/pdf'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">
                      {doc.page_count} pages
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-3">
                      <Link
                        href={`/${tenantSlug}/${domainSlug}/knowledge/${doc.id}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                      >
                        <span>View Chunks</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        disabled={isDeleting}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
