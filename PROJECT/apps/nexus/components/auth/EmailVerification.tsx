"use client";

import React, { useState } from "react";
import { MailCheck, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

export interface EmailVerificationProps {
  email: string;
  onVerify: (token: string) => Promise<void>;
  onResend?: () => Promise<void>;
  initialToken?: string;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerify,
  onResend,
  initialToken = "",
}) => {
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setError(null);
    setLoading(true);

    try {
      await onVerify(token.trim());
    } catch (err: any) {
      setError(err?.message || "Invalid or expired verification token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center py-4 space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
        <MailCheck className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white">Check Your Business Email</h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto">
          We sent a verification link and token to{" "}
          <span className="text-blue-400 font-mono font-semibold">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto text-left">
        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Verification Token
          </label>
          <Input
            type="text"
            required
            placeholder="Paste your 32-character token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading || !token.trim()}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>
    </div>
  );
};
