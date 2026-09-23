import { apiClient } from "./client";
import { TenantMembership, DomainMembership } from "@/types/permission";

export const membershipsApi = {
  listTenantMemberships: async (tenantId: string): Promise<TenantMembership[]> => {
    const res = await apiClient.get<TenantMembership[]>(`/api/v1/memberships/tenants/${tenantId}`);
    return res.data;
  },

  assignTenantMembership: async (tenantId: string, data: { user_id: string; role_id: string; status?: string }): Promise<any> => {
    const res = await apiClient.post(`/api/v1/memberships/tenants/${tenantId}`, data);
    return res.data;
  },

  listDomainMemberships: async (domainId: string): Promise<DomainMembership[]> => {
    const res = await apiClient.get<DomainMembership[]>(`/api/v1/memberships/domains/${domainId}`);
    return res.data;
  },

  assignDomainMembership: async (domainId: string, data: { user_id: string; tenant_id?: string; role_id: string; status?: string }): Promise<any> => {
    const res = await apiClient.post(`/api/v1/memberships/domains/${domainId}`, data);
    return res.data;
  },
};
