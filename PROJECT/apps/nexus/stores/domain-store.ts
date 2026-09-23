import { create } from 'zustand';
import { Domain, Subdomain } from '../types/domain';

interface DomainState {
  activeDomain: Domain | null;
  activeSubdomain: Subdomain | null;
  userDomains: Domain[];
  setActiveDomain: (domain: Domain | null) => void;
  setActiveSubdomain: (subdomain: Subdomain | null) => void;
  setUserDomains: (domains: Domain[]) => void;
}

export const useDomainStore = create<DomainState>((set) => ({
  activeDomain: null,
  activeSubdomain: null,
  userDomains: [],
  setActiveDomain: (activeDomain) =>
    set({
      activeDomain,
      // Reset active subdomain when domain switches
      activeSubdomain: activeDomain?.subdomains?.[0] || null,
    }),
  setActiveSubdomain: (activeSubdomain) => set({ activeSubdomain }),
  setUserDomains: (userDomains) => set({ userDomains }),
}));
