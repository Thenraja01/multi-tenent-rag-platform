import { create } from 'zustand';
import { Tenant } from '../types/database';

interface TenantState {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
  clearTenant: () => set({ tenant: null }),
}));
