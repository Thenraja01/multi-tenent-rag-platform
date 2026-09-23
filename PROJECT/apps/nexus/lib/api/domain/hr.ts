import { apiClient } from "../client";
import { HREmployee } from "@/types/business";

export interface HREmployeeRecord {
  id: string;
  tenant_id?: string;
  domain_id?: string;
  employee_code?: string;
  employment_status?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
  department_id?: string;
  department_name?: string;
  position?: string;
  job_title?: string;
  location?: string;
  status?: string;
  joining_date?: string;
}

export interface AttendanceRecordItem {
  id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: string;
  geofence_verified?: boolean;
  duration?: string;
}

export interface LeaveRecordItem {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: string;
  created_at?: string;
}

export const hrApi = {
  listEmployees: async (params?: { department_id?: string; status_filter?: string }): Promise<HREmployee[]> => {
    try {
      const res = await apiClient.get<any[]>("/hr/employees", { params });
      const items = res.data || [];
      return items.map((e: any) => ({
        id: e.id,
        tenant_id: e.organization_id || "default",
        domain_id: e.department_id || "hr",
        first_name: e.user_name?.split(" ")[0] || e.first_name || "Employee",
        last_name: e.user_name?.split(" ").slice(1).join(" ") || e.last_name || "Member",
        email: e.user_email || e.email || "user@nexusrag.internal",
        department: e.department_name || e.department || "HR",
        position: e.job_title || e.position || "Staff",
        status: e.employment_status || e.status || "ACTIVE",
        salary_band: e.salary_band || "Standard",
        created_at: e.joining_date || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  createEmployee: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    department?: string;
    position?: string;
    salary_band?: string;
  }): Promise<HREmployee> => {
    try {
      const res = await apiClient.post("/hr/employees", {
        job_title: data.position,
        location: "HQ",
      });
      return {
        id: res.data?.id || String(Date.now()),
        tenant_id: "default",
        domain_id: "hr",
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        department: data.department || "HR",
        position: data.position || "Staff",
        status: "ACTIVE",
        salary_band: data.salary_band,
      };
    } catch {
      return {
        id: String(Date.now()),
        tenant_id: "default",
        domain_id: "hr",
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        department: data.department || "HR",
        position: data.position || "Staff",
        status: "ACTIVE",
      };
    }
  },

  listAttendance: async (params?: { employee_id?: string }): Promise<AttendanceRecordItem[]> => {
    try {
      const res = await apiClient.get<AttendanceRecordItem[]>("/hr/attendance", { params });
      return res.data || [];
    } catch {
      return [];
    }
  },

  checkInAttendance: async (data?: { latitude?: number; longitude?: number }): Promise<any> => {
    const res = await apiClient.post("/hr/attendance/check-in", data || {});
    return res.data;
  },

  listLeaves: async (params?: { employee_id?: string }): Promise<LeaveRecordItem[]> => {
    try {
      const res = await apiClient.get<LeaveRecordItem[]>("/hr/leaves", { params });
      return res.data || [];
    } catch {
      return [];
    }
  },

  submitLeave: async (data: {
    employee_id?: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason?: string;
  }): Promise<any> => {
    const res = await apiClient.post("/hr/leaves", data);
    return res.data;
  },

  updateLeaveStatus: async (leaveId: string, status: "APPROVED" | "REJECTED"): Promise<any> => {
    const res = await apiClient.put(`/hr/leaves/${leaveId}/status`, { status });
    return res.data;
  },
};
