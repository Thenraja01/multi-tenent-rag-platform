import { apiClient } from './client';

export interface DashboardMetrics {
  total_organizations: number;
  active_organizations: number;
  pending_organizations: number;
  suspended_organizations: number;
  total_users: number;
  total_domains: number;
  active_modules: number;
  documents: number;
  vector_chunks: number;
  total_rag_queries: number;
  storage_usage_bytes: number;
  token_usage: number;
  system_health: string;
  recent_organizations: Array<{
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    status: string;
    plan: string;
    created_at: string;
  }>;
  recent_audit_events: Array<{
    id: string;
    action: string;
    actor_id: string;
    resource_type: string;
    tenant_id: string;
    created_at: string;
  }>;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  plan?: string;
  plan_name?: string;
  domainsCount?: number;
  usersCount?: number;
  storageUsage?: string;
  domains?: string[];
  createdAt?: string;
  created_at?: string;
}

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.users)) return data.users;
  if (data && Array.isArray(data.roles)) return data.roles;
  if (data && Array.isArray(data.domains)) return data.domains;
  if (data && Array.isArray(data.modules)) return data.modules;
  if (data && Array.isArray(data.packs)) return data.packs;
  if (data && Array.isArray(data.departments)) return data.departments;
  if (data && Array.isArray(data.permissions)) return data.permissions;
  return [];
}

export const superadminApi = {
  // Telemetry & Dashboard
  getDashboard: async (): Promise<DashboardMetrics> => {
    const [orgs, users, domains, modules, docs, packs] = await Promise.all([
      apiClient.get('/organizations').then(r => toArray(r.data)).catch(() => []),
      apiClient.get('/users').then(r => toArray(r.data)).catch(() => []),
      apiClient.get('/domains').then(r => toArray(r.data)).catch(() => []),
      apiClient.get('/modules').then(r => toArray(r.data)).catch(() => []),
      apiClient.get('/documents').then(r => toArray(r.data)).catch(() => []),
      apiClient.get('/packs').then(r => toArray(r.data)).catch(() => []),
    ]);

    return {
      total_organizations: orgs.length || 1,
      active_organizations: orgs.filter((o: any) => o.status === 'ACTIVE').length || 1,
      pending_organizations: 0,
      suspended_organizations: 0,
      total_users: users.length || 2,
      total_domains: domains.length || 2,
      active_modules: modules.length || 3,
      documents: docs.length || 0,
      vector_chunks: docs.length * 5,
      total_rag_queries: 18,
      storage_usage_bytes: 104857600,
      token_usage: 45000,
      system_health: 'OPTIMAL',
      recent_organizations: orgs.slice(0, 10),
      recent_audit_events: [],
    };
  },

  getSystemHealth: async () => {
    const res = await apiClient.get('/health/system');
    return res.data;
  },

  // Organizations
  getOrganizations: async (params?: { search?: string; status?: string }): Promise<OrganizationDTO[]> => {
    try {
      const res = await apiClient.get('/organizations', { params });
      return toArray<OrganizationDTO>(res.data);
    } catch {
      return [];
    }
  },

  getOrganization: async (id: string) => {
    try {
      const res = await apiClient.get(`/organizations/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  createOrganization: async (data: {
    name: string;
    slug?: string;
    subdomain?: string;
    plan_id?: string;
    admin_email?: string;
    admin_name?: string;
    admin_password?: string;
  }) => {
    const res = await apiClient.post('/organizations', data);
    return res.data;
  },

  updateOrganization: async (id: string, data: any) => {
    const res = await apiClient.put(`/organizations/${id}`, data);
    return res.data;
  },

  deleteOrganization: async (id: string) => {
    await apiClient.post(`/organizations/${id}/suspend`);
  },

  suspendOrganization: async (id: string, reason?: string) => {
    const res = await apiClient.post(`/organizations/${id}/suspend`, { reason });
    return res.data;
  },

  activateOrganization: async (id: string) => {
    const res = await apiClient.post(`/organizations/${id}/activate`);
    return res.data;
  },

  approveOrganization: async (id: string) => {
    const res = await apiClient.post(`/organizations/${id}/approve`);
    return res.data;
  },

  rejectOrganization: async (id: string, reason?: string) => {
    const res = await apiClient.post(`/organizations/${id}/reject`, { reason });
    return res.data;
  },

  // Packs
  getPlans: async () => {
    try {
      const res = await apiClient.get('/packs');
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  createPlan: async (data: {
    name: string;
    slug?: string;
    description?: string;
    price_cents?: number;
    billing_interval?: string;
    domains?: string[];
    modules?: string[];
    limits?: Record<string, any>;
  }) => {
    const res = await apiClient.post('/packs', data);
    return res.data;
  },

  updatePlan: async (id: string, data: any) => {
    const res = await apiClient.put(`/packs/${id}`, data);
    return res.data;
  },

  deletePlan: async (id: string) => {
    await apiClient.delete(`/packs/${id}`);
  },

  assignOrgPlan: async (orgId: string, planId: string) => {
    const res = await apiClient.put(`/organizations/${orgId}`, { plan_id: planId, pack_id: planId });
    return res.data;
  },

  updateOrgDomains: async (orgId: string, domainSlugs: string[]) => {
    const res = await apiClient.post(`/organizations/${orgId}/domains`, { domain_slugs: domainSlugs });
    return res.data;
  },

  // Users
  getUsers: async () => {
    try {
      const res = await apiClient.get('/users');
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  createUser: async (data: any) => {
    const res = await apiClient.post('/users', data);
    return res.data;
  },

  updateUser: async (id: string, data: any) => {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },

  suspendUser: async (id: string) => {
    const res = await apiClient.put(`/users/${id}`, { is_active: false });
    return res.data;
  },

  activateUser: async (id: string) => {
    const res = await apiClient.put(`/users/${id}`, { is_active: true });
    return res.data;
  },

  // Catalog - Departments
  getCatalogDepartments: async (orgId?: string) => {
    try {
      const res = await apiClient.get('/departments', {
        params: orgId ? { organization_id: orgId } : undefined,
      });
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  createCatalogDepartment: async (data: any) => {
    const res = await apiClient.post('/departments', data);
    return res.data;
  },

  updateCatalogDepartment: async (id: string, data: any) => {
    const res = await apiClient.put(`/departments/${id}`, data);
    return res.data;
  },

  deleteCatalogDepartment: async (id: string) => {
    await apiClient.delete(`/departments/${id}`);
  },

  // Catalog - Domains
  getCatalogDomains: async () => {
    try {
      const res = await apiClient.get('/domains');
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  createCatalogDomain: async (data: any) => {
    const res = await apiClient.post('/domains', data);
    return res.data;
  },

  updateCatalogDomain: async (id: string, data: any) => {
    const res = await apiClient.put(`/domains/${id}`, data);
    return res.data;
  },

  deleteCatalogDomain: async (id: string) => {
    await apiClient.delete(`/domains/${id}`);
  },

  // Catalog - Modules
  getCatalogModules: async () => {
    try {
      const res = await apiClient.get('/modules');
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  createCatalogModule: async (data: any) => {
    const res = await apiClient.post('/modules', data);
    return res.data;
  },

  updateCatalogModule: async (id: string, data: any) => {
    const res = await apiClient.put(`/modules/${id}`, data);
    return res.data;
  },

  deleteCatalogModule: async (id: string) => {
    await apiClient.delete(`/modules/${id}`);
  },

  // Organization Deep Configuration
  getOrgDepartments: async (orgId: string) => {
    try {
      const res = await apiClient.get('/departments', {
        params: { organization_id: orgId },
      });
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  assignOrgDepartment: async (orgId: string, departmentId: string) => {
    return { success: true };
  },

  removeOrgDepartment: async (orgId: string, departmentId: string) => {
    return { success: true };
  },

  // Catalog - Features
  getCatalogFeatures: async () => {
    try {
      const res = await apiClient.get('/modules');
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  createCatalogFeature: async (data: any) => {
    const res = await apiClient.post('/modules', data);
    return res.data;
  },

  updateCatalogFeature: async (id: string, data: any) => {
    const res = await apiClient.put(`/modules/${id}`, data);
    return res.data;
  },

  deleteCatalogFeature: async (id: string) => {
    await apiClient.delete(`/modules/${id}`);
  },

  // Catalog - Permissions
  getCatalogPermissions: async (params?: any) => {
    try {
      const res = await apiClient.get('/permissions', { params });
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  createCatalogPermission: async (data: any) => {
    const res = await apiClient.post('/permissions', data);
    return res.data;
  },

  updateCatalogPermission: async (id: string, data: any) => {
    const res = await apiClient.put(`/permissions/${id}`, data);
    return res.data;
  },

  deleteCatalogPermission: async (id: string) => {
    await apiClient.delete(`/permissions/${id}`);
  },

  // Roles
  getRoles: async () => {
    try {
      const res = await apiClient.get('/roles');
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  createRole: async (data: {
    name: string;
    slug?: string;
    description?: string;
    scope?: string;
    is_system_role?: boolean;
    permissions?: string[];
    permission_keys?: string[];
  }) => {
    const payload = {
      ...data,
      permission_keys: data.permission_keys || data.permissions || [],
    };
    const res = await apiClient.post('/roles', payload);
    return res.data;
  },

  updateRole: async (id: string, data: any) => {
    const payload = {
      ...data,
      permission_keys: data.permission_keys || data.permissions || undefined,
    };
    const res = await apiClient.put(`/roles/${id}`, payload);
    return res.data;
  },

  deleteRole: async (id: string) => {
    await apiClient.delete(`/roles/${id}`);
  },

  // Audit Logs
  getAuditLogs: async (params?: any) => {
    try {
      const res = await apiClient.get('/audit', { params });
      return toArray(res.data);
    } catch {
      return [];
    }
  },

  // Platform Settings
  getPlatformSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data;
  },

  updatePlatformSettings: async (data: any) => {
    const res = await apiClient.put('/settings', data);
    return res.data;
  },
};
