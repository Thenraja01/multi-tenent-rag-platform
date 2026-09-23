export interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  href: string;
  section: 'OVERVIEW' | 'PLATFORM' | 'IDENTITY' | 'SECURITY & GOVERNANCE' | 'SYSTEM';
  permission?: string;
  exact?: boolean;
  badge?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const ADMIN_NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        href: '/superadmin/dashboard',
        section: 'OVERVIEW',
        exact: true,
        permission: 'platform.dashboard.view',
      },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      {
        key: 'organizations',
        label: 'Organizations',
        icon: 'Building2',
        href: '/superadmin/organizations',
        section: 'PLATFORM',
        permission: 'organizations.view',
      },
      {
        key: 'packs',
        label: 'Packs & Bundles',
        icon: 'Package',
        href: '/superadmin/packs',
        section: 'PLATFORM',
        permission: 'packs.view',
      },
      {
        key: 'domains',
        label: 'Domains',
        icon: 'Layers',
        href: '/superadmin/domains',
        section: 'PLATFORM',
        permission: 'domains.view',
      },
      {
        key: 'modules',
        label: 'Modules Catalog',
        icon: 'Boxes',
        href: '/superadmin/modules',
        section: 'PLATFORM',
        permission: 'modules.view',
      },
      {
        key: 'organization-requests',
        label: 'Org Requests',
        icon: 'MailCheck',
        href: '/superadmin/organization-requests',
        section: 'PLATFORM',
        permission: 'organizations.approve',
      },
    ],
  },
  {
    title: 'IDENTITY',
    items: [
      {
        key: 'users',
        label: 'Platform Users',
        icon: 'Users',
        href: '/superadmin/users',
        section: 'IDENTITY',
        permission: 'users.view',
      },
      {
        key: 'roles',
        label: 'Platform Roles',
        icon: 'ShieldCheck',
        href: '/superadmin/roles',
        section: 'IDENTITY',
        permission: 'roles.view',
      },
    ],
  },
  {
    title: 'SECURITY & GOVERNANCE',
    items: [
      {
        key: 'security',
        label: 'Platform Security & RLS',
        icon: 'Shield',
        href: '/superadmin/security',
        section: 'SECURITY & GOVERNANCE',
        permission: 'security.view',
      },
      {
        key: 'audit',
        label: 'Audit Trail',
        icon: 'ScrollText',
        href: '/superadmin/audit',
        section: 'SECURITY & GOVERNANCE',
        permission: 'audit.view',
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      {
        key: 'system-health',
        label: 'System Health',
        icon: 'Activity',
        href: '/superadmin/system',
        section: 'SYSTEM',
        permission: 'system.health.view',
      },
      {
        key: 'settings',
        label: 'Platform Settings',
        icon: 'Settings',
        href: '/superadmin/settings',
        section: 'SYSTEM',
        permission: 'system.settings.view',
      },
    ],
  },
];
