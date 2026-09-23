import React from "react";
import { Metadata } from "next";
import {
  Users,
  FileCheck,
  CalendarCheck,
  UserPlus,
  BookOpen,
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "HR Knowledge Solution — AI Knowledge for Human Resources",
  description:
    "Empower HR teams with domain-scoped AI: employee handbooks, leave policy retrieval, onboarding workflows, and permission-isolated employee knowledge.",
};

export default function HRDomainPage() {
  const hrFeatures = [
    {
      title: "Employee Knowledge",
      description: "Structured directory knowledge and department-specific information retrieved strictly within authorized roles.",
      icon: <Users className="w-5 h-5" />,
      badge: "Directory",
    },
    {
      title: "HR Policies & Guidelines",
      description: "Instant answers on company policies, code of conduct, remote work guidelines, and compliance handbooks.",
      icon: <FileCheck className="w-5 h-5" />,
      badge: "Policies",
    },
    {
      title: "Leave & Attendance",
      description: "Query vacation day accruals, parental leave rules, sick leave SOPs, and public holiday schedules accurately.",
      icon: <CalendarCheck className="w-5 h-5" />,
      badge: "Benefits",
    },
    {
      title: "Recruitment Knowledge",
      description: "Candidate rubric lookups, interview question templates, and role-grading guidelines for hiring managers.",
      icon: <UserPlus className="w-5 h-5" />,
      badge: "Hiring",
    },
    {
      title: "Employee Handbook RAG",
      description: "Semantic search across multiple versions of employee handbooks with exact page citations and highlights.",
      icon: <BookOpen className="w-5 h-5" />,
      badge: "Handbook",
    },
    {
      title: "HR AI Assistant",
      description: "Dedicated conversational agent specialized in human resources terminology, polite tone, and scoped context.",
      icon: <Sparkles className="w-5 h-5" />,
      badge: "AI Agent",
    },
    {
      title: "HR Workflows",
      description: "Streamlined workflow assistance for onboarding checklists, performance review timelines, and offboarding SOPs.",
      icon: <GitBranch className="w-5 h-5" />,
      badge: "Workflows",
    },
    {
      title: "Confidentiality & Privacy",
      description: "RBAC boundaries prevent non-HR employees from accessing sensitive executive compensation or confidential reviews.",
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: "Privacy",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb
          items={[
            { label: "Solutions", href: "/solutions" },
            { label: "HR Knowledge" },
          ]}
        />
      </div>

      <HeroSection
        badge="Human Resources Domain"
        title="AI Knowledge for"
        highlightedWord="Human Resources"
        subtitle="Empower your HR team and employees with an isolated, domain-specific AI assistant that answers policy questions and navigates handbooks with zero confidentiality leakage."
        primaryCtaText="Deploy HR AI"
        primaryCtaHref="/contact"
        secondaryCtaText="Explore Platform"
        secondaryCtaHref="/platform"
      />

      {/* Feature Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="HR Capabilities"
            title="Comprehensive HR Intelligence"
            subtitle="Explore how NexusRAG transforms internal HR documentation into an active, verified conversational assistant."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hrFeatures.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
                badge={feat.badge}
                badgeVariant="blue"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive HR Domain Scenario */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 border-blue-500/30 bg-slate-900/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Example HR Query & Source Grounding
                </h4>
                <span className="text-xs text-slate-400">
                  Domain: HR • Role: General Employee • Policy Verified
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="text-blue-400 font-bold">Query:</span> "What is the policy for rollover of unused annual leave days into 2027?"
              </div>
              <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-900/50 text-slate-200 leading-relaxed">
                <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>HR Assistant Response (Grounded in Verified Policy):</span>
                </div>
                According to the 2026 Global Employee Handbook (Section 4.2: Annual Leave Rollover), full-time employees may roll over up to 5 unused annual leave days into the next calendar year. Rolled-over days must be utilized before March 31, 2027.
                <div className="mt-3 pt-2 border-t border-blue-900/40 text-[11px] text-blue-300">
                  📚 Source Citations: [2026_Employee_Handbook.pdf • Page 38, Section 4.2]
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <CTASection
        title="Build an AI-powered HR knowledge experience."
        subtitle="Schedule a demo to see how NexusRAG streamlines employee knowledge access securely."
      />
    </div>
  );
}
