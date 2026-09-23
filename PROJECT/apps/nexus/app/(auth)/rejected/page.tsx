"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function RejectedPageContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "Organization details could not be verified by compliance policy.";

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl mb-6 group">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
          ◈
        </div>
        <span>Nexus<span className="text-blue-400">RAG</span></span>
      </Link>

      <Card className="p-8 border-red-900/40 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Registration Not Approved</h1>
        <p className="text-xs text-slate-300 mb-4">
          Your organization onboarding request was reviewed and could not be provisioned.
        </p>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-red-400 text-left mb-6">
          <span className="text-slate-500 block mb-1">Feedback from Compliance:</span>
          {reason}
        </div>

        <div className="flex gap-3">
          <Button href="/" variant="outline" size="sm" className="w-1/2" icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left">
            Home
          </Button>
          <Button href="/contact" variant="primary" size="sm" className="w-1/2" icon={<Mail className="w-4 h-4" />}>
            Contact Support
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function RejectedPage() {
  return (
    <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
      <RejectedPageContent />
    </Suspense>
  );
}
