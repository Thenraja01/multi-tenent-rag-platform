"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PendingApproval } from "@/components/auth/PendingApproval";

function PendingApprovalPageContent() {
  const searchParams = useSearchParams();
  const org = searchParams.get("org") || "Your Enterprise";
  const email = searchParams.get("email") || "";

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
            ◈
          </div>
          <span>Nexus<span className="text-blue-400">RAG</span></span>
        </Link>
      </div>

      <PendingApproval organizationName={org} email={email} />
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="text-center text-white">Loading status...</div>}>
      <PendingApprovalPageContent />
    </Suspense>
  );
}
