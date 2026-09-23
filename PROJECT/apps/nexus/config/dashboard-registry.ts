import { ComponentType } from 'react';
import { AttendanceCard } from '@/components/dashboard/cards/AttendanceCard';
import { LeaveBalanceCard } from '@/components/dashboard/cards/LeaveBalanceCard';
import { LeaveApprovalCard } from '@/components/dashboard/cards/LeaveApprovalCard';
import { EmployeeCountCard } from '@/components/dashboard/cards/EmployeeCountCard';
import { DocumentsCard } from '@/components/dashboard/cards/DocumentsCard';
import { NexusAICard } from '@/components/dashboard/cards/NexusAICard';
import { FinanceOverviewCard } from '@/components/dashboard/cards/FinanceOverviewCard';
import { InvoiceApprovalCard } from '@/components/dashboard/cards/InvoiceApprovalCard';
import { ExpenseApprovalCard } from '@/components/dashboard/cards/ExpenseApprovalCard';
import { BudgetAlertCard } from '@/components/dashboard/cards/BudgetAlertCard';

export interface DashboardCardDefinition {
  id: string;
  required_permission: string;
  component: ComponentType<{ dataScope?: string }>;
  defaultSize?: 'small' | 'medium' | 'large';
}

export const DASHBOARD_REGISTRY: Record<string, DashboardCardDefinition> = {
  // HR Cards
  attendance_summary: {
    id: 'attendance_summary',
    required_permission: 'attendance:view',
    component: AttendanceCard,
    defaultSize: 'medium',
  },
  leave_balance: {
    id: 'leave_balance',
    required_permission: 'leave:view',
    component: LeaveBalanceCard,
    defaultSize: 'medium',
  },
  leave_approval: {
    id: 'leave_approval',
    required_permission: 'leave:approve',
    component: LeaveApprovalCard,
    defaultSize: 'large',
  },
  employee_count: {
    id: 'employee_count',
    required_permission: 'user:view',
    component: EmployeeCountCard,
    defaultSize: 'medium',
  },

  // Finance Cards
  finance_overview: {
    id: 'finance_overview',
    required_permission: 'finance:view',
    component: FinanceOverviewCard,
    defaultSize: 'large',
  },
  invoice_approval: {
    id: 'invoice_approval',
    required_permission: 'invoice:view',
    component: InvoiceApprovalCard,
    defaultSize: 'medium',
  },
  expense_approval: {
    id: 'expense_approval',
    required_permission: 'expense:view',
    component: ExpenseApprovalCard,
    defaultSize: 'medium',
  },
  budget_alerts: {
    id: 'budget_alerts',
    required_permission: 'budget:view',
    component: BudgetAlertCard,
    defaultSize: 'large',
  },

  // Universal Cards
  documents: {
    id: 'documents',
    required_permission: 'document:view',
    component: DocumentsCard,
    defaultSize: 'medium',
  },
  nexus_ai: {
    id: 'nexus_ai',
    required_permission: 'rag:query',
    component: NexusAICard,
    defaultSize: 'large',
  },
};

