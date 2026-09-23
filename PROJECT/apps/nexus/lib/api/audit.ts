import { apiClient } from "./client";

export const auditApi = {
  listAuditLogs: async (params?: { tenant_id?: string; domain_id?: string; limit?: number }): Promise<any[]> => {
    const res = await apiClient.get<any[]>("/api/v1/audit", { params });
    return res.data;
  },
};
