import { apiClient } from "./client";
import { Ticket, CreateTicketPayload, UpdateTicketPayload } from "@/types/ticket";

export const ticketsApi = {
  listTickets: async (params?: {
    domain_id?: string;
    department_id?: string;
    status?: string;
    assigned_user_id?: string;
  }): Promise<Ticket[]> => {
    const res = await apiClient.get<Ticket[]>("/api/v1/tickets", { params });
    return res.data;
  },

  createTicket: async (data: CreateTicketPayload): Promise<Ticket> => {
    const res = await apiClient.post<Ticket>("/api/v1/tickets", data);
    return res.data;
  },

  updateTicket: async (ticketId: string, data: UpdateTicketPayload): Promise<Ticket> => {
    const res = await apiClient.put<Ticket>(`/api/v1/tickets/${ticketId}`, data);
    return res.data;
  },

  addTicketNote: async (ticketId: string, note: string, isInternal: boolean = true): Promise<any> => {
    const res = await apiClient.post(`/api/v1/tickets/${ticketId}/notes`, {
      note,
      is_internal: isInternal,
    });
    return res.data;
  },
};
