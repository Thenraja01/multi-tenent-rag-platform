import { apiClient } from "./client";
import { Tenant } from "@/types/tenant";

export const tenantsApi = {
  getAll: async (): Promise<Tenant[]> => {
    try {
      const res = await apiClient.get("/api/superadmin/tenants");
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.items)) return res.data.items;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    } catch {
      return [];
    }
  },
  getById: async (id: string): Promise<Tenant> => {
    const res = await apiClient.get(`/api/superadmin/tenants/${id}`);
    return res.data;
  },
  getRequests: async (status?: string) => {
    try {
      const res = await apiClient.get(`/superadmin/organization-requests${status ? `?status=${status}` : ""}`);
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.items)) return res.data.items;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    } catch {
      return [];
    }
  },
  getRequestById: async (id: string) => {
    const res = await apiClient.get(`/superadmin/organization-requests/${id}`);
    return res.data;
  },
  approveRequest: async (id: string, payload: { custom_subdomain?: string; approved_domain_ids?: string[] }) => {
    const res = await apiClient.post(`/superadmin/organization-requests/${id}/approve`, payload);
    return res.data;
  },
  rejectRequest: async (id: string, reason: string) => {
    const res = await apiClient.post(`/superadmin/organization-requests/${id}/reject`, { reason });
    return res.data;
  },
};
