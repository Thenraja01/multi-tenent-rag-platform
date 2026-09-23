"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/dialog";

export interface RejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  onConfirmReject: (reason: string) => Promise<void>;
  loading: boolean;
}

export const RejectionDialog: React.FC<RejectionDialogProps> = ({
  isOpen,
  onClose,
  organizationName,
  onConfirmReject,
  loading,
}) => {
  const [reason, setReason] = useState("Information could not be verified according to enterprise onboarding policy.");

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Onboarding Application"
      description={`State the justification for declining ${organizationName}.`}
    >
      <div className="my-4">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Rejection Reason *
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="bg-red-600 hover:bg-red-500 border-red-500"
          disabled={loading}
          onClick={() => onConfirmReject(reason)}
        >
          {loading ? "Rejecting..." : "Confirm Rejection"}
        </Button>
      </div>
    </Dialog>
  );
};
