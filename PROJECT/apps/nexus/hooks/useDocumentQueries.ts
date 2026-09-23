import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api/documents";
import { DocumentItem } from "@/types/document";

export const useDocumentsQuery = (domainId?: string) => {
  return useQuery<DocumentItem[]>({
    queryKey: ["documents", { domainId }],
    queryFn: () => documentsApi.listDocuments(domainId),
    staleTime: 30 * 1000,
  });
};

export const useUploadDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, FormData>({
    mutationFn: (formData: FormData) => documentsApi.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      queryClient.invalidateQueries({ queryKey: ["management"] });
    },
  });
};

export const useDeleteDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      queryClient.invalidateQueries({ queryKey: ["management"] });
    },
  });
};
