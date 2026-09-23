'use client';

import React from 'react';
import { HardDrive, BookOpen, Bot, Workflow, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function PlatformUsageCard() {
  const usageItems = [
    {
      title: 'Documents Ingested',
      value: '48,291',
      subtext: '47,903 indexed • 388 failed',
      icon: BookOpen,
      iconColor: 'text-amber-400',
    },
    {
      title: 'Platform Storage',
      value: '428 GB',
      subtext: 'Quota: 1 TB (596 GB available)',
      icon: HardDrive,
      iconColor: 'text-cyan-400',
    },
    {
      title: 'RAG Invocations',
      value: '284,921',
      subtext: '21.4% increase this month',
      icon: Bot,
      iconColor: 'text-rose-400',
    },
    {
      title: 'Background Jobs',
      value: '12,483',
      subtext: '99.8% execution success rate',
      icon: Workflow,
      iconColor: 'text-indigo-400',
    },
  ];

  const storageUsedGb = 428;
  const storageTotalGb = 1000;
  const storagePercentage = ((storageUsedGb / storageTotalGb) * 100).toFixed(1);

  return (
    <Card className="p-6 bg-slate-900/70 border-slate-800 backdrop-blur-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <span className="font-bold text-sm text-white">Platform Resource & Storage Utilization</span>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-tenant data volume, indexing workload, and compute throughput
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Monthly Quota Cycle
        </span>
      </div>

      {/* 4 Usage Mini Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {usageItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{item.title}</span>
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <div className="text-xl font-black text-white font-mono">{item.value}</div>
              <div className="text-[11px] text-slate-500 truncate font-mono">{item.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Storage Utilization Detailed Progress Bar */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">PostgreSQL Vector + MinIO S3 Object Allocation</span>
          </div>
          <div className="font-mono text-xs">
            <strong className="text-white font-bold">{storageUsedGb} GB</strong>
            <span className="text-slate-400"> / {storageTotalGb} GB ({storagePercentage}% utilized)</span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800 flex gap-0.5">
          {/* S3 Documents (310 GB) */}
          <div
            className="h-full bg-cyan-500 rounded-l-full transition-all duration-500"
            style={{ width: '31%' }}
            title="MinIO S3 Document Binaries: 310 GB"
          />
          {/* pgvector Embeddings (95 GB) */}
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: '9.5%' }}
            title="pgvector HNSW Indexes: 95 GB"
          />
          {/* Relational Database Data (23 GB) */}
          <div
            className="h-full bg-purple-500 rounded-r-full transition-all duration-500"
            style={{ width: '2.3%' }}
            title="PostgreSQL Relational DB: 23 GB"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>S3 Documents (310 GB)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>pgvector Embeddings (95 GB)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Relational DB (23 GB)</span>
            </span>
          </div>
          <span className="text-emerald-400 font-bold">572 GB Free Remaining</span>
        </div>
      </div>
    </Card>
  );
}
