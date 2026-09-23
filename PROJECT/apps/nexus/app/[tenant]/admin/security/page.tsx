'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  Shield,
  Lock,
  Users,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Smartphone,
  Laptop,
  Clock,
  Filter
} from 'lucide-react';

export default function AdminSecurityPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const [activeTab, setActiveTab] = useState<'security' | 'audit' | 'sessions'>('security');

  const auditEvents = [
    { actor: 'Raja MG', action: 'department.create', target: 'legal', domain: 'LEGAL', time: '10 mins ago', ip: '192.168.1.42', status: 'ALLOW' },
    { actor: 'Sarah Chen', action: 'document.upload', target: 'Expense_2026.pdf', domain: 'FINANCE', time: '45 mins ago', ip: '192.168.1.18', status: 'ALLOW' },
    { actor: 'David Miller', action: 'leave.create', target: 'LV-1092', domain: 'HR', time: '2 hours ago', ip: '10.0.4.12', status: 'ALLOW' },
    { actor: 'Marcus Vance', action: 'document.delete', target: 'IT_Runbook.md', domain: 'IT', time: '1 day ago', ip: '192.168.1.88', status: 'DENIED' },
  ];

  const sessions = [
    { user: 'Raja MG', device: 'Chrome on Windows 11', ip: '192.168.1.42', last_active: 'Active now', current: true },
    { user: 'Sarah Chen', device: 'Safari on macOS', ip: '192.168.1.18', last_active: '12 mins ago', current: false },
    { user: 'Elena Rostova', device: 'Edge on Windows 10', ip: '10.0.12.8', last_active: '3 hours ago', current: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Center & Audit Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable security telemetry, active session management, and multi-tenant compliance logging.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'security' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'sessions' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Active Sessions</span>
        </button>
      </div>

      {/* Tab 1: Security Center */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">MFA Adoption</span>
              <div className="text-2xl font-bold text-white">84%</div>
              <div className="text-[11px] text-emerald-400 font-mono">102 / 124 enforced</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Active Sessions</span>
              <div className="text-2xl font-bold text-white">187</div>
              <div className="text-[11px] text-slate-400 font-mono">Across 6 departments</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Failed Logins (24h)</span>
              <div className="text-2xl font-bold text-emerald-400">0</div>
              <div className="text-[11px] text-slate-400 font-mono">Rate limiter active</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">PostgreSQL RLS</span>
              <div className="text-2xl font-bold text-blue-400">Enforced</div>
              <div className="text-[11px] text-slate-400 font-mono">Defense-in-depth active</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-lg space-y-4">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase font-mono">Live Immutable Audit Feed</h3>
            <span className="text-[10px] text-slate-400 font-mono">Tenant: {tenantSlug}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Resource Target</th>
                  <th className="py-2.5 px-4">Domain</th>
                  <th className="py-2.5 px-4">Decision</th>
                  <th className="py-2.5 px-4">Time & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditEvents.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-white font-sans font-semibold">{ev.actor}</td>
                    <td className="py-3 px-4 text-orange-400">{ev.action}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{ev.target}</td>
                    <td className="py-3 px-4 text-blue-400">{ev.domain}</td>
                    <td className="py-3 px-4">
                      {ev.status === 'ALLOW' ? (
                        <span className="text-emerald-400 font-bold">ALLOW</span>
                      ) : (
                        <span className="text-rose-400 font-bold">DENIED</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">
                      <div>{ev.time}</div>
                      <div className="text-[10px] font-mono text-slate-500">{ev.ip}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Sessions */}
      {activeTab === 'sessions' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Active User Sessions</h3>
              <p className="text-xs text-slate-400">View and revoke active refresh tokens and authenticated sessions</p>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-600/30">
              Revoke All Other Sessions
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map((sess, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>{sess.user}</span>
                      {sess.current && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{sess.device} &bull; <span className="font-mono">{sess.ip}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">{sess.last_active}</span>
                  {!sess.current && (
                    <button className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-medium transition-colors">
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
