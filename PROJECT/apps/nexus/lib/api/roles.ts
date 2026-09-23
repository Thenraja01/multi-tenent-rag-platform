import { apiClient } from "./client";

export interface RoleItem {
  id: string;
  name: string;
  slug: string;
  scope?: string;
  description?: string;
  is_system_role?: boolean;
  status?: string;
  tenant_id?: string;
  domain_id?: string;
}

export const rolesApi = {
  listRoles: async (tenantId?: string, domainId?: string): Promise<RoleItem[]> => {
    const params: Record<string, string> = {};
    if (tenantId) params.tenant_id = tenantId;
    if (domainId) params.domain_id = domainId;
    const res = await apiClient.get<RoleItem[]>("/api/superadmin/roles", { params });
    return res.data;
  },

  createRole: async (data: {
    name: string;
    slug: string;
    scope: string;
    description?: string;
    tenant_id?: string;
    domain_id?: string;
    permission_ids?: string[];
  }): Promise<RoleItem> => {
    const res = await apiClient.post<RoleItem>("/api/superadmin/roles", data);
    return res.data;
  },
};
