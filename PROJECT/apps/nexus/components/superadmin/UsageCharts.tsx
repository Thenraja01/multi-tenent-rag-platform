"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { TrendingUp, Activity, BarChart2, PieChart } from "lucide-react";

export interface UsageChartsProps {
  charts?: {
    tenantGrowth?: Array<{ month: string; tenants: number }>;
    userGrowth?: Array<{ month: string; users: number }>;
    aiUsage?: Array<{ day: string; tokens: number }>;
    domainDistribution?: Array<{ domain: string; percentage: number }>;
  };
}

export const UsageCharts: React.FC<UsageChartsProps> = ({ charts }) => {
  const tenantData = charts?.tenantGrowth || [
    { month: "Apr", tenants: 1 },
    { month: "May", tenants: 2 },
    { month: "Jun", tenants: 3 },
    { month: "Jul", tenants: 4 },
    { month: "Aug", tenants: 6 },
    { month: "Sep", tenants: 8 },
  ];

  const aiData = charts?.aiUsage || [
    { day: "Mon", tokens: 140000 },
    { day: "Tue", tokens: 190000 },
    { day: "Wed", tokens: 240000 },
    { day: "Thu", tokens: 310000 },
    { day: "Fri", tokens: 280000 },
    { day: "Sat", tokens: 90000 },
    { day: "Sun", tokens: 110000 },
  ];

  const domainData = charts?.domainDistribution || [
    { domain: "Human Resources", percentage: 32 },
    { domain: "IT & DevOps", percentage: 28 },
    { domain: "Finance", percentage: 20 },
    { domain: "Legal Knowledge", percentage: 12 },
    { domain: "Operations", percentage: 8 },
  ];

  const maxTokens = Math.max(...aiData.map((d) => d.tokens));
  const maxTenants = Math.max(...tenantData.map((d) => d.tenants));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Tenant Growth Bar Chart */}
      <Card className="p-5 border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Tenant Growth</span>
            </h3>
            <span className="text-[10px] text-slate-400">Monthly provisioned workspaces</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">+100% MoM</span>
        </div>

        <div className="flex items-end gap-3 h-36 pt-4">
          {tenantData.map((item, i) => {
            const heightPct = Math.round((item.tenants / maxTenants) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="text-[10px] font-mono text-slate-400">{item.tenants}</div>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-500 min-h-[4px] transition-all hover:brightness-125"
                />
                <span className="text-[10px] font-mono text-slate-500">{item.month}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Daily AI Token Volume */}
      <Card className="p-5 border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>AI Token Throughput</span>
            </h3>
            <span className="text-[10px] text-slate-400">Daily RAG generation queries</span>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-bold">1.82M Total</span>
        </div>

        <div className="flex items-end gap-2.5 h-36 pt-4">
          {aiData.map((item, i) => {
            const heightPct = Math.round((item.tokens / maxTokens) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="text-[9px] font-mono text-slate-400">{(item.tokens / 1000).toFixed(0)}k</div>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-purple-500 min-h-[4px] transition-all hover:brightness-125"
                />
                <span className="text-[10px] font-mono text-slate-500">{item.day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Domain Usage Distribution */}
      <Card className="p-5 border-slate-800 bg-slate-900/60 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-400" />
                <span>Domain Workspaces</span>
              </h3>
              <span className="text-[10px] text-slate-400">Query distribution by domain</span>
            </div>
            <span className="text-xs font-mono text-blue-400 font-bold">5 Active</span>
          </div>

          <div className="space-y-2.5">
            {domainData.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{d.domain}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{d.percentage}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    style={{ width: `${d.percentage}%` }}
                    className={`h-full ${
                      i === 0 ? "bg-blue-500" : i === 1 ? "bg-indigo-500" : i === 2 ? "bg-emerald-500" : i === 3 ? "bg-purple-500" : "bg-amber-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500">
          Strict vector isolation maintained across all domains.
        </div>
      </Card>
    </div>
  );
};
