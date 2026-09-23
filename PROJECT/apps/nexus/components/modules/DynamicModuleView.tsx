'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { resolveModule } from '@/config/module-registry';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import { useDocuments } from '@/hooks/use-documents';
import {
  Boxes,
  FileText,
  Bot,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export function DynamicModuleView({ moduleSlug }: { moduleSlug: string }) {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || '';
  const { user, organization, getDataScope } = useWorkspace();
  const moduleDef = resolveModule(moduleSlug);
  const Icon = moduleDef.icon;
  const dataScope = getDataScope(moduleSlug);

  const { documents = [], isLoading } = useDocuments();

  return (
    <ModuleGuard moduleSlug={moduleSlug}>
      <PermissionGuard permission={moduleDef.required_permission || 'dashboard:view'}>
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Module Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl relative overflow-hidden">
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono uppercase tracking-wider">
                  {moduleDef.category} Module
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {moduleDef.name} Workspace
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">
                {moduleDef.description}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-1.5 z-10 text-xs text-slate-400 min-w-[200px]">
              <div className="flex items-center justify-between">
                <span>Data Scope:</span>
                <strong className="text-blue-400 font-mono font-bold uppercase">{dataScope}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Check:</span>
                <span className="text-slate-300 font-mono text-[11px]">{moduleDef.required_permission}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tenant:</span>
                <span className="text-slate-200">{organization?.name || tenantSlug}</span>
              </div>
            </div>
          </div>

          {/* Module Grid Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Knowledge & Intelligence */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Module AI Copilot</h3>
                  <p className="text-xs text-slate-400">Ask domain questions scoped strictly to {moduleDef.name} policies.</p>
                </div>
              </div>
              <Link
                href={`/${tenantSlug}/ai?q=${encodeURIComponent(`What are the policies and guidelines for ${moduleDef.name}?`)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-500/20"
              >
                <span>Consult AI Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Document Repositories */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Knowledge Assets</h3>
                  <p className="text-xs text-slate-400">Zero-trust document indexing and verified access levels.</p>
                </div>
              </div>
              <Link
                href={`/${tenantSlug}/documents`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <span>Browse Documents</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </ModuleGuard>
  );
}
