import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrApi } from "@/lib/api/domain/hr";
import { financeApi } from "@/lib/api/domain/finance";
import { itApi } from "@/lib/api/domain/it";
import { HREmployee, FinanceInvoice, ITIncident } from "@/types/business";

// HR Domain Hooks
export const useEmployeesQuery = () => {
  return useQuery<HREmployee[]>({
    queryKey: ["hr", "employees"],
    queryFn: () => hrApi.listEmployees(),
    staleTime: 30 * 1000,
  });
};

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    HREmployee,
    Error,
    {
      first_name: string;
      last_name: string;
      email: string;
      department?: string;
      position?: string;
      salary_band?: string;
    }
  >({
    mutationFn: (data) => hrApi.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "employees"] });
      queryClient.invalidateQueries({ queryKey: ["management"] });
    },
  });
};

// Finance Domain Hooks
export const useInvoicesQuery = () => {
  return useQuery<FinanceInvoice[]>({
    queryKey: ["finance", "invoices"],
    queryFn: () => financeApi.listInvoices(),
    staleTime: 30 * 1000,
  });
};

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FinanceInvoice,
    Error,
    {
      invoice_number: string;
      vendor_name: string;
      amount: number;
      currency?: string;
      notes?: string;
    }
  >({
    mutationFn: (data) => financeApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] });
      queryClient.invalidateQueries({ queryKey: ["management"] });
    },
  });
};

// IT Domain Hooks
export const useIncidentsQuery = () => {
  return useQuery<ITIncident[]>({
    queryKey: ["it", "incidents"],
    queryFn: () => itApi.listIncidents(),
    staleTime: 30 * 1000,
  });
};

export const useCreateIncidentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ITIncident,
    Error,
    {
      title: string;
      description?: string;
      severity?: string;
      assigned_to?: string;
    }
  >({
    mutationFn: (data) => itApi.createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["it", "incidents"] });
      queryClient.invalidateQueries({ queryKey: ["management"] });
    },
  });
};
