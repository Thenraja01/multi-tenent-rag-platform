import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { featuresApi } from "@/lib/api/features";
import { FeatureItem } from "@/types/permission";

export const useFeaturesListQuery = (domainId?: string, featureType?: string) => {
  return useQuery<FeatureItem[]>({
    queryKey: ["features", { domainId, featureType }],
    queryFn: () => featuresApi.listFeatures(domainId, featureType),
    staleTime: 60 * 1000,
  });
};

export const useRegisterFeatureMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, {
    domain_id?: string;
    key: string;
    name: string;
    description?: string;
    route?: string;
    icon?: string;
    feature_type?: string;
  }>({
    mutationFn: (data) => featuresApi.registerFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "access"] });
    },
  });
};

export const useToggleFeatureMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (featureId: string) => featuresApi.toggleFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "access"] });
    },
  });
};

export const useAssignFeaturePermissionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { featureId: string; permissionKeys: string[] }>({
    mutationFn: ({ featureId, permissionKeys }) => featuresApi.assignPermissions(featureId, permissionKeys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "access"] });
    },
  });
};
