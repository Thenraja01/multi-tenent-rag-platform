import { apiClient } from "./client";
import { Plan } from "@/types/plan";

export const plansApi = {
  getPublicPlans: async (): Promise<Plan[]> => {
    const res = await apiClient.get("/api/public/plans");
    return res.data;
  },
};
