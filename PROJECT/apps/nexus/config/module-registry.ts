import { ComponentType } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  FileText,
  Bot,
  Users,
  Shield,
  Network,
  Settings,
  DollarSign,
  CreditCard,
  Layers,
  LucideIcon,
  UserCheck,
  Briefcase,
  FolderGit2,
  FileCheck2,
  Lock,
  Cpu,
  Receipt,
  Building2,
  Workflow,
  HelpCircle,
} from 'lucide-react';

export type ModuleCategory =
  | 'core'
  | 'ai'
  | 'hr'
  | 'finance'
  | 'it'
  | 'legal'
  | 'admin';

export interface ModuleDefinition {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  route: string;
  required_permission: string;
  category: ModuleCategory;
  actions?: string[];
  views?: string[];
}

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  // Core Modules
  dashboard: {
    slug: 'dashboard',
    name: 'Dashboard',
    description: 'Dynamic operational overview and telemetry analytics cards',
    icon: LayoutDashboard,
    route: '/dashboard',
    required_permission: 'dashboard:view',
    category: 'core',
  },
  documents: {
    slug: 'documents',
    name: 'Documents & Knowledge',
    description: 'Enterprise document repository with zero-trust ACL controls',
    icon: FileText,
    route: '/documents',
    required_permission: 'document:view',
    category: 'core',
    actions: ['new', 'upload', 'export'],
  },
  knowledge: {
    slug: 'knowledge',
    name: 'Knowledge Base',
    description: 'Vector-indexed policy repository, chunking, and semantic search',
    icon: FileText,
    route: '/knowledge',
    required_permission: 'document:view',
    category: 'core',
  },
  nexus: {
    slug: 'nexus',
    name: 'Nexus AI Copilot',
    description: 'Universal vector intelligence assistant with verified source citations',
    icon: Bot,
    route: '/nexus',
    required_permission: 'rag:query',
    category: 'ai',
    views: ['history', 'sources', 'analytics'],
  },
  ai: {
    slug: 'ai',
    name: 'Nexus AI Copilot',
    description: 'ACL-scoped RAG search and multi-turn conversational AI',
    icon: Bot,
    route: '/ai',
    required_permission: 'rag:query',
    category: 'ai',
  },

  // HR Domain Modules
  employees: {
    slug: 'employees',
    name: 'Employee Directory',
    description: 'Personnel records, job profiles, organizational structure, and compensation',
    icon: UserCheck,
    route: '/employees',
    required_permission: 'employee:view',
    category: 'hr',
    actions: ['new', 'edit', 'export'],
  },
  attendance: {
    slug: 'attendance',
    name: 'Attendance Tracking',
    description: 'Clock-in logs, biometric records, shifts, and team attendance monitoring',
    icon: CalendarCheck,
    route: '/attendance',
    required_permission: 'attendance:view',
    category: 'hr',
    views: ['today', 'history', 'team', 'reports'],
  },
  leave: {
    slug: 'leave',
    name: 'Leave Management',
    description: 'Time off requests, team balances, pending approvals, and calendar forecasting',
    icon: CalendarDays,
    route: '/leave',
    required_permission: 'leave:view',
    category: 'hr',
    views: ['my', 'team', 'pending', 'calendar', 'reports'],
    actions: ['new'],
  },

  // Finance Domain Modules
  expenses: {
    slug: 'expenses',
    name: 'Expense Claims',
    description: 'Department expense reports, receipts, reimbursement claims, and approval queues',
    icon: CreditCard,
    route: '/expenses',
    required_permission: 'expense:view',
    category: 'finance',
    views: ['my', 'pending', 'approvals', 'reports'],
    actions: ['new'],
  },
  invoices: {
    slug: 'invoices',
    name: 'Invoices & Billing',
    description: 'Vendor billing, accounts payable, client invoices, and payment tracking',
    icon: Receipt,
    route: '/invoices',
    required_permission: 'invoice:view',
    category: 'finance',
    views: ['all', 'pending', 'paid', 'overdue'],
    actions: ['new'],
  },
  payments: {
    slug: 'payments',
    name: 'Payments & Disbursements',
    description: 'Outbound treasury disbursements, payment history, and bank reconciliation',
    icon: DollarSign,
    route: '/payments',
    required_permission: 'payment:view',
    category: 'finance',
    views: ['history', 'scheduled', 'reconciliation'],
    actions: ['new'],
  },
  reports: {
    slug: 'reports',
    name: 'Financial Reports',
    description: 'Audited financial statements, department expense rollups, and P&L summaries',
    icon: FileCheck2,
    route: '/reports',
    required_permission: 'report:view',
    category: 'finance',
    views: ['expenses', 'invoices', 'payments'],
  },

  // IT Domain Modules
  assets: {
    slug: 'assets',
    name: 'IT Asset Management',
    description: 'Hardware provisioning, software licenses, lifecycle status, and device tracking',
    icon: Cpu,
    route: '/assets',
    required_permission: 'asset:view',
    category: 'it',
    views: ['inventory', 'assignments', 'maintenance'],
    actions: ['new'],
  },
  projects: {
    slug: 'projects',
    name: 'IT Projects & Initiatives',
    description: 'Infrastructure sprints, architecture blueprints, milestone tracking, and deliverables',
    icon: FolderGit2,
    route: '/projects',
    required_permission: 'project:view',
    category: 'it',
    views: ['active', 'tasks', 'members', 'archived'],
    actions: ['new'],
  },
  tickets: {
    slug: 'tickets',
    name: 'IT Service Desk',
    description: 'Helpdesk ticketing, incident management, SLA tracking, and resolution workflows',
    icon: HelpCircle,
    route: '/tickets',
    required_permission: 'ticket:view',
    category: 'it',
    views: ['my', 'team', 'unassigned', 'closed'],
    actions: ['new'],
  },

  // Legal Domain Modules
  contracts: {
    slug: 'contracts',
    name: 'Contract Lifecycle Management',
    description: 'Master service agreements, NDAs, redlining, version control, and e-signatures',
    icon: FileCheck2,
    route: '/contracts',
    required_permission: 'contract:view',
    category: 'legal',
    views: ['active', 'pending_approval', 'expiring', 'templates'],
    actions: ['new'],
  },
  compliance: {
    slug: 'compliance',
    name: 'Compliance & Governance',
    description: 'Regulatory controls, policy audits, risk assessments, and compliance reporting',
    icon: Shield,
    route: '/compliance',
    required_permission: 'compliance:view',
    category: 'legal',
    views: ['policies', 'controls', 'assessments', 'reports'],
  },

  // Org Admin Control Modules
  users: {
    slug: 'users',
    name: 'Users & Members',
    description: 'Directory management and dynamic member provisioning',
    icon: Users,
    route: '/users',
    required_permission: 'user:view',
    category: 'admin',
  },
  roles: {
    slug: 'roles',
    name: 'Roles & Access',
    description: 'Custom tenant RBAC roles and granular permission matrix',
    icon: Shield,
    route: '/roles',
    required_permission: 'role:view',
    category: 'admin',
  },
  departments: {
    slug: 'departments',
    name: 'Departments',
    description: 'Departmental units and organizational hierarchy',
    icon: Network,
    route: '/departments',
    required_permission: 'department:view',
    category: 'admin',
  },
  domains: {
    slug: 'domains',
    name: 'Domains & SSL',
    description: 'Domain isolation and DNS hostname activations',
    icon: Layers,
    route: '/domains',
    required_permission: 'domain:view',
    category: 'admin',
  },
  settings: {
    slug: 'settings',
    name: 'Settings',
    description: 'Organization profile, branding, and security preferences',
    icon: Settings,
    route: '/settings',
    required_permission: 'settings:view',
    category: 'admin',
  },
};

export function resolveModule(slug: string): ModuleDefinition {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return (
    MODULE_REGISTRY[slug] ||
    MODULE_REGISTRY[cleanSlug] || {
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' '),
      description: 'Dynamic enterprise workspace module',
      icon: LayoutDashboard,
      route: `/${slug}`,
      required_permission: `${slug}:view`,
      category: 'core',
    }
  );
}
