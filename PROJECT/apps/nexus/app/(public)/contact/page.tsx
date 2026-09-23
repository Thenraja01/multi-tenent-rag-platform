"use client";

import React, { useState } from "react";
import {
  Mail,
  Building2,
  Users,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    companySize: "50-250",
    interestedDomain: "Full Platform Overview",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Contact & Demo" }]} />
      </div>

      <HeroSection
        badge="Enterprise Engagement"
        title="Let's Build Your"
        highlightedWord="Enterprise AI Knowledge Platform"
        subtitle="Schedule a customized technical demonstration or discuss multi-tenant deployment architectures with our enterprise solutions team."
        primaryCtaText="Request Demo"
        primaryCtaHref="#contact-form"
        secondaryCtaText="Explore Solutions"
        secondaryCtaHref="/solutions"
      />

      {/* Form Section */}
      <section id="contact-form" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 sm:p-10 border-slate-800 bg-slate-900/80 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Demo Request Received
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{formData.name}</span>. An enterprise solutions engineer will reach out to <span className="text-blue-400 font-mono">{formData.email}</span> shortly.
                </p>
                <div className="pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Request an Enterprise Technical Demo
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Fill out the form below and we will tailor the demonstration to your specific domains and knowledge architecture.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Organization / Company *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Global Enterprises Inc."
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Company Size
                    </label>
                    <select
                      value={formData.companySize}
                      onChange={(e) =>
                        setFormData({ ...formData, companySize: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                    >
                      <option value="1-50">1 - 50 Employees</option>
                      <option value="50-250">50 - 250 Employees</option>
                      <option value="250-1000">250 - 1,000 Employees</option>
                      <option value="1000+">1,000+ Enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Primary Domain of Interest
                  </label>
                  <select
                    value={formData.interestedDomain}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interestedDomain: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[44px]"
                  >
                    <option value="Full Platform Overview">
                      Full Platform Overview & Multi-Tenancy
                    </option>
                    <option value="HR Knowledge">HR Knowledge & Policies</option>
                    <option value="Finance Intelligence">
                      Finance & Invoice Intelligence
                    </option>
                    <option value="IT Support">IT Support & Incident Resolution</option>
                    <option value="Legal Knowledge">
                      Legal Knowledge & Policy Retrieval
                    </option>
                    <option value="Operations SOPs">
                      Operations & Facility SOPs
                    </option>
                    <option value="Custom Domain Blueprint">
                      Custom Domain Architecture
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Your Requirements / Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your document formats, security requirements, or domain workflows..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Request Demo
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Your enterprise data and contact details are kept strictly confidential.</span>
                </div>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
