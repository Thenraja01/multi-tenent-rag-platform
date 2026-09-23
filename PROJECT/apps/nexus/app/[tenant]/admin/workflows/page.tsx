'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  FileCheck2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminWorkflowsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { organization } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'workflows' | 'builder' | 'approvals'>('workflows');

  const workflows = [
    {
      id: 'wf-001',
      name: 'Leave Approval & HR Notification Pipeline',
      trigger: 'leave.request.submitted',
      steps: 3,
      domain: 'HR',
      status: 'Active',
      lastRun: '15 mins ago',
      runsCount: 142,
    },
    {
      id: 'wf-002',
      name: 'Expense Reimbursement Dual-Signoff (>$1,000)',
      trigger: 'expense.submitted',
      steps: 4,
      domain: 'Finance',
      status: 'Active',
      lastRun: '1 hour ago',
      runsCount: 89,
    },
    {
      id: 'wf-003',
      name: 'SOC2 Asset Provisioning & Access Revocation',
      trigger: 'user.onboarding.complete',
      steps: 5,
      domain: 'IT',
      status: 'Active',
      lastRun: 'Yesterday',
      runsCount: 34,
    },
    {
      id: 'wf-004',
      name: 'Automated NDA Redlining & Legal Risk Scan',
      trigger: 'document.uploaded[category=contract]',
      steps: 3,
      domain: 'Legal',
      status: 'Draft',
      lastRun: 'Never',
      runsCount: 0,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
            <Workflow className="w-4 h-4" />
            <span>Organization Orchestration Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Workflows & Automated Pipelines
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure multi-stage approvals, event-driven cross-department triggers, and Nexus AI automated document processing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('builder')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'workflows'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Workflows ({workflows.length})
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'builder'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          Visual Builder & Canvas
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'approvals'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          Approval Matrix Rules
        </button>
      </div>

      {/* Main List */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {wf.domain}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      wf.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {wf.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{wf.name}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>Trigger: <strong className="text-slate-300">{wf.trigger}</strong></span>
                  <span>•</span>
                  <span>{wf.steps} Stage pipeline</span>
                  <span>•</span>
                  <span>{wf.runsCount} Total runs</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition">
                  Edit Stages
                </button>
                <button className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visual Canvas View */}
      {activeTab === 'builder' && (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Workflow className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-white">Visual Workflow Canvas</h3>
            <p className="text-xs text-slate-400">
              Drag-and-drop triggers, conditional branches, role approvals, and Nexus AI reasoning nodes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-dashed border-slate-800 max-w-2xl mx-auto flex items-center justify-around text-xs text-slate-300 font-mono">
            <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-400">
              1. Event Trigger
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-400">
              2. Nexus AI Scan
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400">
              3. Dept Sign-off
            </div>
          </div>
        </div>
      )}

      {/* Approval Matrix */}
      {activeTab === 'approvals' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white">Organization Approval Delegation Matrix</h3>
          <p className="text-xs text-slate-400">
            Rules governing automatic versus required managerial escalations based on monetary and risk thresholds.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Trigger Condition</th>
                  <th className="px-4 py-3">Required Signoff</th>
                  <th className="px-4 py-3">SLA Escalation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="px-4 py-3.5 font-bold text-indigo-400">Finance</td>
                  <td className="px-4 py-3.5">Expense &gt; $1,000</td>
                  <td className="px-4 py-3.5">Department Head + CFO</td>
                  <td className="px-4 py-3.5 text-slate-400">48 hours</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-indigo-400">Legal</td>
                  <td className="px-4 py-3.5">Third-party NDA with IP clause</td>
                  <td className="px-4 py-3.5">General Counsel</td>
                  <td className="px-4 py-3.5 text-slate-400">24 hours</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-indigo-400">HR</td>
                  <td className="px-4 py-3.5">PTO &gt; 5 consecutive days</td>
                  <td className="px-4 py-3.5">Direct Line Manager</td>
                  <td className="px-4 py-3.5 text-slate-400">72 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
