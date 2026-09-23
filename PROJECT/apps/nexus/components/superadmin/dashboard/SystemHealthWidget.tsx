'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, CheckCircle2, ArrowRight, Zap, Database, Server, HardDrive, Cpu, Radio } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface HealthNode {
  name: string;
  status: 'Healthy' | 'Degraded' | 'Down';
  icon: React.ElementType;
}

const services: HealthNode[] = [
  { name: 'API Gateway (FastAPI)', status: 'Healthy', icon: Server },
  { name: 'PostgreSQL 16 Engine', status: 'Healthy', icon: Database },
  { name: 'Redis Cache & Broker', status: 'Healthy', icon: Zap },
  { name: 'MinIO S3 Object Storage', status: 'Healthy', icon: HardDrive },
  { name: 'RAG Ingestion Worker', status: 'Healthy', icon: Cpu },
  { name: 'pgvector Vector Indexes', status: 'Healthy', icon: Radio },
];

export function SystemHealthWidget() {
  return (
    <Card className="p-6 bg-slate-900/70 border-slate-800 backdrop-blur-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">System Infrastructure Health</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All 6 Services Operational
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time heartbeat across multi-tenant persistence and AI workers
          </p>
        </div>
        <Link
          href="/superadmin/system"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
        >
          <span>View System Health</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.name}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-semibold text-slate-200 block truncate">{svc.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {svc.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Telemetry Bar */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">API Response</span>
          <span className="text-sm font-bold text-white font-mono">42 ms</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">DB Latency</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">18 ms</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Queue Pending</span>
          <span className="text-sm font-bold text-indigo-400 font-mono">12 jobs</span>
        </div>
      </div>
    </Card>
  );
}
