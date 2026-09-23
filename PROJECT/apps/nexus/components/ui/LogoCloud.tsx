import React from "react";
import { Server, Database, Shield, Cpu, Network, Layers, GitBranch, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoCloudProps {
  title?: string;
  className?: string;
}

export function LogoCloud({
  title = "ARCHITECTED FOR ENTERPRISE ECOSYSTEM INTEGRATIONS",
  className,
}: LogoCloudProps) {
  const integrations = [
    { name: "PostgreSQL & pgvector", icon: Database },
    { name: "FastAPI Backend", icon: Server },
    { name: "Domain Micro-Apps", icon: Layers },
    { name: "Role-Based ACLs", icon: Shield },
    { name: "LLM Embeddings", icon: Cpu },
    { name: "Vector Indexing", icon: Network },
    { name: "Document OCR", icon: Terminal },
    { name: "Audit Telemetry", icon: GitBranch },
  ];

  return (
    <div className={cn("py-12 border-y border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent transition-colors duration-200", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && (
          <p className="text-[11px] font-mono tracking-widest text-slate-500 uppercase mb-8">
            {title}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 items-center justify-center">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
              >
                <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-400 text-center line-clamp-1">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
