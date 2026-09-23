import { apiClient } from "./client";

export interface Department {
  id: string;
  tenant_id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  status?: string;
  is_enabled?: boolean;
  is_active?: boolean;
  custom_subdomain?: string;
  subdomain?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentCreatePayload {
  name: string;
  slug: string;
  description?: string;
  status?: string;
}

export interface TenantDepartmentTogglePayload {
  department_id: string;
  is_enabled: boolean;
  custom_subdomain?: string;
  tenant_id?: string;
}

export const departmentsApi = {
  listDepartments: async (tenantId?: string): Promise<Department[]> => {
    const res = await apiClient.get<Department[]>("/api/v1/departments", {
      params: { tenant_id: tenantId },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  getDepartment: async (departmentId: string): Promise<Department> => {
    const res = await apiClient.get<Department>(`/api/v1/departments/${departmentId}`);
    return res.data;
  },

  createDepartment: async (data: DepartmentCreatePayload): Promise<Department> => {
    const res = await apiClient.post<Department>("/api/v1/departments", data);
    return res.data;
  },

  updateDepartment: async (
    departmentId: string,
    data: Partial<DepartmentCreatePayload>
  ): Promise<Department> => {
    const res = await apiClient.put<Department>(`/api/v1/departments/${departmentId}`, data);
    return res.data;
  },

  deleteDepartment: async (departmentId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/api/v1/departments/${departmentId}`);
    return res.data;
  },

  toggleTenantDepartment: async (data: TenantDepartmentTogglePayload): Promise<any> => {
    const res = await apiClient.post("/api/v1/departments/tenant/toggle", data, {
      params: { tenant_id: data.tenant_id },
    });
    return res.data;
  },
};
