import { create } from 'zustand';

interface WorkspaceUIState {
  activeModuleSlug: string;
  activeDomainSlug: string;
  sidebarCollapsed: boolean;
  setActiveModuleSlug: (slug: string) => void;
  setActiveDomainSlug: (slug: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceUIState>((set) => ({
  activeModuleSlug: 'dashboard',
  activeDomainSlug: 'hr',
  sidebarCollapsed: false,
  setActiveModuleSlug: (slug) => set({ activeModuleSlug: slug }),
  setActiveDomainSlug: (slug) => set({ activeDomainSlug: slug }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
