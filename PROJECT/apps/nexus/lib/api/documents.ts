import { apiClient } from "./client";
import { DocumentItem } from "@/types/document";

export const documentsApi = {
  listDocuments: async (domainId?: string): Promise<DocumentItem[]> => {
    const params = domainId ? { domain_id: domainId } : {};
    const res = await apiClient.get<DocumentItem[]>("/api/v1/documents", { params });
    return res.data;
  },

  uploadDocument: async (formData: FormData): Promise<any> => {
    const res = await apiClient.post("/api/v1/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  deleteDocument: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/api/v1/documents/${id}`);
    return res.data;
  },

  getDocument: async (id: string): Promise<DocumentItem> => {
    const res = await apiClient.get<DocumentItem>(`/api/v1/documents/${id}`);
    return res.data;
  },

  approveDocument: async (id: string): Promise<any> => {
    const res = await apiClient.post(`/api/v1/documents/${id}/approve`);
    return res.data;
  },

  rejectDocument: async (id: string): Promise<any> => {
    const res = await apiClient.post(`/api/v1/documents/${id}/reject`);
    return res.data;
  },
};
