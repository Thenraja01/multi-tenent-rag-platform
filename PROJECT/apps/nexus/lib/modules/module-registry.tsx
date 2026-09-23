import React from 'react';
import { CalendarCheck2, FileText, Bot, Clock, FolderGit2, ShieldAlert } from 'lucide-react';

/**
 * Dynamic Module Registry
 *
 * Implements the Core Principle:
 * - Backend controls WHAT is enabled (returns module keys like 'attendance', 'leave', 'documents', 'default-nexus')
 * - Frontend developers control HOW the module looks and behaves (registers pre-built React components)
 */

export interface ModuleProps {
  tenantSlug?: string;
  domainSlug?: string;
  config?: Record<string, any>;
}

// 1. Documents / Knowledge Ingestion Module
export const DocumentsModule: React.FC<ModuleProps> = ({ domainSlug }) => (
  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
        <FileText className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Domain Knowledge Documents</h3>
        <p className="text-xs text-slate-400">Manage uploaded policy PDFs, handbooks, and knowledge vectors for {domainSlug || 'active'} domain.</p>
      </div>
    </div>
  </div>
);

// 2. Default Nexus RAG QA Module
export const NexusRAGModule: React.FC<ModuleProps> = ({ domainSlug }) => (
  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
        <Bot className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Nexus RAG Assistant</h3>
        <p className="text-xs text-slate-400">Domain-isolated AI reasoning with source-grounded citations.</p>
      </div>
    </div>
  </div>
);

// 3. Attendance Application Module
export const AttendanceModule: React.FC<ModuleProps> = ({ domainSlug }) => (
  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
        <Clock className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Employee Attendance & Timesheets</h3>
        <p className="text-xs text-slate-400">Track check-ins, departmental shifts, and overtime analytics.</p>
      </div>
    </div>
  </div>
);

// 4. Leave & Time-Off Module
export const LeaveModule: React.FC<ModuleProps> = ({ domainSlug }) => (
  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
        <CalendarCheck2 className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Leave & Paid Time Off</h3>
        <p className="text-xs text-slate-400">Submit requests, track vacation allowances, and approve teammate leave.</p>
      </div>
    </div>
  </div>
);

// 5. Projects & Engineering Module
export const ProjectsModule: React.FC<ModuleProps> = ({ domainSlug }) => (
  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
        <FolderGit2 className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">Engineering Sprints & Milestones</h3>
        <p className="text-xs text-slate-400">Collaborative technical roadmaps and architectural documentation.</p>
      </div>
    </div>
  </div>
);

/**
 * Module Registry Mapping
 */
export const moduleRegistry: Record<string, React.FC<ModuleProps>> = {
  'attendance': AttendanceModule,
  'leave': LeaveModule,
  'documents': DocumentsModule,
  'default-nexus': NexusRAGModule,
  'projects': ProjectsModule,
  'knowledge': DocumentsModule,
};

/**
 * Helper to render a registered module dynamically
 */
export function renderModule(moduleKey: string, props: ModuleProps = {}) {
  const Component = moduleRegistry[moduleKey];
  if (!Component) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/20 flex items-center gap-3 text-amber-300">
        <ShieldAlert className="w-5 h-5" />
        <span className="text-xs font-mono">Module '{moduleKey}' is enabled in backend but no frontend component was registered.</span>
      </div>
    );
  }
  return <Component {...props} />;
}
