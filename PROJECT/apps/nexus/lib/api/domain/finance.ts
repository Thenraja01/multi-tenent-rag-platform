import { apiClient } from "../client";
import { FinanceInvoice } from "@/types/business";

export interface InvoiceRecord {
  id: string;
  tenant_id?: string;
  domain_id?: string;
  invoice_number: string;
  vendor_name: string;
  amount?: number;
  total_amount: number;
  currency?: string;
  due_date?: string;
  status?: string;
  payment_status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  approval_status?: "PENDING" | "APPROVED" | "REJECTED";
  created_at?: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  employee_name: string;
  category: string;
  amount: number;
  currency?: string;
  expense_date?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REIMBURSED";
  created_at?: string;
}

export interface VendorRecord {
  id: string;
  name: string;
  code: string;
  tax_id?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  category?: string;
  payment_terms_days?: number;
  status: string;
}

export interface BudgetRecord {
  id: string;
  department_name: string;
  fiscal_year: string;
  allocated_amount: number;
  spent_amount: number;
  currency?: string;
  status: string;
  utilization_pct?: number;
}

export interface FinanceDashboardStats {
  kpis: {
    total_revenue: number;
    total_revenue_display: string;
    total_expenses: number;
    total_expenses_display: string;
    net_profit: number;
    net_profit_display: string;
    outstanding_receivables: number;
    outstanding_display: string;
    pending_approvals_count: number;
  };
  budget_alerts: Array<{
    id: string;
    department: string;
    allocated: number;
    spent: number;
    utilization_pct: number;
    currency: string;
    is_critical: boolean;
  }>;
  recent_invoices: InvoiceRecord[];
}

export const financeApi = {
  getDashboardStats: async (): Promise<FinanceDashboardStats | null> => {
    try {
      const res = await apiClient.get<FinanceDashboardStats>("/finance/dashboard/stats");
      return res.data;
    } catch {
      return null;
    }
  },

  listInvoices: async (status?: string): Promise<FinanceInvoice[]> => {
    try {
      const res = await apiClient.get<any[]>("/finance/invoices", {
        params: status ? { payment_status: status } : undefined,
      });
      const items = res.data || [];
      return items.map((inv: any) => ({
        id: inv.id,
        tenant_id: inv.organization_id || "default",
        domain_id: inv.domain_id || "finance",
        invoice_number: inv.invoice_number,
        vendor_name: inv.vendor_name,
        amount: Number(inv.total_amount || inv.amount || 0),
        currency: inv.currency || "INR",
        status: inv.payment_status || inv.approval_status || inv.status || "PENDING",
        notes: inv.notes,
        created_at: inv.created_at || inv.due_date,
      }));
    } catch {
      return [];
    }
  },

  createInvoice: async (data: {
    vendor_name: string;
    invoice_number: string;
    amount?: number;
    total_amount?: number;
    due_date?: string;
    currency?: string;
    notes?: string;
  }): Promise<FinanceInvoice> => {
    const total = data.total_amount || data.amount || 0;
    const due = data.due_date || new Date().toISOString().split("T")[0];
    try {
      const res = await apiClient.post<any>("/finance/invoices", {
        vendor_name: data.vendor_name,
        invoice_number: data.invoice_number,
        total_amount: total,
        due_date: due,
        currency: data.currency || "INR",
        notes: data.notes,
      });
      return {
        id: res.data?.id || String(Date.now()),
        tenant_id: "default",
        domain_id: "finance",
        invoice_number: data.invoice_number,
        vendor_name: data.vendor_name,
        amount: total,
        currency: data.currency || "INR",
        status: "PENDING",
        notes: data.notes,
      };
    } catch {
      return {
        id: String(Date.now()),
        tenant_id: "default",
        domain_id: "finance",
        invoice_number: data.invoice_number,
        vendor_name: data.vendor_name,
        amount: total,
        currency: data.currency || "INR",
        status: "PENDING",
        notes: data.notes,
      };
    }
  },

  approveInvoice: async (invoiceId: string, action: "APPROVE" | "REJECT", notes?: string): Promise<any> => {
    const res = await apiClient.post(`/finance/invoices/${invoiceId}/action`, { action, notes });
    return res.data;
  },

  listExpenses: async (): Promise<ExpenseRecord[]> => {
    try {
      const res = await apiClient.get<ExpenseRecord[]>("/finance/expenses");
      return res.data || [];
    } catch {
      return [];
    }
  },

  createExpense: async (data: {
    title: string;
    employee_name: string;
    category?: string;
    amount: number;
    currency?: string;
  }): Promise<ExpenseRecord> => {
    const res = await apiClient.post<ExpenseRecord>("/finance/expenses", data);
    return res.data;
  },

  listVendors: async (): Promise<VendorRecord[]> => {
    try {
      const res = await apiClient.get<VendorRecord[]>("/finance/vendors");
      return res.data || [];
    } catch {
      return [];
    }
  },

  createVendor: async (data: {
    name: string;
    code: string;
    category?: string;
    contact_person?: string;
    email?: string;
    payment_terms_days?: number;
  }): Promise<VendorRecord> => {
    const res = await apiClient.post<VendorRecord>("/finance/vendors", data);
    return res.data;
  },

  listBudgets: async (): Promise<BudgetRecord[]> => {
    try {
      const res = await apiClient.get<BudgetRecord[]>("/finance/budgets");
      return res.data || [];
    } catch {
      return [];
    }
  },

  createBudget: async (data: {
    department_name: string;
    fiscal_year: string;
    allocated_amount: number;
    currency?: string;
  }): Promise<BudgetRecord> => {
    const res = await apiClient.post<BudgetRecord>("/finance/budgets", data);
    return res.data;
  },
};
