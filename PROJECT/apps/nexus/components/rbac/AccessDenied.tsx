import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export interface AccessDeniedProps {
  requiredPermission?: string;
  message?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredPermission,
  message = "You do not have the required domain role or permission to access this resource.",
}) => {
  return (
    <Card className="p-8 text-center max-w-md mx-auto border-red-900/40 bg-slate-900/80 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Access Restricted</h3>
      <p className="text-xs text-slate-300 mb-4">{message}</p>
      {requiredPermission && (
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-red-400 mb-6">
          Required: {requiredPermission}
        </div>
      )}
      <Button href="/dashboard" variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left">
        Return to Dashboard
      </Button>
    </Card>
  );
};
