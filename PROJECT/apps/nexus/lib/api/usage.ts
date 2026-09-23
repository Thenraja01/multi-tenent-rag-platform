import { apiClient } from "./client";

export interface QuotaMetric {
  used: number;
  limit: number;
  percentage: number;
}

export interface DomainUsageStat {
  domain_id: string;
  domain_slug: string;
  domain_name: string;
  icon: string;
  chunks_count: number;
  seats_count: number;
}

export interface UsageSummaryResponse {
  tenant_id: string;
  plan: {
    name: string;
    max_chunks: number;
    max_monthly_queries: number;
    max_storage_bytes: number;
    max_seats: number;
  };
  metrics: {
    vector_chunks: QuotaMetric;
    monthly_queries: QuotaMetric;
    storage: {
      used_bytes: number;
      limit_bytes: number;
      percentage: number;
    };
    total_documents: number;
    total_tokens_consumed: number;
  };
  domains: DomainUsageStat[];
}

export const usageApi = {
  getUsageSummary: async (): Promise<UsageSummaryResponse> => {
    const res = await apiClient.get<UsageSummaryResponse>("/api/v1/usage/summary");
    return res.data;
  },

  getUsageOverview: async () => {
    const res = await apiClient.get("/api/v1/usage");
    return res.data;
  },

  getAiUsage: async () => {
    const res = await apiClient.get("/api/v1/usage/ai");
    return res.data;
  }
};
