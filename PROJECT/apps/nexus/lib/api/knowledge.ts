import { apiClient } from "./client";

export const knowledgeApi = {
  getKnowledgeStatus: async (domainId?: string): Promise<any> => {
    const params = domainId ? { domain_id: domainId } : {};
    const res = await apiClient.get("/api/v1/knowledge", { params });
    return res.data;
  },

  listChunks: async (documentId?: string): Promise<any[]> => {
    const params = documentId ? { document_id: documentId } : {};
    const res = await apiClient.get<any[]>("/api/v1/knowledge/chunks", { params });
    return res.data;
  },

  reindexDomain: async (domainId: string): Promise<any> => {
    const res = await apiClient.post(`/api/v1/knowledge/reindex/${domainId}`);
    return res.data;
  },
};
