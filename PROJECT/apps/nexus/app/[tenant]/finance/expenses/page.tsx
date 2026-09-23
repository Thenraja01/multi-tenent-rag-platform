'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  FileSpreadsheet,
  Plus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  User,
  Tag,
  Paperclip,
  Search,
} from 'lucide-react';

const EXPENSE_CATEGORIES = ['All', 'Travel', 'Software', 'Office', 'Meals', 'Utilities', 'General'];

export default function ExpensesPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'supernova';
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);

  // Submit form state
  const [employeeName, setEmployeeName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Travel');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['finance-expenses', tenantSlug, selectedCategory, selectedStatus],
    queryFn: () =>
      api.finance.getExpenses({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'REJECT' }) =>
      api.finance.approveExpense(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.finance.submitExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
      setIsSubmitOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setEmployeeName('');
    setTitle('');
    setCategory('Travel');
    setAmount('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      employee_name: employeeName,
      title,
      category,
      amount: parseFloat(amount || '0'),
      notes,
    });
  };

  const filteredExpenses = expenses.filter((exp: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      exp.employee_name?.toLowerCase().includes(q) ||
      exp.title?.toLowerCase().includes(q) ||
      exp.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Link href={`/${tenantSlug}/finance`} className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Finance Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Employee Expenses & Reimbursements</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Claim auditing, per-diem compliance checks, receipt attachments, and disbursement status
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Expense Claim</span>
        </button>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claim, employee..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-44"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REIMBURSED">Reimbursed</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase font-mono text-slate-500 border-b border-slate-800 bg-slate-950/60">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Claim Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-medium">
              {filteredExpenses.map((exp: any) => (
                <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{exp.employee_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    <div>{exp.title}</div>
                    {exp.notes && <div className="text-[10px] text-slate-500">{exp.notes}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{exp.expense_date || '—'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        exp.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : exp.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : exp.status === 'REIMBURSED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {exp.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => approveMutation.mutate({ id: exp.id, action: 'APPROVE' })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => approveMutation.mutate({ id: exp.id, action: 'REJECT' })}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Claim Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Submit Expense Claim</h3>
              </div>
              <button onClick={() => setIsSubmitOpen(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. Raja"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expense Title / Description</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Travel tickets to Bangalore client meeting"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    {EXPENSE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="4500"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Business Purpose</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details regarding project code, flight details..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
