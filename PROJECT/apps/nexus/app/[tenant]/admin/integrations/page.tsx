'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  FolderGit2,
  Lock,
  Activity,
  Shield,
  PlusCircle,
  CheckCircle2,
  Copy,
  Trash2,
  Key
} from 'lucide-react';

export default function AdminIntegrationsPage() {
  const params = useParams();
  const { organization } = useWorkspace();
  const orgSlug = organization?.slug || (params?.tenant as string) || 'org';
  const [activeTab, setActiveTab] = useState<'webhooks' | 'apikeys' | 'serviceaccounts'>('apikeys');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const apiKeys = [
    { name: 'ERP Ingestion Connector', prefix: 'nx_live_9a8f...', scopes: ['document:upload', 'document:view'], created: '2026-08-12', status: 'ACTIVE' },
    { name: 'CI/CD Runbook Sync', prefix: 'nx_live_3c2d...', scopes: ['rag:query', 'it:read'], created: '2026-09-02', status: 'ACTIVE' },
  ];

  const webhooks = [
    { endpoint: `https://api.${orgSlug}.com/webhooks/nexus-events`, events: ['leave.approved', 'document.published'], status: 'ACTIVE', lastDelivery: '10 mins ago', failures: 0 },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Integrations, Webhooks & API Keys</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage programmatic API access tokens, signed event webhooks, and machine service accounts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('apikeys')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'apikeys' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>API Keys</span>
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'webhooks' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Webhooks</span>
        </button>
        <button
          onClick={() => setActiveTab('serviceaccounts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'serviceaccounts' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Service Accounts</span>
        </button>
      </div>

      {/* Tab 1: API Keys */}
      {activeTab === 'apikeys' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Scoped tokens for programmatic API access</p>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium">
              <PlusCircle className="w-4 h-4" />
              <span>+ Generate API Key</span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Key Name</th>
                    <th className="py-2.5 px-4">Key Prefix</th>
                    <th className="py-2.5 px-4">Permissions & Scopes</th>
                    <th className="py-2.5 px-4">Created</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {apiKeys.map((k, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-white">{k.name}</td>
                      <td className="py-3 px-4 text-orange-400">{k.prefix}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {k.scopes.map((s, sIdx) => (
                            <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{k.created}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => copyToClipboard(k.prefix)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Configured Event Webhooks</h3>
            <button className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium">
              + Add Webhook Endpoint
            </button>
          </div>

          <div className="space-y-3">
            {webhooks.map((w, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-orange-400 font-bold">{w.endpoint}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {w.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Subscribed: {w.events.join(', ')}</span>
                  <span>Last delivery: {w.lastDelivery}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Service Accounts */}
      {activeTab === 'serviceaccounts' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-xs text-slate-400">
          <h3 className="text-sm font-bold text-white">Machine-to-Machine Service Accounts</h3>
          <p>Service accounts execute automated ingestion, worker syncs, and backend tasks with scoped certificates.</p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
            <div>Account: <span className="text-orange-400">svc_rag_ingestion_daemon</span></div>
            <div>Role: <span className="text-white">Document Processing Worker</span></div>
            <div>Auth: <span className="text-emerald-400">mTLS / Scoped Token</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
