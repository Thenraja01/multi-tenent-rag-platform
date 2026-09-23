'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUpDown } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyField?: keyof T | ((row: T) => string);
  pageSize?: number;
  emptyMessage?: string;
  emptySubtitle?: string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  pageSize = 10,
  emptyMessage = 'No records found',
  emptySubtitle = 'Try adjusting your filters or search query.',
  isLoading = false,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      const res = valA > valB ? 1 : -1;
      return sortOrder === 'asc' ? res : -res;
    });
  }, [data, sortKey, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getRowKey = (row: T, idx: number): string => {
    if (typeof keyField === 'function') return keyField(row);
    return (row[keyField] as string) || String(idx);
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={cn(
                    'px-4 py-3.5 font-bold uppercase tracking-wider text-slate-400 font-mono text-[11px]',
                    col.sortable && 'cursor-pointer select-none hover:text-white',
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600 hover:text-slate-300" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-1">
                    <p className="text-sm font-bold text-slate-300">{emptyMessage}</p>
                    <p className="text-xs text-slate-500">{emptySubtitle}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={getRowKey(row, idx)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'transition-colors hover:bg-slate-900/50',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5 text-slate-300 align-middle', col.className)}>
                      {col.render ? col.render(row, idx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <div className="font-mono text-[11px]">
            Showing <span className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="text-white font-bold">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="text-white font-bold">{sortedData.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-slate-400 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
