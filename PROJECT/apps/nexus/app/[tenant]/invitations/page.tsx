'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Mail, Plus, Send, CheckCircle2, Copy } from 'lucide-react';

export default function TenantInvitationsPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const [email, setEmail] = useState('');
  const [domainRoles, setDomainRoles] = useState({
    hr: 'hr-user',
    finance: 'none',
    it: 'none',
  });
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const token = Math.random().toString(36).substring(2, 15);
    setGeneratedInvite(`${window.location.origin}/invite/${token}`);
    setEmail('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Team Invitations</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Send encrypted invitation tokens with pre-configured domain roles
        </p>
      </div>

      {/* Invite Form */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <h3 className="text-sm font-bold text-white mb-4">Invite New Employee to Workspace</h3>

        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Employee Business Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@tenant.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                HR Domain Role
              </label>
              <select
                value={domainRoles.hr}
                onChange={(e) => setDomainRoles({ ...domainRoles, hr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="none">No Access</option>
                <option value="hr-user">HR User</option>
                <option value="hr-manager">HR Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Finance Domain Role
              </label>
              <select
                value={domainRoles.finance}
                onChange={(e) => setDomainRoles({ ...domainRoles, finance: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="none">No Access</option>
                <option value="finance-user">Finance User</option>
                <option value="finance-manager">Finance Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                IT Domain Role
              </label>
              <select
                value={domainRoles.it}
                onChange={(e) => setDomainRoles({ ...domainRoles, it: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="none">No Access</option>
                <option value="it-user">IT User</option>
                <option value="it-engineer">IT Engineer</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition"
          >
            <Send className="w-4 h-4" />
            <span>Generate & Send Invite</span>
          </button>
        </form>

        {generatedInvite && (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Invitation Link Created</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedInvite}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
              />
              <button
                onClick={() => navigator.clipboard.writeText(generatedInvite)}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
