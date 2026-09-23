'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Receipt,
  Plus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Search,
  Building2,
  Sparkles,
} from 'lucide-react';

export default function InvoicesPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'supernova';
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Form State
  const [vendorName, setVendorName] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [taxAmount, setTaxAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [ocrScanning, setOcrScanning] = useState<boolean>(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['finance-invoices', tenantSlug, statusFilter, approvalFilter],
    queryFn: () =>
      api.finance.getInvoices({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        approval: approvalFilter === 'ALL' ? undefined : approvalFilter,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'REJECT' }) =>
      api.finance.approveInvoice(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => api.finance.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance-dashboard-stats'] });
      setIsUploadOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setVendorName('');
    setInvoiceNumber('');
    setAmount('');
    setTaxAmount('');
    setDueDate('');
  };

  const simulateOCR = () => {
    setOcrScanning(true);
    setTimeout(() => {
      setVendorName('CloudScale Systems Inc');
      setInvoiceNumber(`INV-2026-00${Math.floor(Math.random() * 90) + 10}`);
      setAmount('175000');
      setTaxAmount('31500');
      setDueDate('2026-10-15');
      setOcrScanning(false);
    }, 1200);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(amount || '0') + parseFloat(taxAmount || '0');
    createInvoiceMutation.mutate({
      vendor_name: vendorName,
      invoice_number: invoiceNumber,
      subtotal_amount: parseFloat(amount || '0'),
      tax_amount: parseFloat(taxAmount || '0'),
      total_amount: total,
      due_date: dueDate || new Date().toISOString().split('T')[0],
      line_items: [{ description: 'Managed Cloud Services', quantity: 1, unit_price: parseFloat(amount || '0'), total }],
    });
  };

  const filteredInvoices = invoices.filter((inv: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.vendor_name?.toLowerCase().includes(q)
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
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>Invoices & Accounts Payable</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated OCR vendor extraction, tax calculation, and multi-tier approval chains
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload & OCR Invoice</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 focus-within:border-emerald-500">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number, supplier name..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Payment:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Approval:</span>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Approvals</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Roster Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase font-mono text-slate-500 border-b border-slate-800 bg-slate-950/60">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Subtotal</th>
                <th className="py-3.5 px-4">Tax (GST)</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Approval</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-medium">
              {filteredInvoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{inv.invoice_number}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">{inv.vendor_name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    ₹{inv.subtotal_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    ₹{inv.tax_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ₹{inv.total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{inv.due_date || '—'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inv.payment_status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : inv.payment_status === 'OVERDUE'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {inv.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inv.approval_status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : inv.approval_status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {inv.approval_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.approval_status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => approveMutation.mutate({ id: inv.id, action: 'APPROVE' })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => approveMutation.mutate({ id: inv.id, action: 'REJECT' })}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-semibold transition"
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

      {/* Upload & OCR Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Upload & OCR Vendor Invoice</h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* OCR Drag & Drop Zone */}
            <div
              onClick={simulateOCR}
              className="p-6 rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/10 text-center cursor-pointer transition space-y-2"
            >
              <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-white">
                {ocrScanning ? 'Scanning PDF & Extracting Line Items...' : 'Click to Upload Invoice PDF & Auto-Extract'}
              </p>
              <p className="text-[10px] text-slate-400">
                Nexus OCR parses Vendor GSTIN, Line Items, Tax, and Due Date automatically
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. ABC Technologies Pvt Ltd"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2026-004"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subtotal (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="245000"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GST Tax (₹)</label>
                  <input
                    type="number"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    placeholder="44100"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createInvoiceMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition"
                >
                  {createInvoiceMutation.isPending ? 'Registering...' : 'Register Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
