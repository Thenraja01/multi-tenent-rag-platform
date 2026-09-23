import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiApi, AIChatRequest, AIChatResponse } from "@/lib/api/ai";

export const useConversationsQuery = (domainSlug?: string) => {
  return useQuery({
    queryKey: ["ai", "conversations", { domainSlug }],
    queryFn: () => aiApi.listConversations(domainSlug),
    staleTime: 15 * 1000,
  });
};

export const useConversationDetailQuery = (conversationId?: string) => {
  return useQuery({
    queryKey: ["ai", "conversation", conversationId],
    queryFn: () => (conversationId ? aiApi.getConversation(conversationId) : Promise.resolve(null)),
    enabled: Boolean(conversationId),
    staleTime: 30 * 1000,
  });
};

export const useAIChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AIChatResponse, Error, AIChatRequest>({
    mutationFn: (data: AIChatRequest) => aiApi.chat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
      queryClient.invalidateQueries({ queryKey: ["management"] });
    },
  });
};

export const useOmniQueryMutation = () => {
  return useMutation({
    mutationFn: (data: { query: string; domains?: string[]; top_k_per_domain?: number }) =>
      aiApi.omniQuery(data),
  });
};

