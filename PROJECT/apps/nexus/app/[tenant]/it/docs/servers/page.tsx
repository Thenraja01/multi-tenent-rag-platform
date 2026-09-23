'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Server, ArrowLeft, Shield, Cpu, Database } from 'lucide-react';

export default function ItServersPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';

  const clusters = [
    { name: 'K8s Primary Ingestion Cluster', region: 'us-east-1', nodes: '6x c6i.2xlarge', status: 'Healthy' },
    { name: 'PostgreSQL Vector Primary (Aurora)', region: 'us-east-1', nodes: 'db.r6g.4xlarge', status: 'Healthy' },
    { name: 'Redis Cache Semantic Index', region: 'us-east-1', nodes: 'cache.r6g.xlarge', status: 'Healthy' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href={`/${tenantSlug}/it/docs`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to System Docs</span>
      </Link>

      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Infrastructure & Server Topology</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Cluster architecture, database instances, and network topology maps
        </p>
      </div>

      <div className="space-y-4">
        {clusters.map((c, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{c.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{c.region} • {c.nodes}</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
