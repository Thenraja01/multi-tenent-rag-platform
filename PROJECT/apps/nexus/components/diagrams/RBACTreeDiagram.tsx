"use client";

import React, { useState } from "react";
import { ShieldCheck, ChevronDown, UserCheck, Key, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleNode {
  title: string;
  scope: string;
  permissions: string[];
}

interface DomainRoleGroup {
  domain: string;
  roles: RoleNode[];
}

export function RBACTreeDiagram() {
  const [openAccordion, setOpenAccordion] = useState<string>("hr");

  const domainRoles: DomainRoleGroup[] = [
    {
      domain: "HR Domain Roles",
      roles: [
        {
          title: "HR Admin",
          scope: "Full HR Domain Scope",
          permissions: ["Manage HR users", "Ingest policies", "Approve HR workflows", "Access full HR KB"],
        },
        {
          title: "HR Manager",
          scope: "Departmental Scope",
          permissions: ["Query employee records", "Trigger leave workflows", "View team guidelines"],
        },
        {
          title: "HR Knowledge Manager",
          scope: "Document Management",
          permissions: ["Upload handbook docs", "Curate FAQs", "Manage chunk metadata"],
        },
        {
          title: "HR User (Employee)",
          scope: "General Employee Scope",
          permissions: ["Query public HR policy", "Ask general benefits FAQ", "Read leave guidelines"],
        },
      ],
    },
    {
      domain: "Finance Domain Roles",
      roles: [
        {
          title: "Finance Admin",
          scope: "Full Finance Domain Scope",
          permissions: ["Manage billing data", "Configure financial models", "Full audit access"],
        },
        {
          title: "Finance Manager",
          scope: "Approvals & Reporting",
          permissions: ["Query quarterly reports", "Expense approval assist", "Tax policy access"],
        },
        {
          title: "Finance Analyst",
          scope: "Analysis & Metrics",
          permissions: ["Query historical P&L", "Retrieve invoice data", "Run analytical prompts"],
        },
        {
          title: "Finance User",
          scope: "Standard Financial Inquiries",
          permissions: ["Query expense submission rules", "Check reimbursement SOPs"],
        },
      ],
    },
    {
      domain: "IT Domain Roles",
      roles: [
        {
          title: "IT Admin",
          scope: "Full IT Architecture Scope",
          permissions: ["Manage infra documents", "Rotate API keys", "Access server logs"],
        },
        {
          title: "IT Manager",
          scope: "Service Operations",
          permissions: ["Query incident runbooks", "Manage escalation rules", "Review ticket history"],
        },
        {
          title: "IT Engineer",
          scope: "Engineering & Infra",
          permissions: ["Query server runbooks", "API troubleshooting assist", "Access architecture KB"],
        },
        {
          title: "IT User",
          scope: "Internal Helpdesk Client",
          permissions: ["Query self-service troubleshooting", "Submit ticket via AI", "Read software FAQs"],
        },
      ],
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 backdrop-blur-md">
      {/* Root Node: Tenant Admin */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold text-sm sm:text-base shadow-lg shadow-blue-950/40">
          <Key className="w-4 h-4 text-blue-400" />
          <span>Tenant Administrator (Root Organization Scope)</span>
        </div>
        <span className="text-xs text-slate-400 mt-1.5">
          Delegates autonomous domain-level administrative and retrieval rights
        </span>
      </div>

      {/* Desktop Multi-Column Tree View */}
      <div className="hidden md:grid grid-cols-3 gap-5">
        {domainRoles.map((grp, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  {grp.domain}
                </h4>
              </div>

              <div className="space-y-4">
                {grp.roles.map((role, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">
                        {role.title}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded">
                        {role.scope}
                      </span>
                    </div>
                    <ul className="space-y-1 mt-2">
                      {role.permissions.map((p, pIdx) => (
                        <li
                          key={pIdx}
                          className="text-[11px] text-slate-400 flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Accordion Tree View */}
      <div className="md:hidden space-y-3">
        {domainRoles.map((grp, idx) => {
          const key = grp.domain.toLowerCase().replace(/\s+/g, "-");
          const isOpen = openAccordion === key;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenAccordion(isOpen ? "" : key)}
                className="w-full flex items-center justify-between p-4 text-left transition-colors min-h-[48px]"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-white">
                    {grp.domain}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200",
                    isOpen && "rotate-180 text-blue-400"
                  )}
                />
              </button>

              {isOpen && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-800/80 mt-1">
                  {grp.roles.map((role, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3 rounded-lg bg-slate-950/80 border border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">
                          {role.title}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-400">
                          {role.scope}
                        </span>
                      </div>
                      <ul className="space-y-1 mt-2">
                        {role.permissions.map((p, pIdx) => (
                          <li
                            key={pIdx}
                            className="text-[11px] text-slate-300 flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 text-center">
        Permissions are evaluated in-memory before vector index queries and applied to citation results.
      </div>
    </div>
  );
}
