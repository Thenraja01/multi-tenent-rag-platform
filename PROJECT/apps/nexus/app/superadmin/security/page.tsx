'use client';

import React from 'react';
import {
  Shield,
  Lock,
  Fingerprint,
  CheckCircle2,
  KeyRound,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Database
} from 'lucide-react';

export default function SuperAdminSecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Security & Isolation Architecture</h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographic tenant isolation, PostgreSQL Row-Level Security (RLS), and Argon2id zero-knowledge hashing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">PostgreSQL Row-Level Security</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every database query executes within an active tenant transaction context, enforcing zero cross-tenant leakage.
          </p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">Active & Enforced</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Fingerprint className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Argon2id Password Hashing</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            State-of-the-art cryptographic password hashing with 64MB memory cost parameters resisting GPU brute-force attacks.
          </p>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">Hardware Protected</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Fine-Grained RBAC & UBAC</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-layered Role-Based and User-Based Access Control matrix governing module execution and knowledge retrieval endpoints.
          </p>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block">100% Policy Bound</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">HMAC-SHA256 Token Lifecycle</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Stateless JWTs signed with rotating tenant secrets, paired with instant Redis token blacklisting for immediate revocation.
          </p>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">Active Rotation</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Vector Knowledge Isolation</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            pgvector embedding chunks are indexed with composite (tenant_id, domain_id, org_id) compound keys to ensure isolated neural search.
          </p>
          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded inline-block">Isolated pgvector</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Fail-Closed Middleware Guard</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Next.js edge middleware resolves hostnames and evaluates authentication before any route handlers execute.
          </p>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block">Enforced at Edge</span>
        </div>
      </div>
    </div>
  );
}
