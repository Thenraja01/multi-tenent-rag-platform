import { useAccess } from "@/lib/rbac/access-context";

export const useFeature = () => {
  const { hasFeature, access } = useAccess();

  return {
    hasFeature,
    features: access?.features || [],
  };
};
