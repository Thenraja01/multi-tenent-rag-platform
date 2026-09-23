'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X, ShieldAlert, FileWarning, HardDrive, ArrowRight, ShieldCheck } from 'lucide-react';

interface PlatformAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  icon: React.ElementType;
}

const initialAlerts: PlatformAlert[] = [
  {
    id: '1',
    severity: 'WARNING',
    title: '388 Failed Document Ingestion Chunks',
    description: 'Scanned OCR PDF processing timed out across 3 tenant workspaces. Retry jobs queued.',
    linkText: 'Inspect Ingestion Queue',
    linkHref: '/superadmin/knowledge',
    icon: FileWarning,
  },
  {
    id: '2',
    severity: 'WARNING',
    title: '7 Suspended Organizations Require Review',
    description: 'Tenant subscriptions overdue or manual security suspensions pending administrative action.',
    linkText: 'Review Suspensions',
    linkHref: '/superadmin/organizations',
    icon: ShieldAlert,
  },
  {
    id: '3',
    severity: 'INFO',
    title: 'Platform Storage Utilization at 42.8%',
    description: 'MinIO S3 and pgvector partitions currently use 428 GB out of 1 TB allocated quota.',
    linkText: 'Storage Management',
    linkHref: '/admin/system#storage',
    icon: HardDrive,
  },
];

export function PlatformAlertsBanner() {
  const [alerts, setAlerts] = useState<PlatformAlert[]>(initialAlerts);

  if (alerts.length === 0) {
    return null;
  }

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Platform System Alerts ({alerts.length})
          </span>
        </div>
        <button
          onClick={() => setAlerts([])}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition font-mono"
        >
          Dismiss All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          const isCrit = alert.severity === 'CRITICAL';
          const isWarn = alert.severity === 'WARNING';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition backdrop-blur-xl relative group ${
                isCrit
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  : isWarn
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isCrit
                        ? 'bg-rose-500/20 text-rose-400'
                        : isWarn
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-indigo-500/20 text-indigo-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCrit
                        ? 'bg-rose-500/20 text-rose-300'
                        : isWarn
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-md transition"
                  title="Dismiss alert"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Text */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block leading-snug">
                  {alert.title}
                </span>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {alert.description}
                </p>
              </div>

              {/* Action Link */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <Link
                  href={alert.linkHref}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                >
                  <span>{alert.linkText}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
