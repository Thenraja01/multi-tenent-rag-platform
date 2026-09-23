'use client';

import React from 'react';
import { Network, Database, Bot, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function OrgAdminIntegrationsPage() {
  const integrations = [
    { name: 'PostgreSQL pgvector', category: 'Vector Store', status: 'Connected', desc: '1536-dim HNSW Cosine vector indexing' },
    { name: 'Ollama Local LLM', category: 'Inference Provider', status: 'Connected', desc: 'Self-hosted private LLM inference engine' },
    { name: 'OpenAI API Gateway', category: 'Inference Provider', status: 'Ready', desc: 'GPT-4o and text-embedding-3-small' },
    { name: 'MinIO Object Vault', category: 'Storage', status: 'Connected', desc: 'Encrypted multi-tenant document repository' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Active Integrations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Connected vector databases, storage vaults, and LLM inference gateways
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((item) => (
          <Card key={item.name} className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-xl flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400">{item.category}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{item.status}</span>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
