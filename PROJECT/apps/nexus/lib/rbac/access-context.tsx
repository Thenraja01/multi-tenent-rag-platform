"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserAccessContext, FeatureItem } from "@/types/permission";
import { permissionsApi } from "@/lib/api/permissions";

interface AccessContextType {
  access: UserAccessContext | null;
  loading: boolean;
  activeDomainSlug: string | null;
  setActiveDomainSlug: (slug: string) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasFeature: (featureKey: string) => boolean;
  can: (resource: string, action: string, domainSlug?: string) => boolean;
  hasDomain: (domainSlug: string) => boolean;
  refreshAccess: (domainSlug?: string) => Promise<void>;
}

const AccessContext = createContext<AccessContextType>({
  access: null,
  loading: false,
  activeDomainSlug: null,
  setActiveDomainSlug: () => {},
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  hasFeature: () => false,
  can: () => false,
  hasDomain: () => false,
  refreshAccess: async () => {},
});

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [access, setAccess] = useState<UserAccessContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDomainSlug, setActiveDomainSlugState] = useState<string | null>(null);

  const fetchAccess = useCallback(async (domainSlugOverride?: string) => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("nexus_token") || localStorage.getItem("token");
    if (!token) {
      setAccess(null);
      setLoading(false);
      return;
    }

    const domainSlug = domainSlugOverride || localStorage.getItem("nexus_active_domain_slug") || undefined;

    setLoading(true);
    try {
      const data = await permissionsApi.getMyAccessContext(domainSlug);
      setAccess(data);
      if (data.domain?.slug) {
        setActiveDomainSlugState(data.domain.slug);
        localStorage.setItem("nexus_active_domain_slug", data.domain.slug);
      }
    } catch {
      // In dev fallback mode: check stored user
      const storedUser = localStorage.getItem("nexus_user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.isSuperAdmin || user.role === "SUPER_ADMIN") {
            setAccess({
              userId: user.id || "superadmin-01",
              fullName: user.fullName || "Platform SuperAdmin",
              email: user.email || "admin@platform",
              isSuperAdmin: true,
              role: "SUPER_ADMIN",
              tenant: null,
              domains: [],
              roles: ["SUPER_ADMIN"],
              permissions: ["*"],
              features: ["*"],
            });
            return;
          }
        } catch {}
      }
      setAccess(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setActiveDomainSlug = (slug: string) => {
    setActiveDomainSlugState(slug);
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus_active_domain_slug", slug);
    }
    fetchAccess(slug);
  };

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  const hasPermission = (permission: string): boolean => {
    if (!access) return false;
    if (access.isSuperAdmin || access.permissions.includes("*")) return true;
    return access.permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    if (!access) return false;
    if (access.isSuperAdmin || access.permissions.includes("*")) return true;
    return perms.some((p) => access.permissions.includes(p));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    if (!access) return false;
    if (access.isSuperAdmin || access.permissions.includes("*")) return true;
    return perms.every((p) => access.permissions.includes(p));
  };

  const hasFeature = (featureKey: string): boolean => {
    if (!access) return false;
    if (access.isSuperAdmin) return true;
    if (Array.isArray(access.features)) {
      return access.features.some((f) => {
        if (typeof f === "string") return f === featureKey || f === "*";
        return (f as FeatureItem).key === featureKey;
      });
    }
    return false;
  };

  const can = (resource: string, action: string, domainSlug?: string): boolean => {
    const permCode = `${resource}.${action}`;
    return hasPermission(permCode);
  };

  const hasDomain = (domainSlug: string): boolean => {
    if (!access) return false;
    if (access.isSuperAdmin) return true;
    return (
      (access.availableDomains && access.availableDomains.some((d) => d.slug === domainSlug)) ||
      (access.domains && access.domains.some((d) => d.slug === domainSlug))
    );
  };

  return (
    <AccessContext.Provider
      value={{
        access,
        loading,
        activeDomainSlug,
        setActiveDomainSlug,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasFeature,
        can,
        hasDomain,
        refreshAccess: fetchAccess,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => useContext(AccessContext);
