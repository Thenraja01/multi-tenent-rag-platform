'use client';

import { create } from 'zustand';

export type AdminContextType = 'GLOBAL' | 'ORGANIZATION' | 'TENANT' | 'DOMAIN' | 'DEPARTMENT' | 'MODULE';

export interface AdminContextState {
  type: AdminContextType;
  organizationId?: string;
  organizationName?: string;
  organizationSlug?: string;
  domainId?: string;
  domainName?: string;
  domainSlug?: string;
  departmentId?: string;
  departmentName?: string;
  moduleId?: string;
  moduleName?: string;
  
  // Actions
  setGlobalContext: () => void;
  setOrganizationContext: (org: { id: string; name: string; slug?: string }) => void;
  setDomainContext: (org: { id: string; name: string; slug?: string }, domain: { id: string; name: string; slug?: string }) => void;
  setDepartmentContext: (org: { id: string; name: string }, dept: { id: string; name: string }) => void;
  setContextFromPath: (pathname: string) => void;
}

export const useAdminContextStore = create<AdminContextState>((set) => ({
  type: 'GLOBAL',
  organizationId: undefined,
  organizationName: undefined,
  organizationSlug: undefined,
  domainId: undefined,
  domainName: undefined,
  domainSlug: undefined,
  departmentId: undefined,
  departmentName: undefined,
  moduleId: undefined,
  moduleName: undefined,

  setGlobalContext: () =>
    set({
      type: 'GLOBAL',
      organizationId: undefined,
      organizationName: undefined,
      organizationSlug: undefined,
      domainId: undefined,
      domainName: undefined,
      domainSlug: undefined,
      departmentId: undefined,
      departmentName: undefined,
      moduleId: undefined,
      moduleName: undefined,
    }),

  setOrganizationContext: (org) =>
    set({
      type: 'ORGANIZATION',
      organizationId: org.id,
      organizationName: org.name,
      organizationSlug: org.slug,
      domainId: undefined,
      domainName: undefined,
      domainSlug: undefined,
      departmentId: undefined,
      departmentName: undefined,
      moduleId: undefined,
      moduleName: undefined,
    }),

  setDomainContext: (org, domain) =>
    set({
      type: 'DOMAIN',
      organizationId: org.id,
      organizationName: org.name,
      organizationSlug: org.slug,
      domainId: domain.id,
      domainName: domain.name,
      domainSlug: domain.slug,
      departmentId: undefined,
      departmentName: undefined,
      moduleId: undefined,
      moduleName: undefined,
    }),

  setDepartmentContext: (org, dept) =>
    set({
      type: 'DEPARTMENT',
      organizationId: org.id,
      organizationName: org.name,
      departmentId: dept.id,
      departmentName: dept.name,
      domainId: undefined,
      domainName: undefined,
      domainSlug: undefined,
      moduleId: undefined,
      moduleName: undefined,
    }),

  setContextFromPath: (pathname: string) => {
    // If not under /admin, keep default
    if (!pathname.startsWith('/admin')) {
      set({ type: 'GLOBAL' });
      return;
    }

    const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);

    // e.g. /admin/organizations/:orgId/domains/:domainId/documents
    if (segments[0] === 'organizations' && segments[1]) {
      const orgId = decodeURIComponent(segments[1]);
      if (segments[2] === 'domains' && segments[3]) {
        const domainId = decodeURIComponent(segments[3]);
        set((state) => ({
          type: 'DOMAIN',
          organizationId: orgId,
          organizationName: state.organizationId === orgId ? state.organizationName : orgId,
          domainId: domainId,
          domainName: state.domainId === domainId ? state.domainName : domainId.toUpperCase(),
        }));
        return;
      }

      set((state) => ({
        type: 'ORGANIZATION',
        organizationId: orgId,
        organizationName: state.organizationId === orgId ? state.organizationName : orgId,
        domainId: undefined,
        domainName: undefined,
      }));
      return;
    }

    // Default global admin context
    set({
      type: 'GLOBAL',
      organizationId: undefined,
      organizationName: undefined,
      domainId: undefined,
      domainName: undefined,
    });
  },
}));
