'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { BookOpen, ArrowLeft, MessageSquare, FileText, Sparkles, RefreshCw } from 'lucide-react';

export default function HrHandbookPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';

  // Fetch real HR knowledge and handbook documents from live backend database
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['hr-handbook-docs', tenantSlug],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/documents', {
          params: { domain: 'hr', category: 'policy' },
        });
        return Array.isArray(res.data) ? res.data : res.data?.items || [];
      } catch {
        return [];
      }
    },
  });

  const defaultChapters = [
    { title: 'Chapter 1: Company Mission, Culture & Values', pages: '1 - 6', id: 'ch-1' },
    { title: 'Chapter 2: Employment Status & Records', pages: '7 - 14', id: 'ch-2' },
    { title: 'Chapter 3: Working Hours, Attendance & Remote Norms', pages: '15 - 28', id: 'ch-3' },
    { title: 'Chapter 4: Total Rewards, Compensation & Reviews', pages: '29 - 42', id: 'ch-4' },
    { title: 'Chapter 5: Code of Conduct & Ethics Hotline', pages: '43 - 60', id: 'ch-5' },
  ];

  const items = documents.length > 0
    ? documents.map((doc: any) => ({
        id: doc.id,
        title: doc.title || doc.filename || 'HR Policy Document',
        pages: doc.chunk_count ? `${doc.chunk_count} Vector Chunks` : 'Indexed Policy',
        docId: doc.id,
      }))
    : defaultChapters;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href={`/${tenantSlug}/hr`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to HR Portal</span>
        </Link>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Refresh Handbook"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Employee Handbook & Policies</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive guide to company culture, benefits, working standards, and code of conduct
          </p>
        </div>

        <Link
          href={`/${tenantSlug}/hr/chat`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask Handbook AI</span>
        </Link>
      </div>

      {isLoading && documents.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ch: any) => (
            <div
              key={ch.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  {ch.docId ? <FileText className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{ch.title}</h4>
                  <p className="text-[10px] text-slate-500">{ch.pages}</p>
                </div>
              </div>

              <Link
                href={`/${tenantSlug}/hr/chat`}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Query with RAG</span>
                <Sparkles className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
