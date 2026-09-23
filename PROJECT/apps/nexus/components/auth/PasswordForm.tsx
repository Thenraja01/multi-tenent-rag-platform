"use client";

import React, { useState } from "react";
import { Lock, CheckCircle2, Shield, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface PasswordFormProps {
  password: string;
  confirmPassword: string;
  onChange: (field: "password" | "confirmPassword", val: string) => void;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({
  password,
  confirmPassword,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Admin Password *
          </label>
          <Input
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••••••"
            icon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={password}
            onChange={(e) => onChange("password", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Confirm Password *
          </label>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="••••••••••••"
            icon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={confirmPassword}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
          />
        </div>
      </div>

      {/* Password Strength Meter */}
      {password && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Password Strength:</span>
            <span
              className={
                strength >= 3
                  ? "text-emerald-400 font-bold"
                  : strength === 2
                  ? "text-amber-400"
                  : "text-red-400"
              }
            >
              {strength >= 3 ? "Strong (Argon2 / bcrypt ready)" : strength === 2 ? "Moderate" : "Weak"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-950">
            <div className={`h-full ${strength >= 1 ? "bg-red-500" : "bg-slate-800"}`} />
            <div className={`h-full ${strength >= 2 ? "bg-amber-500" : "bg-slate-800"}`} />
            <div className={`h-full ${strength >= 3 ? "bg-emerald-400" : "bg-slate-800"}`} />
            <div className={`h-full ${strength >= 4 ? "bg-blue-400" : "bg-slate-800"}`} />
          </div>
        </div>
      )}
    </div>
  );
};
