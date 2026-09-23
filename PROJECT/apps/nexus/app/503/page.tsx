'use client';

import React, { useState, useEffect } from 'react';
import { ServerCrash, ArrowLeft, RefreshCw } from 'lucide-react';
import { getPlatformRootUrl, navigateToPlatform } from '@/lib/utils/url';

export default function ServiceUnavailable503Page() {
  const [rootHomeUrl, setRootHomeUrl] = useState<string>('/');

  useEffect(() => {
    setRootHomeUrl(getPlatformRootUrl('/'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-2xl animate-pulse">
        <ServerCrash className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-3">
        503 — Service Temporarily Unavailable
      </span>

      <h1 className="text-3xl font-black text-white tracking-tight mb-3">
        System Under Maintenance
      </h1>

      <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        The database or platform mesh services are temporarily reconnecting. Please retry in a few moments.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Page</span>
        </button>
        <a
          href={rootHomeUrl}
          onClick={(e) => {
            e.preventDefault();
            navigateToPlatform('/');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </a>
      </div>
    </div>
  );
}
