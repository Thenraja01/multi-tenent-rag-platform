"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { authApi } from "@/lib/api/auth";

export interface ActivationHandlerProps {
  token: string;
}

export const ActivationHandler: React.FC<ActivationHandlerProps> = ({ token }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No activation token provided.");
      return;
    }

    const activate = async () => {
      try {
        const res = await authApi.activate(token);
        setSession(res);
        if (typeof window !== "undefined" && res.accessToken) {
          localStorage.setItem("nexus_token", res.accessToken);
          localStorage.setItem("nexus_user", JSON.stringify(res.user));
          localStorage.setItem("nexus_tenant", JSON.stringify(res.tenant));
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Activation link is invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    activate();
  }, [token, router]);

  return (
    <Card className="p-8 text-center max-w-md mx-auto border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
      {loading ? (
        <div className="py-6 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Activating Workspace...</h3>
          <p className="text-xs text-slate-400">Verifying one-time activation token and creating session.</p>
        </div>
      ) : error ? (
        <div className="py-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Activation Failed</h3>
          <p className="text-xs text-slate-300">{error}</p>
          <Button href="/login" variant="outline" size="sm" className="w-full">
            Proceed to Login
          </Button>
        </div>
      ) : (
        <div className="py-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Workspace Activated!</h3>
          <p className="text-xs text-slate-300">
            Welcome to {session?.tenant?.name || "your organization"}. Redirecting you to your domain dashboard...
          </p>
          <Button href="/dashboard" variant="primary" size="md" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
            Enter Workspace
          </Button>
        </div>
      )}
    </Card>
  );
};
