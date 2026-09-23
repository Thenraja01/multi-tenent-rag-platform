'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  PlusCircle,
  FileCheck2,
  ToggleRight,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { superadminApi } from '@/lib/api/superadmin';

export function RecentActivityTimeline() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await superadminApi.getAuditLogs({ limit: 5 });
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load recent audit activity:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <Card className="p-6 bg-slate-900/70 border-slate-800 backdrop-blur-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Recent Activity Audit</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Live DB
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Security actions, provisioning events, and tenant state modifications
          </p>
        </div>
        <Link
          href="/superadmin/audit"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
        >
          <span>Audit Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Activity Timeline List */}
      <div className="divide-y divide-slate-800/60 py-2">
        {loading ? (
          <div className="py-6 text-center text-slate-500 font-mono text-xs">
            Loading activity stream...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-6 text-center text-slate-500 font-mono text-xs">
            No audit events recorded yet.
          </div>
        ) : (
          logs.slice(0, 5).map((item, idx) => (
            <div key={item.id || idx} className="py-3 flex items-start gap-3 hover:bg-slate-950/30 px-2 rounded-xl transition">
              {/* Icon */}
              <div className="w-7 h-7 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5" />
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    <span className="text-indigo-400 font-mono">{item.actor_name || item.actor_email || item.actor_id || 'System'}</span>
                    <span className="text-slate-400 font-normal"> · </span>
                    <span>{item.action || 'Activity Event'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString() : 'Live'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span className="text-slate-300 font-mono truncate">{item.resource_type || item.resource_id || 'System'}</span>
                  <span className="text-slate-600 font-mono">|</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 text-[10px] font-mono shrink-0">
                    {item.tenant_id || 'Global'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px]">Audit Stream Active</span>
        <Link href="/superadmin/audit" className="text-indigo-400 hover:text-indigo-300 font-semibold">
          Explore Full Security Trace →
        </Link>
      </div>
    </Card>
  );
}
