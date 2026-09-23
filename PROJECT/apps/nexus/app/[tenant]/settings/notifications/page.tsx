'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Mail, ShieldAlert, Save } from 'lucide-react';

export default function TenantNotificationSettingsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href={`/${tenantSlug}/settings`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Settings</span>
      </Link>

      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Notification & Alert Preferences</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure real-time alerts for document ingestion failures and compliance anomalies
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <p className="font-semibold text-white">Document Ingestion Alerts</p>
            <p className="text-slate-400">Receive email notification when batch PDF extraction completes or fails</p>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <p className="font-semibold text-white">Quota & Token Threshold Alerts</p>
            <p className="text-slate-400">Notify admin when monthly token usage hits 80% and 95%</p>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <p className="font-semibold text-white">Security & Role Changes</p>
            <p className="text-slate-400">Alert security team upon unexpected RBAC privilege escalations</p>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
        </div>
      </div>
    </div>
  );
}
