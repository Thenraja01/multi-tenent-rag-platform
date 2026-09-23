"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

export interface NavDropdownProps {
  item: NavItem;
  pathname: string;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({ item, pathname }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isChildActive = item.children?.some((c) => pathname.startsWith(c.href));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
          isChildActive || open
            ? "text-blue-400 bg-blue-950/40"
            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
        )}
      >
        <span>{item.title}</span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180 text-blue-400")}
        />
      </button>

      {open && item.children && (
        <div className="absolute top-full left-0 mt-1 w-72 p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {item.children.map((child) => {
              const active = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block p-2.5 rounded-lg text-left transition-all",
                    active
                      ? "bg-blue-600/10 border border-blue-500/20 text-blue-400"
                      : "hover:bg-slate-800/60 text-slate-200"
                  )}
                >
                  <div className="text-xs font-bold text-white mb-0.5">{child.title}</div>
                  {child.description && (
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {child.description}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
