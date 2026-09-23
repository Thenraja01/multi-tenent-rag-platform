'use client';

import React from 'react';
import Link from 'next/link';
import { Boxes, ArrowLeft, Shield } from 'lucide-react';

export default function ModuleDisabledPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 shadow-2xl">
        <Boxes className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 mb-3">
        Module Inactive
      </span>

      <h1 className="text-3xl font-black text-white tracking-tight mb-3">
        Module Not Enabled
      </h1>

      <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        This module is currently disabled for your organization. Please request your organization administrator or superadmin to enable it from the Platform Catalog.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
