'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Terminal, Server, Code, AlertTriangle, Wrench, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function ItDomainHomePage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';

  const itSections = [
    { title: 'Technical Architecture & Runbooks', href: `/${tenantSlug}/it/docs`, desc: 'System blueprints, deployment topology, and disaster recovery runbooks', icon: Terminal },
    { title: 'API Contracts & Schemas', href: `/${tenantSlug}/it/docs/api`, desc: 'OpenAPI 3.1 specifications, gRPC protos, and webhook payload schemas', icon: Code },
    { title: 'Infrastructure & Server Topology', href: `/${tenantSlug}/it/docs/servers`, desc: 'Kubernetes cluster configs, RDS instances, and load balancer rules', icon: Server },
    { title: 'Incident Post-Mortems & RCAs', href: `/${tenantSlug}/it/incidents`, desc: 'Root cause analyses, past outage retrospectives, and mitigation action items', icon: AlertTriangle },
    { title: 'Interactive Error Diagnostic Agent', href: `/${tenantSlug}/it/troubleshooting`, desc: 'Paste stack traces or log snippets for guided remediation workflows', icon: Wrench },
  ];

  return (
    <RoleGuard domainSlug="it">
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <Terminal className="w-4 h-4" />
              <span>IT & DevOps Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Engineering Knowledge & Diagnostics
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              AI Copilot grounded in system runbooks, OpenAPI specs, Kubernetes configs, and post-mortems.
            </p>
          </div>

          <Link
            href={`/${tenantSlug}/it/chat`}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consult IT Copilot</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {itSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.title}
                href={sec.href}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 w-fit mb-4 group-hover:scale-110 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{sec.title}</h3>
                  <p className="text-xs text-slate-400">{sec.desc}</p>
                </div>

                <div className="mt-6 flex items-center justify-end text-xs text-blue-400 font-semibold gap-1">
                  <span>Open Section</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </RoleGuard>
  );
}
