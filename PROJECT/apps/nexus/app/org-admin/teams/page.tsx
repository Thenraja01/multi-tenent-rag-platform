'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Network, Search, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';

export default function OrgAdminTeamsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiClient.get('/departments');
        setDepartments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load teams/departments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teams & Functional Groups</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization teams, department groups, and member assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id || dept.slug} className="p-6 bg-slate-900/60 border-slate-800 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{dept.name}</h3>
                <span className="text-[10px] font-mono text-slate-400">slug: {dept.slug}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">{dept.description || 'Department team partition.'}</p>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Isolation</span>
              </span>
              <span className="font-mono text-indigo-400 font-semibold">{dept.slug}.org</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
