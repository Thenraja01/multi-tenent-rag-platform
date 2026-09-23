'use client';

import React from 'react';
import {
  Users,
  Search,
  Download,
  MoreHorizontal,
  Plus,
  Bot,
  Filter,
} from 'lucide-react';
import { AccessScope } from '@/components/shared/DataScopeIndicator';
import {
  SummaryCardsWidget,
  AttendanceOverviewWidget,
  LeaveApprovalQueueWidget,
  DepartmentDistributionWidget,
  ActivityFeedWidget,
  DocumentsVaultWidget,
  QuickActionsWidget,
  MyHRWidget,
} from './ModuleWidgetRegistry';
import { AskNexusBox } from '@/components/ai/AskNexusBox';

interface ModuleDashboardProps {
  moduleName?: string;
  moduleSlug?: string;
  scope?: AccessScope;
  departmentName?: string;
  teamName?: string;
  onAddEmployee?: () => void;
  onUploadDoc?: () => void;
  onApplyLeave?: () => void;
}

export function ModuleDashboard({
  moduleName = 'Human Resources',
  moduleSlug = 'hr',
  scope = 'ORGANIZATION',
  departmentName = 'Human Resources',
  teamName = 'Engineering Team',
  onAddEmployee,
  onUploadDoc,
  onApplyLeave,
}: ModuleDashboardProps) {
  const isEmployee = scope === 'SELF';
  const isManager = scope === 'TEAM';
  const isDeptAdmin = scope === 'DEPARTMENT';
  const isOrgAdmin = scope === 'ORGANIZATION';

  return (
    <div className="space-y-6">
      {/* 1. Module Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-0.5">
            <Users className="w-4 h-4" />
            <span>{isEmployee ? 'My Workspace' : `${moduleName} Module`}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEmployee
              ? `My ${moduleName}`
              : isManager
              ? `${moduleName} — My Team`
              : isDeptAdmin
              ? `${moduleName} — ${departmentName}`
              : `${moduleName}`}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isEmployee
              ? `Personal attendance, leave requests, and company policy documents.`
              : isManager
              ? `Team attendance, pending leave approvals, and active projects.`
              : isDeptAdmin
              ? `Department-scoped personnel records, compliance, and resources.`
              : `Organization-wide employee records, cross-department attendance, and operations.`}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {!isEmployee && (
            <>
              <button
                className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Export Data"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export</span>
              </button>

              <button
                className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </>
          )}

          {isEmployee ? (
            <button
              onClick={onApplyLeave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Leave</span>
            </button>
          ) : (
            <button
              onClick={onAddEmployee}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Embedded Ask Nexus AI Box */}
      <AskNexusBox moduleName={moduleName} />

      {/* 3. Role-Aware Dashboard Content */}
      {isEmployee ? (
        /* Employee Self-Service Dashboard */
        <MyHRWidget onApplyLeave={onApplyLeave} />
      ) : (
        /* Administrative & Managerial Dashboard */
        <div className="space-y-6">
          {/* Row 1: Summary Cards */}
          <SummaryCardsWidget scope={scope} />

          {/* Row 2: Attendance Overview + Leave Approval Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AttendanceOverviewWidget scope={scope} />
            <LeaveApprovalQueueWidget scope={scope} />
          </div>

          {/* Row 3: Department Distribution (Org Admin) / Team Breakdown (Dept/Manager) + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isOrgAdmin ? (
              <DepartmentDistributionWidget />
            ) : (
              <DocumentsVaultWidget />
            )}
            <ActivityFeedWidget />
          </div>

          {/* Row 4: Documents Vault + Quick Actions */}
          {isOrgAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DocumentsVaultWidget />
              <QuickActionsWidget
                onAddEmployee={onAddEmployee}
                onUploadDoc={onUploadDoc}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
