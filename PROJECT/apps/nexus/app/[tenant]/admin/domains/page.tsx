'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  Layers,
  Globe,
  Plus,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock,
} from 'lucide-react';

export default function AdminDomainsPage() {
  const params = useParams();
  const { organization, domains, activeDomains } = useWorkspace();
  const orgSlug = organization?.slug || (params?.tenant as string) || '';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const domainList = (domains && domains.length > 0)
    ? domains
    : (activeDomains && activeDomains.length > 0)
    ? activeDomains
    : [];

  const domainMappings = [
    {
      hostname: `${orgSlug || 'org'}.nexus.com`,
      type: 'Primary Organization Domain',
      target: `/${orgSlug || 'org'}/org-admin`,
      ssl: 'Active (Let’s Encrypt)',
      status: 'VERIFIED',
      department: 'Organization Control Plane',
    },
    ...domainList.map((d) => ({
      hostname: `${d.slug}.${orgSlug || 'org'}.nexus.com`,
      type: 'Department Application Host',
      target: `/${orgSlug || 'org'}/${d.slug}`,
      ssl: 'Active (Let’s Encrypt)',
      status: 'VERIFIED',
      department: d.name,
    })),
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
            <Globe className="w-4 h-4" />
            <span>DNS & Domain Resolution</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Domains & Hostname Routing
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure dynamic department subdomains (<span className="text-slate-300 font-mono">hr.{orgSlug || 'org'}.nexus.com</span>) and custom enterprise domain hostnames.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition">
            <Plus className="w-4 h-4" />
            <span>Connect Custom Domain</span>
          </button>
        </div>
      </div>

      {/* DNS Configuration Helper Banner */}
      <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Wildcard DNS Provisioning</h3>
            <p className="text-xs text-slate-400">
              Point <span className="font-mono text-indigo-300">*.{orgSlug || 'org'}.nexus.com</span> CNAME to <span className="font-mono text-indigo-300">ingress.nexus.com</span> for instant zero-reload department routing.
            </p>
          </div>
        </div>

        <button
          onClick={() => copyToClipboard(`*.${orgSlug || 'org'}.nexus.com CNAME ingress.nexus.com`, 'cname')}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
        >
          {copiedKey === 'cname' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied DNS Record</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy CNAME Record</span>
            </>
          )}
        </button>
      </div>

      {/* Domain Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Configured Hostnames & Routing Targets</h3>
          <span className="text-xs text-slate-400">Automatic SSL Certificates Enabled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Domain / Subdomain</th>
                <th className="px-4 py-3">Department Target</th>
                <th className="px-4 py-3">SSL Status</th>
                <th className="px-4 py-3">Resolution</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {domainMappings.map((d, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>{d.hostname}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-semibold">{d.department}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                      <Lock className="w-3 h-3" /> {d.ssl}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button className="text-slate-400 hover:text-white transition text-xs font-semibold">
                      Configure →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
