"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  Briefcase,
  Users,
  MapPin,
  Lock,
  Check,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { publicApi } from "@/lib/api";

function CompleteRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Plans & Domains from Database
  const [plans, setPlans] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);

  // Wizard Step
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    token: token,
    organizationName: "",
    organizationWebsite: "",
    industry: "Technology & Software",
    companySize: "50-250",
    country: "India",
    selectedPlanId: "",
    requestedDomainIds: ["hr", "it"],
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (token) {
      setFormData((prev) => ({ ...prev, token }));
    }

    const loadDynamicData = async () => {
      try {
        const [fetchedPlans, fetchedDomains] = await Promise.all([
          publicApi.getPlans(),
          publicApi.getDomains(),
        ]);
        setPlans(fetchedPlans);
        setDomains(fetchedDomains);

        // Pre-select first plan if available
        if (fetchedPlans && fetchedPlans.length > 0) {
          setFormData((prev) => ({
            ...prev,
            selectedPlanId: fetchedPlans[1]?.id || fetchedPlans[0]?.id,
          }));
        }
      } catch (e) {
        console.error("Error loading plans/domains:", e);
      } finally {
        setFetchingData(false);
      }
    };

    loadDynamicData();
  }, [token]);

  const toggleDomain = (domainSlugOrId: string) => {
    setFormData((prev) => {
      const exists = prev.requestedDomainIds.includes(domainSlugOrId);
      if (exists) {
        return {
          ...prev,
          requestedDomainIds: prev.requestedDomainIds.filter((d) => d !== domainSlugOrId),
        };
      } else {
        return {
          ...prev,
          requestedDomainIds: [...prev.requestedDomainIds, domainSlugOrId],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await publicApi.completeRegistration({
        token: formData.token,
        organization_website: formData.organizationWebsite,
        industry: formData.industry,
        company_size: formData.companySize,
        country: formData.country,
        selected_plan_id: formData.selectedPlanId,
        requested_domain_ids: formData.requestedDomainIds,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      router.push(`/register/pending?token=${encodeURIComponent(formData.token)}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration completion failed.");
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white font-bold text-xl mb-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
              ◈
            </div>
            <span>
              Nexus<span className="text-blue-400">RAG</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Complete Organization Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure your enterprise workspace parameters, select business domains, and choose a plan.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { stepNum: 1, label: "Organization" },
            { stepNum: 2, label: "Domains & Plan" },
            { stepNum: 3, label: "Security" },
          ].map((s) => (
            <div key={s.stepNum} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(s.stepNum)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  step === s.stepNum
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : step > s.stepNum
                    ? "bg-slate-800 text-emerald-400"
                    : "bg-slate-900 text-slate-500"
                }`}
              >
                <span>{s.stepNum}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {s.stepNum < 3 && <div className="w-4 h-0.5 bg-slate-800" />}
            </div>
          ))}
        </div>

        <Card className="p-6 sm:p-10 border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="p-3.5 mb-6 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: Organization Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    Step 1: Organization Information
                  </h3>
                  <p className="text-xs text-slate-400">
                    Provide verified details regarding your enterprise entity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Company Website / Domain
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://company.com"
                        value={formData.organizationWebsite}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            organizationWebsite: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Industry
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                      >
                        <option value="Technology & Software">Technology & Software</option>
                        <option value="Financial Services & Banking">Financial Services & Banking</option>
                        <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                        <option value="Legal & Professional Services">Legal & Professional Services</option>
                        <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                        <option value="Retail & E-commerce">Retail & E-commerce</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Company Size
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.companySize}
                        onChange={(e) =>
                          setFormData({ ...formData, companySize: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                      >
                        <option value="1-50">1 - 50 Employees</option>
                        <option value="50-250">50 - 250 Employees</option>
                        <option value="250-1000">250 - 1,000 Employees</option>
                        <option value="1000+">1,000+ Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Country / Region
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="United States / India"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setStep(2)}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Choose Domains & Plan
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Domains & Plans Selection (Dynamic from Database) */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    Step 2: Choose Business Domains & Pricing Tier
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select which departmental knowledge areas you wish to provision.
                  </p>
                </div>

                {/* Dynamic Domain Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                    Select Requested Business Domains
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {domains.map((dom) => {
                      const isSelected = formData.requestedDomainIds.includes(dom.slug) || formData.requestedDomainIds.includes(dom.id);
                      return (
                        <button
                          key={dom.id}
                          type="button"
                          onClick={() => toggleDomain(dom.slug)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-blue-500 bg-blue-950/40 ring-1 ring-blue-500"
                              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {dom.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {dom.slug.toUpperCase()}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center ${
                              isSelected ? "bg-blue-600 text-white" : "border border-slate-700"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Plans Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                    Select Pricing & Resource Tier (From Database)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {plans.map((p) => {
                      const isSelected = formData.selectedPlanId === p.id || formData.selectedPlanId === p.slug;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setFormData({ ...formData, selectedPlanId: p.id })}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-950/40 ring-1 ring-blue-500 shadow-md"
                              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-white">{p.name}</span>
                            <span className="text-xs font-bold text-blue-400">
                              ${p.price}<span className="text-[10px] text-slate-400">/mo</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-3">{p.description}</p>
                          <div className="text-[10px] font-mono text-slate-300 space-y-1">
                            <div>• Up to {p.max_users} Users</div>
                            <div>• Up to {p.max_domains} Domains</div>
                            <div>• {p.max_storage} GB Vector Storage</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setStep(3)}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Security Setup
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Security & Password Setup */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    Step 3: Security & Password Setup
                  </h3>
                  <p className="text-xs text-slate-400">
                    Create your administrator credentials. Your organization will be provisioned upon SuperAdmin review.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="font-semibold text-white mb-1">
                    Onboarding Summary:
                  </div>
                  <div>
                    • Requested Domains:{" "}
                    <span className="text-blue-400 font-mono">
                      {formData.requestedDomainIds.join(", ").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    • Approval Policy:{" "}
                    <span className="text-emerald-400">
                      SuperAdmin Review Required before Tenant Activation
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    {loading ? "Submitting Request..." : "Submit for SuperAdmin Review"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <CompleteRegistrationContent />
    </Suspense>
  );
}
