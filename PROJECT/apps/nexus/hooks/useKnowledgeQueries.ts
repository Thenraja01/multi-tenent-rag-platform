import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeApi } from "@/lib/api/knowledge";

export const useKnowledgeStatusQuery = (domainId?: string) => {
  return useQuery({
    queryKey: ["knowledge", "status", { domainId }],
    queryFn: () => knowledgeApi.getKnowledgeStatus(domainId),
    staleTime: 30 * 1000,
  });
};

export const useKnowledgeChunksQuery = (documentId?: string) => {
  return useQuery({
    queryKey: ["knowledge", "chunks", { documentId }],
    queryFn: () => knowledgeApi.listChunks(documentId),
    staleTime: 30 * 1000,
  });
};

export const useReindexDomainMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (domainId: string) => knowledgeApi.reindexDomain(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};
