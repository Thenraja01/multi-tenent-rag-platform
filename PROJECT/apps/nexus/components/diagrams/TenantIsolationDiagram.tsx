"use client";

import React, { useState } from "react";
import { Building2, Shield, Lock, Users, Database, Layers, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TenantIsolationDiagram() {
  const [selectedTenant, setSelectedTenant] = useState<string>("tenant-a");

  const tenants = [
    {
      id: "tenant-a",
      name: "Enterprise Organization Alpha",
      domains: ["HR Knowledge", "IT Support", "Operations"],
      users: "1,250 Active Users",
      isolation: "Tenant Schema Isolation #001",
      kbSize: "450k Chunks Indexed",
      badge: "Tenant A",
    },
    {
      id: "tenant-b",
      name: "Apex Financial Holdings",
      domains: ["Finance Knowledge", "Legal Knowledge", "Risk & Audit"],
      users: "420 Active Users",
      isolation: "Tenant Schema Isolation #002",
      kbSize: "180k Chunks Indexed",
      badge: "Tenant B",
    },
    {
      id: "tenant-c",
      name: "Vanguard Tech Labs",
      domains: ["IT Support", "Custom Engineering", "Research KB"],
      users: "890 Active Users",
      isolation: "Tenant Schema Isolation #003",
      kbSize: "320k Chunks Indexed",
      badge: "Tenant C",
    },
  ];

  const current = tenants.find((t) => t.id === selectedTenant) || tenants[0];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">
            Multi-Tenant Isolation Architecture
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Zero-Leakage Multi-Tenancy on Shared Platform
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
          <Shield className="w-3.5 h-3.5" />
          <span>Strict Logical & Cryptographic Partitioning</span>
        </div>
      </div>

      {/* Tenant selector tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {tenants.map((t) => {
          const isSelected = selectedTenant === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTenant(t.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all cursor-pointer",
                isSelected
                  ? "border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500 shadow-md"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-indigo-400 font-semibold">
                  {t.badge}
                </span>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-sm font-bold text-white mb-1">{t.name}</div>
              <div className="text-xs text-slate-400">{t.users}</div>
            </button>
          );
        })}
      </div>

      {/* Tenant Partition Details Box */}
      <div className="rounded-xl border border-indigo-500/30 bg-slate-900/80 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">{current.name}</h4>
              <span className="text-xs font-mono text-indigo-300">
                {current.isolation}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <span>{current.users}</span>
            <span>•</span>
            <span>{current.kbSize}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Provisioned Domains</span>
            </div>
            <div className="space-y-1.5">
              {current.domains.map((d: any, i: number) => {
                const name = typeof d === 'string' ? d : (d?.name || d?.slug || d?.id || 'Domain');
                return (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Isolated Knowledge Stores</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Partitioned vector tables and schema-level security prevent cross-tenant queries from ever resolving chunks from other clients.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Independent RBAC Trees</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tenant admins configure their own roles, group mappings, and granular domain permissions with zero global platform coupling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
