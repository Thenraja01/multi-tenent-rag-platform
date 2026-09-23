'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { getPlatformRootUrl, navigateToPlatform } from '@/lib/utils/url';

export default function Forbidden403Page() {
  const [rootHomeUrl, setRootHomeUrl] = useState<string>('/');
  const [rootLoginUrl, setRootLoginUrl] = useState<string>('/login');

  useEffect(() => {
    setRootHomeUrl(getPlatformRootUrl('/'));
    setRootLoginUrl(getPlatformRootUrl('/login'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 shadow-2xl animate-pulse">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
        403 — Access Forbidden
      </span>

      <h1 className="text-3xl font-black text-white tracking-tight mb-3">
        Unauthorized Access Level
      </h1>

      <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        You do not possess the required security privileges or role tier to access this enterprise control plane or resource.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href={rootHomeUrl}
          onClick={(e) => {
            e.preventDefault();
            navigateToPlatform('/');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </a>
        <a
          href={rootLoginUrl}
          onClick={(e) => {
            e.preventDefault();
            navigateToPlatform('/login');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          <span>Switch Account</span>
        </a>
      </div>
    </div>
  );
}
