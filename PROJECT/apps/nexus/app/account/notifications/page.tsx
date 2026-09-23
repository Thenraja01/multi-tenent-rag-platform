'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, CheckCircle2, FileText, Bot } from 'lucide-react';

export default function AccountNotificationsPage() {
  const notifications = [
    { title: 'Document Ingestion Complete', desc: 'HR_Policy_2026.pdf has been chunked and vector indexed.', time: '2 hours ago', icon: FileText },
    { title: 'New Domain Role Assigned', desc: 'You have been granted hr-manager privileges.', time: '1 day ago', icon: Bell },
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
        <p className="text-xs text-slate-400 mt-1">
          Recent workspace updates and document processing events
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((n, idx) => {
          const Icon = n.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-400">{n.desc}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">{n.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
