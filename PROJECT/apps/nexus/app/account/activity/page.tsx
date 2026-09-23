'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, ShieldCheck } from 'lucide-react';

export default function AccountActivityPage() {
  const activities = [
    { action: 'Executed AI Query in Finance Domain', time: '10 minutes ago', ip: '192.168.1.15' },
    { action: 'Uploaded Ingestion Asset (Doc #42)', time: '2 hours ago', ip: '192.168.1.15' },
    { action: 'Logged in via Keycloak SSO', time: 'Yesterday', ip: '192.168.1.15' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100 max-w-4xl mx-auto space-y-6">
      <Link
        href="/account/profile"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Profile</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Personal Activity Log</h1>
        <p className="text-xs text-slate-400 mt-1">
          Recent actions and session history logged in the immutable audit stream
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden">
        <div className="divide-y divide-slate-800">
          {activities.map((a, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">{a.action}</p>
                  <p className="text-[10px] text-slate-500 font-mono">IP: {a.ip}</p>
                </div>
              </div>
              <span className="text-slate-400 text-[11px]">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
