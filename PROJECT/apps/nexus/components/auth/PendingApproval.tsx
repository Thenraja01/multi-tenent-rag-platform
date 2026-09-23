import React from "react";
import Link from "next/link";
import { Clock, Home, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export interface PendingApprovalProps {
  organizationName?: string;
  email?: string;
}

export const PendingApproval: React.FC<PendingApprovalProps> = ({
  organizationName = "Your Organization",
  email,
}) => {
  return (
    <Card className="p-8 text-center max-w-lg mx-auto border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
        <Clock className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Status: Pending Approval</span>
      </div>

      <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
        Registration Submitted
      </h1>
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
        Your onboarding request for <span className="text-white font-semibold">{organizationName}</span> has been submitted. We will verify your credentials and send an activation link to <span className="text-blue-400 font-mono">{email || "your work email"}</span> once approved.
      </p>

      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs text-slate-300 space-y-2 mb-6">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <span>SuperAdmin review of organization profile & domain scope.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <span>Atomic provisioning of isolated tenant schema & vector store.</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          href="/"
          variant="outline"
          size="md"
          className="w-full sm:w-1/2"
          icon={<Home className="w-4 h-4" />}
          iconPosition="left"
        >
          Return Home
        </Button>
        <Button
          href="/superadmin/organization-requests"
          variant="primary"
          size="md"
          className="w-full sm:w-1/2"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          SuperAdmin Queue
        </Button>
      </div>
    </Card>
  );
};
