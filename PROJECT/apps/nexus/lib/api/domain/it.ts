import { apiClient } from "../client";
import { ITIncident } from "@/types/business";

export interface ITTicketRecord {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  created_by?: string;
  assigned_to?: string;
  created_at?: string;
  ai_generated?: boolean;
  resolution_notes?: string;
}

export interface ITRunbookRecord {
  id: string;
  title: string;
  category: string;
  steps: string[];
  tags: string[];
  content: string;
  created_at?: string;
}

export const itApi = {
  listTickets: async (status?: string): Promise<{ total_count: number; tickets: ITTicketRecord[] }> => {
    try {
      const res = await apiClient.get("/it/tickets", { params: status ? { status } : undefined });
      return res.data || { total_count: 0, tickets: [] };
    } catch {
      return { total_count: 0, tickets: [] };
    }
  },

  listIncidents: async (): Promise<ITIncident[]> => {
    try {
      const res = await apiClient.get<{ total_count: number; tickets: any[] }>("/it/tickets");
      const items = res.data?.tickets || [];
      return items.map((t: any) => ({
        id: t.id,
        tenant_id: t.organization_id || "default",
        domain_id: "it",
        title: t.title,
        description: t.description,
        severity: t.priority || "MEDIUM",
        status: t.status || "OPEN",
        assigned_to: t.assigned_to,
        created_at: t.created_at,
      }));
    } catch {
      return [];
    }
  },

  createTicket: async (data: {
    title: string;
    description: string;
    priority?: string;
    category?: string;
    system_impact?: string;
  }): Promise<ITTicketRecord> => {
    const res = await apiClient.post<ITTicketRecord>("/it/tickets", data);
    return res.data;
  },

  createIncident: async (data: {
    title: string;
    description?: string;
    severity?: string;
    assigned_to?: string;
  }): Promise<ITIncident> => {
    try {
      const res = await apiClient.post<any>("/it/tickets", {
        title: data.title,
        description: data.description || "Incident created",
        priority: data.severity || "MEDIUM",
      });
      return {
        id: res.data?.id || String(Date.now()),
        tenant_id: "default",
        domain_id: "it",
        title: data.title,
        description: data.description,
        severity: data.severity || "MEDIUM",
        status: "OPEN",
        assigned_to: data.assigned_to,
        created_at: new Date().toISOString(),
      };
    } catch {
      return {
        id: String(Date.now()),
        tenant_id: "default",
        domain_id: "it",
        title: data.title,
        description: data.description,
        severity: data.severity || "MEDIUM",
        status: "OPEN",
        assigned_to: data.assigned_to,
      };
    }
  },

  updateTicket: async (ticketId: string, data: {
    status?: string;
    priority?: string;
    assigned_to?: string;
    resolution_notes?: string;
  }): Promise<ITTicketRecord> => {
    const res = await apiClient.patch<ITTicketRecord>(`/it/tickets/${ticketId}`, data);
    return res.data;
  },

  listRunbooks: async (category?: string): Promise<{ total_count: number; runbooks: ITRunbookRecord[] }> => {
    try {
      const res = await apiClient.get("/it/runbooks", { params: category ? { category } : undefined });
      return res.data || { total_count: 0, runbooks: [] };
    } catch {
      return { total_count: 0, runbooks: [] };
    }
  },

  createRunbook: async (data: {
    title: string;
    category?: string;
    steps?: string[];
    tags?: string[];
    content: string;
  }): Promise<ITRunbookRecord> => {
    const res = await apiClient.post<ITRunbookRecord>("/it/runbooks", data);
    return res.data;
  },
};
