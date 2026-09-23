/**
 * Centralized Permission Catalog & Descriptions
 */
export interface PermissionMeta {
  code: string;
  resource: string;
  action: string;
  name: string;
  description: string;
  category: 'core' | 'hr' | 'finance' | 'admin' | 'ai';
}

export const PERMISSION_CATALOG: Record<string, PermissionMeta> = {
  'dashboard:view': {
    code: 'dashboard:view',
    resource: 'dashboard',
    action: 'view',
    name: 'View Dashboard',
    description: 'View the organization workspace dashboard and live metrics',
    category: 'core',
  },
  'attendance:view': {
    code: 'attendance:view',
    resource: 'attendance',
    action: 'view',
    name: 'View Attendance',
    description: 'View daily attendance and shift records',
    category: 'hr',
  },
  'attendance:mark': {
    code: 'attendance:mark',
    resource: 'attendance',
    action: 'mark',
    name: 'Clock-in / Clock-out',
    description: 'Record daily attendance check-ins and check-outs',
    category: 'hr',
  },
  'attendance:manage': {
    code: 'attendance:manage',
    resource: 'attendance',
    action: 'manage',
    name: 'Manage Attendance',
    description: 'Configure shifts, geofences, and attendance policies',
    category: 'hr',
  },
  'leave:view': {
    code: 'leave:view',
    resource: 'leave',
    action: 'view',
    name: 'View Leave',
    description: 'View leave balances and time-off request history',
    category: 'hr',
  },
  'leave:create': {
    code: 'leave:create',
    resource: 'leave',
    action: 'create',
    name: 'Apply for Leave',
    description: 'Submit time-off and vacation applications',
    category: 'hr',
  },
  'leave:approve': {
    code: 'leave:approve',
    resource: 'leave',
    action: 'approve',
    name: 'Approve Leave',
    description: 'Review, approve, or reject employee leave requests',
    category: 'hr',
  },
  'document:view': {
    code: 'document:view',
    resource: 'document',
    action: 'view',
    name: 'View Documents',
    description: 'Access and view ACL-permitted organizational documents',
    category: 'core',
  },
  'document:upload': {
    code: 'document:upload',
    resource: 'document',
    action: 'upload',
    name: 'Upload Documents',
    description: 'Upload files and trigger automated RAG embedding pipelines',
    category: 'core',
  },
  'document:delete': {
    code: 'document:delete',
    resource: 'document',
    action: 'delete',
    name: 'Delete Documents',
    description: 'Remove documents from the knowledge index',
    category: 'core',
  },
  'rag:query': {
    code: 'rag:query',
    resource: 'rag',
    action: 'query',
    name: 'Nexus AI Copilot',
    description: 'Perform natural language RAG searches across authorized domain chunks',
    category: 'ai',
  },
  'user:view': {
    code: 'user:view',
    resource: 'user',
    action: 'view',
    name: 'View Users',
    description: 'View member directory and active rosters',
    category: 'admin',
  },
  'user:create': {
    code: 'user:create',
    resource: 'user',
    action: 'create',
    name: 'Create Users',
    description: 'Invite new members and provision accounts',
    category: 'admin',
  },
  'role:view': {
    code: 'role:view',
    resource: 'role',
    action: 'view',
    name: 'View Roles',
    description: 'Inspect RBAC role permissions',
    category: 'admin',
  },
  'role:create': {
    code: 'role:create',
    resource: 'role',
    action: 'create',
    name: 'Create Roles',
    description: 'Define custom tenant RBAC roles and permissions',
    category: 'admin',
  },
  'domain:view': {
    code: 'domain:view',
    resource: 'domain',
    action: 'view',
    name: 'View Domains',
    description: 'Access partitioned domain workspaces',
    category: 'admin',
  },
  'department:view': {
    code: 'department:view',
    resource: 'department',
    action: 'view',
    name: 'View Departments',
    description: 'View departmental units and hierarchy',
    category: 'admin',
  },
  'settings:view': {
    code: 'settings:view',
    resource: 'settings',
    action: 'view',
    name: 'View Settings',
    description: 'View organization branding and security configurations',
    category: 'admin',
  },
  'audit:view': {
    code: 'audit:view',
    resource: 'audit',
    action: 'view',
    name: 'View Audit Logs',
    description: 'Inspect immutable tenant authorization audit logs',
    category: 'admin',
  },
};
