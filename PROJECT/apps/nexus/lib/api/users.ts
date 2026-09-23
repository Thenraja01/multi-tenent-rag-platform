import { apiClient } from "./client";

export interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  tenant_id?: string;
  is_active?: boolean;
  created_at?: string;
}

export const usersApi = {
  listUsers: async (tenantId?: string): Promise<UserItem[]> => {
    try {
      const params = tenantId ? { tenant_id: tenantId } : {};
      const res = await apiClient.get<any>("/api/superadmin/users", { params });
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.items)) return res.data.items;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    } catch {
      return [];
    }
  },

  getUser: async (id: string): Promise<UserItem> => {
    const res = await apiClient.get<UserItem>(`/api/superadmin/users/${id}`);
    return res.data;
  },

  createUser: async (data: {
    email: string;
    full_name: string;
    password?: string;
    tenant_id?: string;
    role?: string;
  }): Promise<UserItem> => {
    const res = await apiClient.post<UserItem>("/api/superadmin/users", data);
    return res.data;
  },
};
