"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";

export interface ApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  initialSubdomain: string;
  onConfirmApprove: (subdomain: string, domains: string[]) => Promise<void>;
  loading: boolean;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  isOpen,
  onClose,
  organizationName,
  initialSubdomain,
  onConfirmApprove,
  loading,
}) => {
  const [subdomain, setSubdomain] = useState(initialSubdomain);
  const [domains, setDomains] = useState(["hr", "it", "finance"]);

  const handleApprove = async () => {
    await onConfirmApprove(subdomain, domains);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Approve & Atomically Provision Tenant"
      description={`Configuring tenant environment for ${organizationName}.`}
    >
      <div className="space-y-4 my-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Tenant Subdomain *
          </label>
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 px-3 py-1">
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none flex-1 py-1.5"
            />
            <span className="text-slate-500 font-mono text-xs">.nexusrag.com</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-white block">Atomic Provisioning Actions:</span>
          <div>• Provision isolated database tenant record</div>
          <div>• Seed default domain roles & permissions</div>
          <div>• Generate 72-hour single-use activation link</div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={handleApprove}
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
        >
          {loading ? "Provisioning..." : "Execute Provisioning"}
        </Button>
      </div>
    </Dialog>
  );
};
