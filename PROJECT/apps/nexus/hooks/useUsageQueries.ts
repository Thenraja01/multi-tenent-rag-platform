"use client";

import { useQuery } from "@tanstack/react-query";
import { usageApi, UsageSummaryResponse } from "@/lib/api/usage";

export function useUsageSummary() {
  return useQuery<UsageSummaryResponse>({
    queryKey: ["usage", "summary"],
    queryFn: () => usageApi.getUsageSummary(),
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useUsageOverview() {
  return useQuery({
    queryKey: ["usage", "overview"],
    queryFn: () => usageApi.getUsageOverview(),
  });
}
