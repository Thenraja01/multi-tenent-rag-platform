import { apiClient } from "./client";

export interface AIChatRequest {
  query: string;
  domain_slug?: string;
  conversation_id?: string;
  temperature?: number;
}

export interface AIChatResponse {
  answer: string;
  confidence: number;
  sources: Array<{
    document_id: string;
    document_name: string;
    snippet: string;
    score: number;
  }>;
  conversation_id: string;
}

export interface OmniQueryRequest {
  query: string;
  domains?: string[];
  top_k_per_domain?: number;
}

export interface OmniQueryCitation {
  document_id: string;
  document_name?: string;
  domain: string;
  chunk_text?: string;
  snippet?: string;
  score?: number;
  metadata?: Record<string, any>;
}

export interface OmniQueryResponse {
  query: string;
  answer: string;
  queried_domains: string[];
  citations: OmniQueryCitation[];
  total_citations: number;
  is_omni: boolean;
}

export const aiApi = {
  chat: async (data: AIChatRequest): Promise<AIChatResponse> => {
    const res = await apiClient.post<AIChatResponse>("/api/v1/ai/chat", {
      domain: data.domain_slug || "hr",
      query: data.query,
      conversation_id: data.conversation_id,
    }, {
      headers: data.domain_slug ? { "X-Domain-Slug": data.domain_slug } : {},
    });
    return res.data;
  },

  omniQuery: async (data: OmniQueryRequest): Promise<OmniQueryResponse> => {
    const res = await apiClient.post<OmniQueryResponse>("/api/v1/ai/omni-query", {
      query: data.query,
      domains: data.domains,
      top_k_per_domain: data.top_k_per_domain || 3,
    });
    return res.data;
  },

  listConversations: async (domainSlug?: string): Promise<any[]> => {
    const res = await apiClient.get<any[]>("/api/v1/conversations", {
      headers: domainSlug ? { "X-Domain-Slug": domainSlug } : {},
    });
    return res.data;
  },

  getConversation: async (id: string): Promise<any> => {
    const res = await apiClient.get<any>(`/api/v1/conversations/${id}`);
    return res.data;
  },

  queryRAG: async (query: { query: string; domain?: string }): Promise<AIChatResponse> => {
    return aiApi.chat({ query: query.query, domain_slug: query.domain });
  },
};

