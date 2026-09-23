import { apiClient } from "./client";
import { UserAccessContext, Permission } from "@/types/permission";

export const permissionsApi = {
  getMyAccessContext: async (domainSlug?: string): Promise<UserAccessContext> => {
    const headers: Record<string, string> = {};
    if (domainSlug) {
      headers["X-Domain-Slug"] = domainSlug;
    }
    try {
      const res = await apiClient.get<any>("/auth/me/access", { headers });
      const d = res.data;
      return {
        userId: d.userId || d.id || "",
        fullName: d.fullName || d.full_name || "User",
        email: d.email || "",
        isSuperAdmin: Boolean(d.isSuperAdmin || d.is_superadmin),
        role: d.role || (d.is_org_admin ? "org_admin" : "member"),
        tenant: d.tenant || null,
        domain: d.department
          ? {
              id: d.department.id || "",
              name: d.department.name || "",
              slug: d.department.slug || "hr",
              description: "",
              icon: "folder",
            }
          : null,
        availableDomains: (d.domains || []).map((dom: any) => ({
          id: dom.id || dom.domainId || "",
          name: dom.name || "",
          slug: dom.slug || "",
          icon: dom.icon || "folder",
        })),
        domains: (d.domains || []).map((dom: any) => ({
          domainId: dom.id || dom.domainId || "",
          name: dom.name || "",
          slug: dom.slug || "",
          description: dom.description || "",
          icon: dom.icon || "folder",
          roles: dom.roles || [],
          permissions: dom.permissions || ["*"],
        })),
        roles: (d.roles || []).map((r: any) => (typeof r === "string" ? r : r.slug || r.name)),
        permissions: d.permissions || ["*"],
        features: ["*"],
      } as UserAccessContext;
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        throw err;
      }
      if (err?.response?.status === 404) {
        const ctxRes = await apiClient.get<any>("/workspace/context");
        const data = ctxRes.data || {};
        return {
          userId: data.user?.id || "",
          fullName: data.user?.full_name || "User",
          email: data.user?.email || "",
          isSuperAdmin: Boolean(data.user?.is_superadmin),
          role: data.user?.role || "employee",
          tenant: data.organization || null,
          domains: (data.domains || []).map((dom: any) => ({
            domainId: dom.id || "",
            name: dom.name || "",
            slug: dom.slug || "",
            description: dom.description || "",
            icon: "folder",
            roles: [data.user?.role || "employee"],
            permissions: data.permissions || ["*"],
          })),
          availableDomains: (data.domains || []).map((dom: any) => ({
            id: dom.id || "",
            name: dom.name || "",
            slug: dom.slug || "",
            icon: "folder",
          })),
          roles: (data.roles || []).map((r: any) => (typeof r === "string" ? r : r.slug || r.name)),
          permissions: data.permissions || ["*"],
          features: ["*"],
        } as UserAccessContext;
      }
      throw err;
    }
  },

  listPermissions: async (): Promise<Permission[]> => {
    const res = await apiClient.get<Permission[]>("/permissions");
    return res.data;
  },
};
