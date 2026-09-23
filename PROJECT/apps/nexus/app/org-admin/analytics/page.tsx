'use client';

import React from 'react';
import { BarChart3, Bot, Search, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function OrgAdminAnalyticsPage() {
  const stats = [
    { label: 'RAG Queries Processed', value: '1,420', change: '+18%', icon: Search },
    { label: 'Grounded Citations', value: '4,890', change: '+24%', icon: Sparkles },
    { label: 'Vector Ingested Chunks', value: '18,520', change: '+8%', icon: FileText },
    { label: 'Average Retrieval Latency', value: '38ms', change: '-12%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Intelligence Metrics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time telemetry for RAG hybrid search, LLM tokens, and department knowledge queries
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">{s.label}</span>
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-xs font-semibold text-emerald-400 font-mono">{s.change}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
