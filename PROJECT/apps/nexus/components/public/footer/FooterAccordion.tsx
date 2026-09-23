"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FooterSectionProps {
  title: string;
  links: Array<{ title: string; href: string }>;
}

export const FooterAccordion: React.FC<FooterSectionProps> = ({ title, links }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-900 md:border-none pb-2 md:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-xs font-bold text-white uppercase tracking-wider md:cursor-default"
      >
        <span>{title}</span>
        <ChevronDown className={cn("w-4 h-4 md:hidden transition-transform", open && "rotate-180")} />
      </button>

      <ul className={cn("space-y-2 mt-1", !open && "hidden md:block")}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
