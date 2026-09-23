import { useState, useEffect } from "react";
import { plansApi } from "@/lib/api/plans";
import { Plan } from "@/types/plan";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    plansApi
      .getPublicPlans()
      .then((data) => setPlans(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return { plans, loading };
}
