export interface Ticket {
  id: string;
  tenant_id: string;
  domain_id?: string | null;
  department_id?: string | null;
  created_by_user_id?: string | null;
  assigned_to_user_id?: string | null;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  category?: string;
  meta_data?: Record<string, any>;
  attachments?: string[];
  created_at: string;
  updated_at?: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?: string;
  domain_id?: string;
  department_id?: string;
  assigned_to_user_id?: string;
  attachments?: string[];
  meta_data?: Record<string, any>;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigned_to_user_id?: string;
}
