"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, ShieldCheck, ArrowRight, Home, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function PendingContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
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

        <Card className="p-8 sm:p-10 border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Status: Pending SuperAdmin Approval</span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Registration Submitted
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
            Your organization request has been successfully submitted. We will review your organization details and dispatch an activation link to your official business email once approved.
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs text-slate-300 space-y-2 mb-6">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/60 font-mono text-[11px]">
              <span>Next Steps:</span>
              <span>Atomic Provisioning</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>SuperAdmin verifies organization entity and requested domains.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>Unique subdomain and tenant schema are atomically provisioned.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>You will receive an activation email with one-time login access.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              href="/"
              variant="outline"
              size="lg"
              className="w-full sm:w-1/2"
              icon={<Home className="w-4 h-4" />}
              iconPosition="left"
            >
              Return Home
            </Button>
            <Button
              href="/superadmin/organization-requests"
              variant="primary"
              size="lg"
              className="w-full sm:w-1/2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              SuperAdmin Portal
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <PendingContent />
    </Suspense>
  );
}
