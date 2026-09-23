import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  Layers,
  FileText,
  Bot,
  BarChart3,
  FileCheck2,
  Settings,
  FolderGit2,
  BookOpen,
  CalendarCheck,
  Briefcase,
  UserCheck,
  CreditCard,
  DollarSign,
  Boxes,
  Lock,
  Activity,
  Cpu,
  Sliders,
  Database,
  HelpCircle,
  Network,
  Workflow,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  permission?: string;
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const ICON_MAP: Record<string, any> = {
  dashboard: LayoutDashboard,
  default_nexus: Bot,
  nexus: Bot,
  ai: Bot,
  knowledge: BookOpen,
  documents: FileText,
  departments: Network,
  domains: Layers,
  modules: Boxes,
  features: Sliders,
  users: Users,
  roles: Shield,
  permissions: Lock,
  analytics: BarChart3,
  audit: FileCheck2,
  settings: Settings,
  projects: FolderGit2,
  attendance: CalendarCheck,
  leave: Briefcase,
  employees: UserCheck,
  recruitment: Users,
  invoices: DollarSign,
  expenses: CreditCard,
  models: Cpu,
  database: Database,
  activity: Activity,
};

export function getIcon(name?: string) {
  if (!name) return Boxes;
  const key = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return ICON_MAP[key] || Boxes;
}

export const NAV_PLATFORM = [
  { title: "Platform Architecture", href: "/architecture", description: "Multi-tenant domain-isolated RAG architecture" },
  { title: "Default Nexus", href: "/nexus", description: "Universal pure RAG knowledge assistant" },
  { title: "Enterprise Knowledge Base", href: "/knowledge", description: "Hybrid vector indexing & dynamic document chunks" },
  { title: "RBAC & Security", href: "/security", description: "Fine-grained permissions and departmental tenancy" },
];

export const NAV_SOLUTIONS = [
  { title: "Engineering & DevOps", href: "/solutions/it", description: "CI/CD specs, microservices RFCs, and API knowledge" },
  { title: "Human Resources", href: "/solutions/hr", description: "Employee handbooks, PTO policies, and benefits" },
  { title: "Information Technology", href: "/solutions/it", description: "Hardware provisioning and security compliance" },
  { title: "Finance & Operations", href: "/solutions/finance", description: "Expense policies and procurement standards" },
  { title: "Legal & Compliance", href: "/solutions/legal", description: "Contract analysis, precedents & regulatory guidance" },
  { title: "Custom Solutions", href: "/solutions/custom", description: "Bespoke departmental RAG pipelines" },
];

export const NAV_SECURITY = [
  { title: "Multi-Tenant Isolation", href: "/multi-tenancy", description: "Cryptographic organization & department partitioning" },
  { title: "Role-Based Access Control", href: "/rbac", description: "Granular resource-action authorization catalog" },
  { title: "Enterprise Security & Audit", href: "/security", description: "Immutable security logging & SOC2 compliance" },
];

export function buildSuperAdminNav(): NavSection[] {
  return [
    {
      title: 'PLATFORM GOVERNANCE',
      items: [
        { name: 'Overview', href: '/superadmin/dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Tenants & Workspaces', href: '/superadmin/tenants', icon: Building2 },
        { name: 'Signup Requests', href: '/superadmin/organization-requests', icon: Activity },
        { name: 'Subscription Plans', href: '/superadmin/packs', icon: CreditCard },
      ],
    },
    {
      title: 'PLATFORM CATALOG',
      items: [
        { name: 'Organizations', href: '/superadmin/organizations', icon: Building2 },
        { name: 'Domains', href: '/superadmin/domains', icon: Layers },
        { name: 'Packs', href: '/superadmin/packs', icon: Boxes },
        { name: 'Modules', href: '/superadmin/modules', icon: Boxes },
        { name: 'Features', href: '/superadmin/features', icon: Sliders },
        { name: 'Permissions', href: '/superadmin/roles/matrix', icon: Lock },
      ],
    },
    {
      title: 'ACCESS & SECURITY',
      items: [
        { name: 'Users', href: '/superadmin/users', icon: Users },
        { name: 'Roles & RBAC', href: '/superadmin/roles', icon: Shield },
        { name: 'AI Models', href: '/superadmin/models', icon: Cpu },
        { name: 'Analytics', href: '/superadmin/analytics', icon: BarChart3 },
        { name: 'Audit Logs', href: '/superadmin/audit', icon: FileCheck2 },
      ],
    },
  ];
}

export function buildTenantNav(
  orgSlug: string,
  enabledModules: Array<{ slug: string; name: string; icon?: string; required_permission?: string }> = [],
  permissions: string[] = [],
  isOrgAdmin: boolean = false,
  activeDomains: Array<{ slug: string; name: string; status?: string }> = []
): NavSection[] {
  const basePrefix = orgSlug ? `/${orgSlug}` : '';
  const hasWildcard = permissions.includes('*') || permissions.includes('admin.*') || isOrgAdmin;

  const can = (perm: string) => hasWildcard || permissions.includes(perm);

  // 1. Core Workspace Navigation (Standard for all workspace members)
  const workspaceItems: NavItem[] = [
    { name: 'Dashboard', href: `${basePrefix}/dashboard`, icon: LayoutDashboard, exact: true },
    { name: 'Nexus AI Copilot', href: `${basePrefix}/ai`, icon: Bot, badge: 'RAG' },
    { name: 'Documents & Knowledge', href: `${basePrefix}/documents`, icon: FileText },
  ];

  if (can('domain:view') || isOrgAdmin) {
    workspaceItems.push({ name: 'Domains & Workspaces', href: `${basePrefix}/domains`, icon: Layers });
  }

  if (can('department:view') || isOrgAdmin) {
    workspaceItems.push({ name: 'Departments', href: `${basePrefix}/departments`, icon: Network });
  }

  const nav: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: workspaceItems,
    },
  ];

  // 2. Active Business Domains (Only provisioned and active domains)
  if (activeDomains && activeDomains.length > 0) {
    const validDomains = activeDomains.filter(
      (d) => !d.status || d.status.toLowerCase() === 'active'
    );

    if (validDomains.length > 0) {
      const domainItems: NavItem[] = validDomains.map((d) => {
        let icon = Layers;
        if (d.slug === 'hr') icon = Users;
        else if (d.slug === 'finance') icon = DollarSign;
        else if (d.slug === 'it') icon = Cpu;
        else if (d.slug === 'legal') icon = Shield;
        else if (d.slug === 'operations') icon = Workflow;

        return {
          name: d.name || `${d.slug.toUpperCase()} Domain`,
          href: `${basePrefix}/${d.slug}`,
          icon,
          badge: 'ACTIVE',
        };
      });

      nav.push({
        title: 'ACTIVE DOMAINS',
        items: domainItems,
      });
    }
  }

  // 3. Dynamic Business Pack Modules
  if (enabledModules && enabledModules.length > 0) {
    const businessItems: NavItem[] = enabledModules
      .filter((m) => !['default_nexus', 'nexus', 'knowledge', 'documents', 'ai_assistant', 'dashboard', 'ai', 'users', 'roles', 'departments', 'domains', 'settings'].includes(m.slug))
      .filter((m) => !m.required_permission || can(m.required_permission))
      .map((m) => {
        let routeHref = `${basePrefix}/${m.slug}`;
        if (m.slug === 'hr_core' || m.slug === 'hr') routeHref = `${basePrefix}/hr`;
        else if (m.slug === 'hr_analytics') routeHref = `${basePrefix}/analytics`;
        else if (m.slug === 'expense_claims') routeHref = `${basePrefix}/expenses`;

        return {
          name: m.name,
          href: routeHref,
          icon: getIcon(m.icon || m.slug),
        };
      });

    if (businessItems.length > 0) {
      nav.push({
        title: 'BUSINESS MODULES',
        items: businessItems,
      });
    }
  }

  // 3. Organization Administration (Rendered strictly based on administrative permissions)
  const adminItems: NavItem[] = [];

  if (isOrgAdmin || can('admin:access')) {
    adminItems.push({ name: 'Admin Portal', href: `${basePrefix}/admin`, icon: LayoutDashboard, exact: true, badge: 'PORTAL' });
  }
  if (can('user:view') || can('user:create') || can('user:manage')) {
    adminItems.push({ name: 'Users & Members', href: `${basePrefix}/users`, icon: Users });
  }
  if (can('role:view') || can('role:create') || can('role:manage')) {
    adminItems.push({ name: 'Roles & Access', href: `${basePrefix}/roles`, icon: Shield });
  }
  if (can('module:view') || can('pack:manage') || hasWildcard) {
    adminItems.push({ name: 'Modules & Features', href: `${basePrefix}/modules`, icon: Boxes });
  }
  if (can('audit:view') || hasWildcard) {
    adminItems.push({ name: 'Audit Logs', href: `${basePrefix}/audit`, icon: FileCheck2 });
  }
  if (can('settings:view') || can('settings:update') || hasWildcard) {
    adminItems.push({ name: 'Tenant Settings', href: `${basePrefix}/settings`, icon: Settings });
  }

  if (adminItems.length > 0) {
    nav.push({
      title: 'ORGANIZATION ADMIN',
      items: adminItems,
    });
  }

  return nav;
}

export function buildOrgAdminNav(
  orgSlug: string,
  permissions: string[] = [],
  capabilities: Record<string, boolean> = {},
  modules: Array<{ slug: string; name: string }> = [],
  featureFlags: Record<string, boolean> = {}
): NavSection[] {
  // On host-based subdomain tenants (e.g. matrix.localhost:3000), use clean root-relative paths
  const basePrefix = '';
  const hasWildcard = permissions.includes('*') || permissions.includes('admin.*');
  const can = (perm: string) => hasWildcard || permissions.includes(perm);

  return [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Admin Dashboard', href: `/dashboard`, icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { name: 'Users & Members', href: `/users`, icon: Users },
        { name: 'Invitations', href: `/invitations`, icon: UserCheck },
        { name: 'Teams & Groups', href: `/teams`, icon: Building2 },
      ],
    },
    {
      title: 'ORGANIZATION',
      items: [
        { name: 'Departments', href: `/departments`, icon: Network },
        { name: 'Domains & SSL', href: `/domains`, icon: Layers },
        { name: 'Org Profile', href: `/settings/organization`, icon: Building2 },
      ],
    },
    {
      title: 'ACCESS CONTROL',
      items: [
        { name: 'Roles & RBAC', href: `/roles`, icon: Shield },
        { name: 'Permission Explorer', href: `/permissions`, icon: Lock },
        { name: 'Access Policies', href: `/access`, icon: FileCheck2 },
      ],
    },
    {
      title: 'MODULES & PLATFORM',
      items: [
        { name: 'Installed Modules', href: `/modules`, icon: Boxes },
        { name: 'Capabilities', href: `/capabilities`, icon: Sliders },
        { name: 'Feature Flags', href: `/feature-flags`, icon: Sliders },
      ],
    },
    {
      title: 'KNOWLEDGE & RAG',
      items: [
        { name: 'Document Vault', href: `/documents`, icon: FileText },
        { name: 'RAG & Vectors', href: `/knowledge`, icon: Database },
        { name: 'Default Nexus AI', href: `/nexus`, icon: Bot, badge: 'AI' },
      ],
    },
    {
      title: 'SECURITY & SETTINGS',
      items: [
        { name: 'Security & Audit', href: `/security`, icon: Shield },
        { name: 'Tenant Settings', href: `/settings`, icon: Settings },
      ],
    },
  ];
}

export interface UserAuthContext {
  is_superadmin?: boolean;
  is_org_admin?: boolean;
  permissions?: string[];
  departments?: Array<{ slug: string; name?: string; is_primary?: boolean }>;
  scopes?: {
    department_slugs?: string[];
    primary_department_slug?: string | null;
    is_org_wide?: boolean;
  };
  tenant_slug?: string;
  organization?: { slug?: string };
}

/**
 * Hardened Capability-Driven Dashboard Route Resolver:
 * Priority Evaluation:
 *   1. Platform Governance -> /superadmin
 *   2. Organization Admin Control Center -> /dashboard
 *   3. Explicit Primary Department -> /[dept]
 *   4. Exactly one accessible department -> /[dept]
 *   5. Multi-department Hub -> /workspace
 */
export function resolveDashboardRoute(
  ctx: UserAuthContext,
  detectedTenantFromHost?: string | null
): string {
  // 1. Platform Governance Superadmin
  if (ctx.is_superadmin || ctx.permissions?.includes('*')) {
    return '/superadmin';
  }

  const tenantSlug = ctx.tenant_slug || ctx.organization?.slug || detectedTenantFromHost || '';
  const basePrefix = detectedTenantFromHost ? '' : (tenantSlug ? `/${tenantSlug}` : '');

  // 2. Organization Management Capability
  const hasOrgAdminPerm =
    ctx.is_org_admin ||
    ctx.permissions?.includes('org.admin.control_center') ||
    ctx.permissions?.includes('org.admin.access');

  if (hasOrgAdminPerm) {
    return basePrefix ? `${basePrefix}/dashboard` : '/dashboard';
  }

  // 3. Explicit Primary Department
  const primaryDept = ctx.departments?.find((d) => d.is_primary);
  if (primaryDept?.slug) {
    return basePrefix ? `${basePrefix}/${primaryDept.slug}` : `/${primaryDept.slug}`;
  }

  // 4. Exactly one accessible department
  if (ctx.departments && ctx.departments.length === 1 && ctx.departments[0].slug) {
    return basePrefix ? `${basePrefix}/${ctx.departments[0].slug}` : `/${ctx.departments[0].slug}`;
  }

  // 5. Multi-Department Hub / General Employee Portal
  return basePrefix ? `${basePrefix}/workspace` : '/workspace';
}
