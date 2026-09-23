'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  UserCheck,
  Mail,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Send,
  Shield,
  Building2,
} from 'lucide-react';

export default function AdminInvitationsPage() {
  const params = useParams();
  const { organization } = useWorkspace();
  const orgSlug = organization?.slug || (params?.tenant as string) || 'org';

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Department Specialist');
  const [inviteDept, setInviteDept] = useState('hr');

  const [invitations, setInvitations] = useState([
    {
      id: 'inv-001',
      email: `sarah.connor@${orgSlug}.com`,
      role: 'HR Specialist',
      department: 'Human Resources',
      sentAt: '2 days ago',
      expiresIn: '5 days',
      status: 'PENDING',
    },
    {
      id: 'inv-002',
      email: `marcus.wright@${orgSlug}.com`,
      role: 'Finance Controller',
      department: 'Finance',
      sentAt: 'Yesterday',
      expiresIn: '6 days',
      status: 'PENDING',
    },
    {
      id: 'inv-003',
      email: `trinity@${orgSlug}.com`,
      role: 'Lead IT Architect',
      department: 'Information Technology',
      sentAt: '3 hours ago',
      expiresIn: '7 days',
      status: 'PENDING',
    },
  ]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInvitations([
      ...invitations,
      {
        id: `inv-00${invitations.length + 1}`,
        email: inviteEmail,
        role: inviteRole,
        department: inviteDept.toUpperCase(),
        sentAt: 'Just now',
        expiresIn: '7 days',
        status: 'PENDING',
      },
    ]);

    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
            <Mail className="w-4 h-4" />
            <span>Member Onboarding</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pending Invitations & Direct Invites
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Invite colleagues directly into departmental roles with pre-configured ACL scopes and domain entitlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Send New Invitation</span>
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Invite Organization Member</h3>
            <p className="text-xs text-slate-400">
              An invitation token link will be dispatched with pre-assigned department membership.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@domain.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Department</label>
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="hr">Human Resources (HR)</option>
                  <option value="finance">Finance & Accounting</option>
                  <option value="it">Information Technology (IT)</option>
                  <option value="legal">Legal & Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="Department Specialist">Department Specialist</option>
                  <option value="Department Manager">Department Manager</option>
                  <option value="Department Viewer">Department Viewer</option>
                  <option value="Organization Admin">Organization Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invitations Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white">Pending Dispatch Records</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Recipient Email</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Sent Time</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>{inv.email}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-semibold">{inv.role}</td>
                  <td className="px-4 py-3.5 text-slate-400">{inv.department}</td>
                  <td className="px-4 py-3.5 text-slate-400">{inv.sentAt}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{inv.expiresIn}</td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button className="text-indigo-400 hover:text-indigo-300 font-semibold">
                      Resend
                    </button>
                    <button className="text-rose-400 hover:text-rose-300 font-semibold">
                      Revoke
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
