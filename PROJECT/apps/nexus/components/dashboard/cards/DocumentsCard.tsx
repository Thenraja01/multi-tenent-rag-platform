'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { FileText, Upload, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';

export function DocumentsCard({ dataScope = 'DEPARTMENT' }: { dataScope?: string }) {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { can } = useWorkspace();

  const { data: rawDocs } = useQuery({
    queryKey: ['workspace-documents-card'],
    queryFn: async () => {
      const res = await apiClient.get('/documents');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const docs = Array.isArray(rawDocs) ? rawDocs : rawDocs?.items || rawDocs?.data || [];
  const recentDocs = docs.slice(0, 3);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Knowledge & Documents</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Scope: {dataScope} • ACL Enforced
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
          {docs.length} Documents
        </span>
      </div>

      {recentDocs.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No documents uploaded in this workspace yet.
        </div>
      ) : (
        <div className="space-y-2 my-2">
          {recentDocs.map((doc: any) => (
            <div
              key={doc.id}
              className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/50 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate">{doc.filename || doc.title || 'Document'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                {doc.access_level || 'ORG'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
        <Link
          href={`/${tenantSlug}/documents`}
          className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
        >
          View All Documents <ExternalLink className="w-3 h-3" />
        </Link>
        {can('document:upload') && (
          <Link
            href={`/${tenantSlug}/documents`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </Link>
        )}
      </div>
    </div>
  );
}
