"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MailCheck, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { publicApi } from "@/lib/api";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No verification token found in link.");
      return;
    }

    const performVerification = async () => {
      try {
        const res = await publicApi.verifyEmail(token);
        setData(res);
        setLoading(false);
        // Auto-redirect to complete onboarding step
        setTimeout(() => {
          router.push(`/register/complete?token=${encodeURIComponent(token)}`);
        }, 1200);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Email verification failed or token expired.");
        setLoading(false);
      }
    };

    performVerification();
  }, [token, router]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white font-bold text-xl mb-6 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
            ◈
          </div>
          <span>
            Nexus<span className="text-blue-400">RAG</span>
          </span>
        </Link>

        <Card className="p-8 border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="py-8 space-y-4">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
              <h2 className="text-lg font-bold text-white">
                Verifying Business Email...
              </h2>
              <p className="text-xs text-slate-400">
                Validating your cryptographic verification token.
              </p>
            </div>
          ) : error ? (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Verification Failed</h2>
              <p className="text-xs text-slate-300">{error}</p>
              <Button href="/register" variant="outline" size="md" className="w-full mt-4">
                Restart Registration
              </Button>
            </div>
          ) : (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <MailCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Email Verified Successfully
              </h2>
              <p className="text-xs text-slate-300">
                Welcome, <span className="text-white font-semibold">{data?.fullName || "Admin"}</span>! Redirecting you to complete your organization setup...
              </p>
              <Button
                href={`/register/complete?token=${encodeURIComponent(token)}`}
                variant="primary"
                size="lg"
                className="w-full mt-4"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Setup
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function RegisterVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
