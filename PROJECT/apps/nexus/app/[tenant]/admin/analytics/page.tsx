'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  BarChart3,
  CreditCard,
  Activity,
  Database,
  Bot,
  Users,
  HardDrive,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { quotas, organization } = useWorkspace();

  const maxUsers = quotas?.max_users || 500;
  const usedUsers = quotas?.used_users || 12;
  const maxStorageGb = Math.round((quotas?.max_storage_bytes || 107374182400) / (1024 * 1024 * 1024));
  const usedStorageGb = Math.round((quotas?.used_storage_bytes || 14500000000) / (1024 * 1024 * 1024));
  const maxAiTokensM = ((quotas?.monthly_ai_tokens || 5000000) / 1000000).toFixed(1);
  const usedAiTokensM = ((quotas?.used_ai_tokens || 1240000) / 1000000).toFixed(2);

  const departmentUsage = [
    { name: 'Human Resources', slug: 'hr', users: 124, docs: 1240, rag: '12.4K', tokens: '820K', storage: '4.2 GB' },
    { name: 'Finance & Accounts', slug: 'finance', users: 32, docs: 480, rag: '4.1K', tokens: '310K', storage: '2.8 GB' },
    { name: 'Information Technology', slug: 'it', users: 46, docs: 820, rag: '7.8K', tokens: '540K', storage: '5.1 GB' },
    { name: 'Legal & Compliance', slug: 'legal', users: 21, docs: 328, rag: '3.2K', tokens: '180K', storage: '2.4 GB' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tenant Analytics & Resource Quotas</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor token burn rates, departmental RAG query volumes, storage utilization, and SLA compliance.
        </p>
      </div>

      {/* Top 3 Quota Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Seats */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase">Seat Capacity</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{usedUsers} / {maxUsers}</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(usedUsers / maxUsers) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">{(maxUsers - usedUsers)} seats remaining in plan</p>
        </div>

        {/* Storage */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase">MinIO Storage</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{usedStorageGb} GB / {maxStorageGb} GB</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(usedStorageGb / maxStorageGb) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">{(maxStorageGb - usedStorageGb)} GB capacity available</p>
        </div>

        {/* AI Tokens */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 uppercase">AI Token Budget</span>
            <Bot className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{usedAiTokensM}M / {maxAiTokensM}M</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${(Number(usedAiTokensM) / Number(maxAiTokensM)) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Resets on the 1st of every month</p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h2 className="text-sm font-bold text-white">Departmental Resource Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Department Domain</th>
                <th className="py-2.5 px-3">Active Users</th>
                <th className="py-2.5 px-3">Vault Documents</th>
                <th className="py-2.5 px-3">RAG Queries (30d)</th>
                <th className="py-2.5 px-3">AI Tokens</th>
                <th className="py-2.5 px-3 text-right">Storage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {departmentUsage.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 text-white font-semibold font-sans">{d.name}</td>
                  <td className="py-3 px-3 text-slate-300">{d.users}</td>
                  <td className="py-3 px-3 text-slate-300">{d.docs}</td>
                  <td className="py-3 px-3 text-blue-400">{d.rag}</td>
                  <td className="py-3 px-3 text-orange-400">{d.tokens}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{d.storage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
