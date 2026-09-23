'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export interface DynamicModuleItem {
  id?: string;
  slug: string;
  name: string;
  icon?: string;
  category?: string;
  route?: string;
  href?: string;
  required_permission?: string;
  enabled: boolean;
}

export interface WorkspaceDomain {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  status: string;
  userCount?: number;
  docCount?: number;
  moduleCount?: number;
  modules?: Array<{
    id?: string;
    key?: string;
    slug?: string;
    name: string;
    enabled: boolean;
  }>;
  departments?: Array<{ id: string; name: string; slug: string }>;
}

export interface WorkspacePack {
  id: string;
  name: string;
  slug: string;
}

export interface WorkspaceContextType {
  organization: {
    id: string | null;
    name: string;
    slug: string;
    subdomain: string;
    status: string;
    branding?: Record<string, any>;
    settings?: Record<string, any>;
  } | null;
  department: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;
  domains: WorkspaceDomain[];
  activeDomains?: WorkspaceDomain[];
  packs: WorkspacePack[];
  modules: DynamicModuleItem[];
  enabledModules: DynamicModuleItem[];
  activeDomain: WorkspaceDomain | null;
  setActiveDomainSlug: (slug: string) => void;
  user: {
    id: string;
    email: string;
    full_name?: string;
    is_superadmin: boolean;
    is_org_admin?: boolean;
    role?: string;
    department?: {
      id: string;
      name: string;
      slug?: string;
    } | null;
  } | null;
  roles: Array<{ id: string; name: string; slug: string } | string>;
  permissions: string[];
  data_scopes: Record<string, string>;
  plan: {
    id?: string;
    name: string;
    slug: string;
    limits?: Record<string, any>;
  } | null;
  isOrgAdmin: boolean;
  isLoading: boolean;
  error: any;
  refetch: () => void;
  refreshWorkspace?: () => void;
  can: (permissionKey: string) => boolean;
  hasModule: (moduleSlug: string) => boolean;
  hasDomain: (domainSlug: string) => boolean;
  getDataScope: (resource: string) => string;
  quotas?: any;
  health?: any;
  capabilities?: any;
  featureFlags?: any;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  organization: null,
  department: null,
  domains: [],
  activeDomains: [],
  packs: [],
  modules: [],
  enabledModules: [],
  activeDomain: null,
  setActiveDomainSlug: () => {},
  user: null,
  roles: [],
  permissions: [],
  data_scopes: {},
  plan: null,
  isOrgAdmin: false,
  isLoading: true,
  error: null,
  refetch: () => {},
  refreshWorkspace: () => {},
  can: () => false,
  hasModule: () => false,
  hasDomain: () => false,
  getDataScope: () => 'SELF',
  quotas: {},
  health: { status: 'HEALTHY' },
  capabilities: {},
  featureFlags: {},
});

function parseHostContext() {
  if (typeof window === 'undefined') return { tenantSlug: null, domainSlug: null };
  const hostname = window.location.hostname.toLowerCase();
  const clean = hostname.split(':')[0];
  const parts = clean.split('.');

  // Localhost matching
  if (parts.length === 2 && parts[1] === 'localhost') {
    if (!['www', 'admin', 'platform', 'superadmin', 'localhost'].includes(parts[0])) {
      return { tenantSlug: parts[0], domainSlug: null };
    }
  } else if (parts.length === 3 && parts[2] === 'localhost') {
    return { tenantSlug: parts[1], domainSlug: parts[0] };
  }

  // Cloud / domain matching
  if (parts.length === 3) {
    if (!['www', 'app', 'platform', 'admin', 'superadmin', 'api'].includes(parts[0])) {
      return { tenantSlug: parts[0], domainSlug: null };
    }
  } else if (parts.length >= 4) {
    if (!['www', 'app', 'platform', 'admin', 'superadmin'].includes(parts[0])) {
      return { tenantSlug: parts[1], domainSlug: parts[0] };
    }
  }

  return { tenantSlug: null, domainSlug: null };
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuthStore();
  const [activeDomainSlug, setActiveDomainSlug] = useState<string>('hr');
  const [hostTenant, setHostTenant] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return parseHostContext().tenantSlug;
    }
    return null;
  });

  useEffect(() => {
    const { tenantSlug, domainSlug } = parseHostContext();
    if (tenantSlug && tenantSlug !== hostTenant) {
      setHostTenant(tenantSlug);
    }
    if (domainSlug) {
      setActiveDomainSlug(domainSlug);
    } else if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const possibleDomain = pathSegments[pathSegments.length > 1 ? 1 : 0];
        if (['hr', 'finance', 'it', 'legal', 'operations', 'sales', 'knowledge'].includes(possibleDomain)) {
          setActiveDomainSlug(possibleDomain);
        }
      }
    }
  }, [hostTenant]);

  // 1. Fetch public organization resolution (works unauthenticated and establishes base domains)
  const { data: publicOrg, isLoading: isPublicOrgLoading } = useQuery({
    queryKey: ['public-org-resolve', hostTenant],
    queryFn: async () => {
      if (!hostTenant || hostTenant === 'localhost' || hostTenant === 'superadmin') return null;
      try {
        const res = await apiClient.get('/organizations/resolve', {
          params: { subdomain: hostTenant },
        });
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!hostTenant && hostTenant !== 'localhost' && hostTenant !== 'superadmin',
    staleTime: 60000,
  });

  // 2. Fetch authenticated workspace context
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['workspace-context', token, hostTenant],
    queryFn: async () => {
      const res = await apiClient.get('/workspace/context', {
        params: hostTenant ? { tenant: hostTenant } : undefined,
      });
      return res.data;
    },
    enabled: !!token,
    staleTime: 30000,
  });

  // Merge domains: prefer authenticated context domains, fallback to public resolved active departments
  const domains: WorkspaceDomain[] = useMemo(() => {
    if (data?.domains && data.domains.length > 0) {
      return data.domains;
    }
    if (publicOrg?.active_departments && publicOrg.active_departments.length > 0) {
      return publicOrg.active_departments.map((d: any) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        description: `${d.name} workspace and AI knowledge store.`,
        status: d.status || 'ACTIVE',
      }));
    }
    return [];
  }, [data?.domains, publicOrg?.active_departments]);

  const organization = useMemo(() => {
    if (data?.organization) {
      return data.organization;
    }
    if (publicOrg?.tenant) {
      return {
        id: publicOrg.tenant.id,
        name: publicOrg.tenant.name,
        slug: publicOrg.tenant.slug,
        subdomain: `${publicOrg.tenant.slug}.nexusrag.app`,
        status: publicOrg.tenant.status,
      };
    }
    return null;
  }, [data?.organization, publicOrg?.tenant]);

  const packs: WorkspacePack[] = data?.packs || [];
  const modules: DynamicModuleItem[] = data?.modules || [];
  const enabledModules: DynamicModuleItem[] = modules.filter((m) => m.enabled !== false);
  const activeDomain = domains.find((d) => d.slug === activeDomainSlug) || domains[0] || null;
  const permissions: string[] = data?.permissions || [];
  const dataScopes: Record<string, string> = data?.data_scopes || {};
  const isOrgAdmin = Boolean(
    data?.user?.is_superadmin ||
    data?.user?.is_org_admin ||
    permissions.includes('*') ||
    permissions.includes('admin.*') ||
    permissions.includes('org.admin')
  );

  const combinedLoading = (!!token && isLoading) || (!token && isPublicOrgLoading && !!hostTenant);

  const can = (permissionKey: string): boolean => {
    if (!permissions || permissions.length === 0) return false;
    if (permissions.includes('*') || permissions.includes('admin.*')) return true;
    return permissions.includes(permissionKey);
  };

  const hasModule = (moduleSlug: string): boolean => {
    return enabledModules.some((m) => m.slug === moduleSlug);
  };

  const hasDomain = (domainSlug: string): boolean => {
    return domains.some((d) => d.slug === domainSlug && d.status === 'active');
  };

  const getDataScope = (resource: string): string => {
    return dataScopes[resource] || 'SELF';
  };

  const department = data?.user?.department || publicOrg?.department || (activeDomain ? { slug: activeDomain.slug, name: activeDomain.name, id: activeDomain.id } : null);

  return (
    <WorkspaceContext.Provider
      value={{
        organization,
        department,
        domains,
        activeDomains: domains,
        packs,
        modules,
        enabledModules,
        activeDomain,
        setActiveDomainSlug,
        user: data?.user || null,
        roles: data?.roles || [],
        permissions,
        data_scopes: dataScopes,
        plan: data?.plan || null,
        isOrgAdmin,
        isLoading: combinedLoading,
        error,
        refetch,
        can,
        hasModule,
        hasDomain,
        getDataScope,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
export const usePermissions = () => {
  const { permissions, can } = useWorkspace();
  return { permissions, can };
};
export const useActiveDomain = () => {
  const { activeDomain, setActiveDomainSlug, hasModule } = useWorkspace();
  return { activeDomain, setActiveDomainSlug, hasModule };
};

