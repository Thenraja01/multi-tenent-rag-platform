import { useQuery } from "@tanstack/react-query";
import { managementApi } from "@/lib/api/management";
import { hrApi } from "@/lib/api/domain/hr";
import { financeApi } from "@/lib/api/domain/finance";
import { itApi } from "@/lib/api/domain/it";

export const useDomainProgress = () => {
  return useQuery({
    queryKey: ["management", "domain-progress"],
    queryFn: () => managementApi.getDomainProgress(),
    staleTime: 30000,
  });
};

export const useManagementDashboard = () => {
  return useQuery({
    queryKey: ["management", "dashboard"],
    queryFn: () => managementApi.getDashboard(),
    staleTime: 30000,
  });
};

export const useEmployees = () => {
  return useQuery({
    queryKey: ["hr", "employees"],
    queryFn: () => hrApi.listEmployees(),
    staleTime: 15000,
  });
};

export const useInvoices = () => {
  return useQuery({
    queryKey: ["finance", "invoices"],
    queryFn: () => financeApi.listInvoices(),
    staleTime: 15000,
  });
};

export const useIncidents = () => {
  return useQuery({
    queryKey: ["it", "incidents"],
    queryFn: () => itApi.listIncidents(),
    staleTime: 15000,
  });
};
