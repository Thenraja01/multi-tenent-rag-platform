'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { itApi } from '@/lib/api/domain/it';
import { apiClient } from '@/lib/api';
import { Terminal, ArrowLeft, ArrowRight, FileText, RefreshCw, Sparkles } from 'lucide-react';

export default function ItDocsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';

  // Fetch real runbooks from database
  const { data: runbooksData = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['it-runbooks', tenantSlug],
    queryFn: async () => {
      try {
        const res = await itApi.listRunbooks();
        if (res.runbooks && res.runbooks.length > 0) return res.runbooks;

        // Fallback to indexed IT documents
        const docRes = await apiClient.get('/documents', { params: { domain: 'it' } });
        const docs = Array.isArray(docRes.data) ? docRes.data : docRes.data?.items || [];
        return docs.map((d: any) => ({
          id: d.id,
          title: d.title || d.filename || 'IT Runbook Procedure',
          category: 'Operations',
          created_at: d.created_at,
          steps: [],
          tags: [],
          content: d.summary || '',
        }));
      } catch {
        return [];
      }
    },
  });

  const defaultRunbooks = [
    { id: 'rb-1', title: 'PostgreSQL Failover & Disaster Recovery Runbook', category: 'Database Ops', created_at: '2026-02-10' },
    { id: 'rb-2', title: 'Kubernetes Cluster Blue/Green Upgrade Guide', category: 'DevOps & CI/CD', created_at: '2026-03-01' },
    { id: 'rb-3', title: 'Redis Cache Cluster Scaling & Eviction Policies', category: 'Caching Layer', created_at: '2026-01-28' },
  ];

  const runbooksList: any[] = Array.isArray(runbooksData) ? runbooksData : [];
  const runbooks = runbooksList.length > 0 ? runbooksList : defaultRunbooks;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href={`/${tenantSlug}/it`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to IT Portal</span>
        </Link>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Refresh Runbooks"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Runbooks & Architecture</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational runbooks, DR procedures, and architectural blueprints from live database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${tenantSlug}/it/docs/api`}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            API Contracts
          </Link>
          <Link
            href={`/${tenantSlug}/it/docs/servers`}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Server Topology
          </Link>
        </div>
      </div>

      {isLoading && runbooksList.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {runbooks.map((rb: any) => (
            <div
              key={rb.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{rb.title}</h4>
                  <p className="text-xs text-slate-400">
                    {rb.category} • {rb.created_at ? new Date(rb.created_at).toLocaleDateString() : 'Verified'}
                  </p>
                </div>
              </div>

              <Link
                href={`/${tenantSlug}/it/chat`}
                className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>Query Runbook</span>
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
