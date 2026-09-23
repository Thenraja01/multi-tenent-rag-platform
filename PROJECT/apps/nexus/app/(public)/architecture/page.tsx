import React from "react";
import { Metadata } from "next";
import {
  Server,
  Layers,
  Database,
  Cpu,
  Network,
  Shield,
  GitBranch,
  Terminal,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { HeroSection } from "@/components/ui/HeroSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Architecture — Modular Platform & Ecosystem Design",
  description:
    "Explore the technical architecture of NexusRAG: decoupled domain microservices, shared core platform infrastructure, and isolated pgvector indexes.",
};

export default function ArchitecturePage() {
  const architecturalLayers = [
    {
      layer: "Layer 1: Gateway & Reverse Proxy",
      title: "NGINX Routing & SSL Gateway",
      desc: "Routes incoming requests to the Core Platform (API gateway) and dedicated Domain Applications with SSL termination and rate limiting.",
      icon: <Network className="w-5 h-5 text-blue-400" />,
    },
    {
      layer: "Layer 2: Core Platform Services",
      title: "FastAPI Identity, Auth & Ingestion Core",
      desc: "Centralized engine handling tenant provisioning, user JWT tokens, multi-format OCR pipelines, semantic chunking, and embedding generation.",
      icon: <Server className="w-5 h-5 text-indigo-400" />,
    },
    {
      layer: "Layer 3: Domain Application Tier",
      title: "Autonomous Domain Micro-Apps",
      desc: "Independent micro-applications (HR, Finance, IT, Legal, Operations) containing domain-specific business logic, prompt templates, and agent tools.",
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
    },
    {
      layer: "Layer 4: Data & Vector Persistence",
      title: "PostgreSQL & Partitioned pgvector Indexes",
      desc: "Relational data and high-dimensional embeddings stored in schema-partitioned tables with HNSW vector indexing for low-latency similarity queries.",
      icon: <Database className="w-5 h-5 text-purple-400" />,
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <Breadcrumb items={[{ label: "Architecture" }]} />
      </div>

      <HeroSection
        badge="Technical Blueprint"
        title="Built as a Platform,"
        highlightedWord="Designed as an Ecosystem"
        subtitle="NexusRAG decouples common infrastructure from domain-specific intelligence. Business domains evolve independently with their own databases, business logic, and AI agents while sharing platform-grade security and ingestion."
        primaryCtaText="Explore RAG Pipeline"
        primaryCtaHref="/rag"
        secondaryCtaText="View Platform Services"
        secondaryCtaHref="/platform"
      />

      {/* Interactive Core Architecture Diagram */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Ecosystem Blueprint"
            title="Core Platform vs Domain Micro-Apps"
            subtitle="Understand the strict separation of concerns between shared platform services and independent domain applications."
          />
          <ArchitectureDiagram />
        </div>
      </section>

      {/* Layer-by-Layer Architectural Breakdown */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge="System Stack"
            title="Layered Architecture Overview"
            subtitle="A clean breakdown of each tier within the NexusRAG enterprise deployment."
          />

          <div className="space-y-4">
            {architecturalLayers.map((layer, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    {layer.icon}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider block mb-0.5">
                      {layer.layer}
                    </span>
                    <h4 className="text-base font-bold text-white mb-1">
                      {layer.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                      {layer.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Architect Your Enterprise AI Strategy"
        subtitle="Connect with our systems architects to evaluate deployment options and integration points."
      />
    </div>
  );
}
