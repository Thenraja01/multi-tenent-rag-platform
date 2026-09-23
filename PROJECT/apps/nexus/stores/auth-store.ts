import { create } from 'zustand';
import { DomainRoleClaim } from '../types/auth';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  tenant_id: string;
  tenant_slug: string;
  organization_id?: string;
  organization_slug?: string;
  is_org_admin?: boolean;
  is_platform_admin?: boolean;
  is_superadmin?: boolean;
  role?: string;
  department_id?: string;
  department_name?: string;
  department_slug?: string;
  department?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  domain_roles?: DomainRoleClaim[];
  roles?: Array<{ id: string; name: string; slug: string }>;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('nexus_token', token);
        document.cookie = `nexus_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        localStorage.removeItem('nexus_token');
        document.cookie = 'nexus_token=; path=/; max-age=0; SameSite=Lax';
      }
    }
    set({ token, isAuthenticated: !!token });
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexus_token');
      document.cookie = 'nexus_token=; path=/; max-age=0; SameSite=Lax';
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
