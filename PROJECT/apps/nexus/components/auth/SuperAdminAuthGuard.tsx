"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { ShieldAlert } from "lucide-react";

export const SuperAdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const token = typeof window !== "undefined" ? localStorage.getItem("nexus_token") : null;
      if (!user && !token) {
        router.replace(`/login?mode=superadmin&redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      if (user && !user.isSuperAdmin && user.role !== "SUPER_ADMIN") {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono">Verifying SuperAdmin privileges...</p>
      </div>
    );
  }

  const hasToken = typeof window !== "undefined" ? localStorage.getItem("nexus_token") : null;
  if (!user && !hasToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
        <p className="text-xs font-mono">SuperAdmin privileges required. Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
};
