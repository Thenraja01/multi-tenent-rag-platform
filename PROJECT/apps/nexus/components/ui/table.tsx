import React from "react";
import { cn } from "@/lib/utils/cn";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  ...props
}) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("w-full text-left text-sm text-slate-300", className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => (
  <thead
    className={cn("bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800", className)}
    {...props}
  />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => <tbody className={cn("divide-y divide-slate-800/60", className)} {...props} />;

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  ...props
}) => <tr className={cn("hover:bg-slate-800/30 transition-colors", className)} {...props} />;

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => <th className={cn("p-4 font-semibold", className)} {...props} />;

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => <td className={cn("p-4", className)} {...props} />;
