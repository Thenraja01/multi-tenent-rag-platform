import { apiClient } from "./client";
import { AuthSession, LoginCredentials, UserIdentity } from "@/types/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    const res = await apiClient.post<AuthSession>("/api/auth/login", credentials);
    if (res.data?.accessToken && typeof window !== "undefined") {
      localStorage.setItem("nexus_token", res.data.accessToken);
      localStorage.setItem("nexus_user", JSON.stringify(res.data.user));
      if (res.data.tenant?.id) {
        localStorage.setItem("nexus_active_tenant_id", res.data.tenant.id);
      }
    }
    return res.data;
  },

  getMe: async (): Promise<UserIdentity> => {
    const res = await apiClient.get<UserIdentity>("/api/auth/me");
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        localStorage.removeItem("nexus_active_domain_slug");
      }
    }
  },

  activateWorkspace: async (token: string) => {
    const res = await apiClient.post("/api/auth/activate", { token });
    if (res.data?.accessToken && typeof window !== "undefined") {
      localStorage.setItem("nexus_token", res.data.accessToken);
      localStorage.setItem("nexus_user", JSON.stringify(res.data.user));
      if (res.data.tenant?.id) {
        localStorage.setItem("nexus_active_tenant_id", res.data.tenant.id);
      }
    }
    return res.data;
  },

  activate: async (token: string) => {
    return authApi.activateWorkspace(token);
  },
};
