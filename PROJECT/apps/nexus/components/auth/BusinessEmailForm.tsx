"use client";

import React, { useState } from "react";
import { User, Mail, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

export interface BusinessEmailFormProps {
  onSubmit: (data: { fullName: string; businessEmail: string; organizationName: string }) => Promise<void>;
  loading: boolean;
}

export const BusinessEmailForm: React.FC<BusinessEmailFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    businessEmail: "",
    organizationName: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Business email validation check
    const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"];
    const emailDomain = formData.businessEmail.split("@")[1]?.toLowerCase();
    if (emailDomain && freeProviders.includes(emailDomain)) {
      setError("Please use an official corporate business email address (e.g., name@company.com).");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Full Name *
        </label>
        <Input
          type="text"
          required
          placeholder="Jane Doe"
          icon={<User className="w-4 h-4" />}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Official Business Email *
        </label>
        <Input
          type="email"
          required
          placeholder="jane@company.com"
          icon={<Mail className="w-4 h-4" />}
          value={formData.businessEmail}
          onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
        />
        <span className="text-[11px] text-slate-500 mt-1 block">
          We will send a one-time cryptographic verification token to this address.
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Organization Legal / Brand Name *
        </label>
        <Input
          type="text"
          required
          placeholder="Global Enterprises Inc."
          icon={<Building2 className="w-4 h-4" />}
          value={formData.organizationName}
          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full min-h-[44px]"
          disabled={loading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          {loading ? "Creating Request..." : "Continue"}
        </Button>
      </div>
    </form>
  );
};
