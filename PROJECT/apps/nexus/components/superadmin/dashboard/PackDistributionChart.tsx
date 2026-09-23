'use client';

import React from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface DepartmentUsageItem {
  name: string;
  slug: string;
  count: number;
  color: string;
  bgTrack: string;
  badge: string;
}

const departmentUsageData: DepartmentUsageItem[] = [
  { name: 'Human Resources (HR)', slug: 'hr', count: 48, color: 'bg-indigo-500', bgTrack: 'bg-indigo-500/20', badge: 'Active' },
  { name: 'Information Technology (IT)', slug: 'it', count: 42, color: 'bg-emerald-500', bgTrack: 'bg-emerald-500/20', badge: 'Active' },
  { name: 'Finance & Accounting', slug: 'finance', count: 36, color: 'bg-purple-500', bgTrack: 'bg-purple-500/20', badge: 'Active' },
  { name: 'Legal & Compliance', slug: 'legal', count: 18, color: 'bg-amber-500', bgTrack: 'bg-amber-500/20', badge: 'Bespoke' },
  { name: 'Operations & Mesh', slug: 'operations', count: 14, color: 'bg-cyan-500', bgTrack: 'bg-cyan-500/20', badge: 'Bespoke' },
];

export function PackDistributionChart() {
  const total = departmentUsageData.reduce((acc, p) => acc + p.count, 0);

  return (
    <Card className="p-6 bg-slate-900/70 border-slate-800 backdrop-blur-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Department Adoption</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Core Departments
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution of active department subdomains across tenants
          </p>
        </div>
        <Link
          href="/superadmin/domains"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
        >
          <span>Departments</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-3.5 py-4">
        {departmentUsageData.map((item) => {
          const percentage = ((item.count / total) * 100).toFixed(1);
          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="font-medium text-slate-200">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{item.count} tenants</span>
                  <span className="font-mono text-slate-400">{percentage}%</span>
                </div>
              </div>
              <div className={`h-1.5 w-full rounded-full ${item.bgTrack} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
