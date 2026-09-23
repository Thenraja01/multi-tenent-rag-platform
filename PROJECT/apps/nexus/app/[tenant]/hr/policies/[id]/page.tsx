'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles, MessageSquare } from 'lucide-react';

export default function HrPolicyDetailPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const policyId = (params?.id as string) || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href={`/${tenantSlug}/hr/policies`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Policies</span>
      </Link>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Policy #{policyId}</h1>
              <p className="text-xs text-slate-400">Official HR Guidelines</p>
            </div>
          </div>

          <Link
            href={`/${tenantSlug}/hr/chat`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Policy Copilot</span>
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-3">
          <p className="font-semibold text-white">Summary of Terms:</p>
          <p>
            This document outlines the standard obligations, reporting structures, and disciplinary frameworks. All full-time and contractor staff are bound by these terms.
          </p>
          <p>
            Any exceptions must be logged with the Human Resources Committee and approved by the domain administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
