import { apiClient } from "./client";
import { FeatureItem } from "@/types/permission";

export const featuresApi = {
  listFeatures: async (domainId?: string, featureType?: string): Promise<FeatureItem[]> => {
    const params: Record<string, string> = {};
    if (domainId) params.domain_id = domainId;
    if (featureType) params.feature_type = featureType;
    const res = await apiClient.get<FeatureItem[]>("/api/v1/features", { params });
    return res.data;
  },

  registerFeature: async (data: {
    domain_id?: string;
    key: string;
    name: string;
    description?: string;
    route?: string;
    icon?: string;
    feature_type?: string;
  }): Promise<any> => {
    const res = await apiClient.post("/api/v1/features", data);
    return res.data;
  },

  toggleFeature: async (featureId: string): Promise<any> => {
    const res = await apiClient.patch(`/api/v1/features/${featureId}/toggle`);
    return res.data;
  },

  assignPermissions: async (featureId: string, permissionKeys: string[]): Promise<any> => {
    const res = await apiClient.post(`/api/v1/features/${featureId}/permissions`, {
      permission_keys: permissionKeys,
    });
    return res.data;
  },
};
