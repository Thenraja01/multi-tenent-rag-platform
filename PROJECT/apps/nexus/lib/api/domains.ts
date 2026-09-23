import { apiClient } from "./client";
import { DomainTemplate } from "@/types/permission";
import { Domain } from "@/types/domain";

export const domainsApi = {
  listDomains: async (): Promise<Domain[]> => {
    try {
      const res = await apiClient.get<any>("/api/v1/domains");
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.items)) return res.data.items;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    } catch {
      return [];
    }
  },

  getPublicDomains: async (): Promise<Domain[]> => {
    return domainsApi.listDomains();
  },

  getDomainTemplates: async (): Promise<DomainTemplate[]> => {
    try {
      const res = await apiClient.get<any>("/api/v1/domain-templates");
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.items)) return res.data.items;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    } catch {
      return [];
    }
  },

  createDomainTemplate: async (data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    feature_keys?: string[];
    default_roles?: any[];
    configuration?: Record<string, any>;
  }): Promise<any> => {
    const res = await apiClient.post("/api/v1/domain-templates", data);
    return res.data;
  },

  instantiateDomain: async (templateId: string, tenantId: string): Promise<any> => {
    const res = await apiClient.post(`/api/v1/domain-templates/${templateId}/instantiate`, {
      tenant_id: tenantId,
    });
    return res.data;
  },

  createDomain: async (data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    configuration?: Record<string, any>;
  }): Promise<any> => {
    const res = await apiClient.post("/api/v1/domains", data);
    return res.data;
  },
};

