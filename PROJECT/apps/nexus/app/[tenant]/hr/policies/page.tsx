'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

export default function HrPoliciesPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';

  const policies = [
    { id: 'pol-1', title: 'Workplace Conduct & Anti-Harassment Policy', pages: 8, updated: '2026-01-10' },
    { id: 'pol-2', title: 'Remote & Hybrid Work Eligibility Standards', pages: 5, updated: '2026-02-14' },
    { id: 'pol-3', title: 'Equal Opportunity & Diversity Framework', pages: 12, updated: '2026-01-20' },
    { id: 'pol-4', title: 'Health, Safety & Ergonomic Standards', pages: 6, updated: '2026-03-01' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href={`/${tenantSlug}/hr`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to HR Portal</span>
      </Link>

      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">HR Policies Repository</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Official compliance and organizational guidelines vector-indexed for AI reasoning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-[11px] font-mono">ID: {p.id}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
              <p className="text-xs text-slate-400">
                {p.pages} Pages • Last revised: {p.updated}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <Link
                href={`/${tenantSlug}/hr/policies/${p.id}`}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1"
              >
                <span>Read & Query AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
