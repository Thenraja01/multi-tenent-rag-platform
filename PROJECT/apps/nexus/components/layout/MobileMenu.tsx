"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ChevronDown, Sparkles, Shield, Layers, FileText, ArrowRight } from "lucide-react";
import { NAV_PLATFORM, NAV_SOLUTIONS, NAV_SECURITY } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 animate-in fade-in duration-200">
      {/* Top Bar inside Drawer */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
            ◈
          </div>
          <span>NexusRAG</span>
        </Link>
        <button
          onClick={onClose}
          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
        {/* Platform Accordion */}
        <div className="border border-slate-850 rounded-xl bg-slate-900/40 overflow-hidden">
          <button
            onClick={() => toggleSection("platform")}
            className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-100 min-h-[48px] focus:outline-none"
          >
            <span>Platform</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                openSection === "platform" && "rotate-180 text-blue-400"
              )}
            />
          </button>
          {openSection === "platform" && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-800/60 pt-2">
              {NAV_PLATFORM.map((item: { title: string; href: string }, idx: number) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="block p-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors min-h-[44px] flex items-center"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Solutions Accordion */}
        <div className="border border-slate-850 rounded-xl bg-slate-900/40 overflow-hidden">
          <button
            onClick={() => toggleSection("solutions")}
            className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-100 min-h-[48px] focus:outline-none"
          >
            <span>Solutions</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                openSection === "solutions" && "rotate-180 text-blue-400"
              )}
            />
          </button>
          {openSection === "solutions" && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-800/60 pt-2">
              <Link
                href="/solutions"
                onClick={onClose}
                className="block p-2 rounded-lg text-sm font-semibold text-blue-400 hover:bg-slate-800/60 transition-colors min-h-[44px] flex items-center"
              >
                All Solutions Overview →
              </Link>
              {NAV_SOLUTIONS.map((item: { title: string; href: string }, idx: number) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="block p-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors min-h-[44px] flex items-center"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Enterprise RAG Direct Link */}
        <Link
          href="/rag"
          onClick={onClose}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-850 bg-slate-900/40 text-slate-100 font-semibold min-h-[48px] hover:bg-slate-800/60 transition-colors"
        >
          <span>Enterprise RAG</span>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
            Pipeline
          </span>
        </Link>

        {/* Security Accordion */}
        <div className="border border-slate-850 rounded-xl bg-slate-900/40 overflow-hidden">
          <button
            onClick={() => toggleSection("security")}
            className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-100 min-h-[48px] focus:outline-none"
          >
            <span>Security</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                openSection === "security" && "rotate-180 text-blue-400"
              )}
            />
          </button>
          {openSection === "security" && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-800/60 pt-2">
              {NAV_SECURITY.map((item: { title: string; href: string }, idx: number) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="block p-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors min-h-[44px] flex items-center"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Link */}
        <Link
          href="/pricing"
          onClick={onClose}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-850 bg-slate-900/40 text-slate-100 font-semibold min-h-[48px] hover:bg-slate-800/60 transition-colors"
        >
          <span>Pricing</span>
        </Link>

        {/* Additional useful links */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link
            href="/use-cases"
            onClick={onClose}
            className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 text-center hover:text-white"
          >
            Use Cases
          </Link>
          <Link
            href="/faq"
            onClick={onClose}
            className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 text-center hover:text-white"
          >
            FAQ
          </Link>
        </div>

        {/* Bottom CTA Block */}
        <div className="pt-6 mt-4 border-t border-slate-800 space-y-3">
          <Link
            href="/login"
            onClick={onClose}
            className="block text-center py-3 text-sm font-medium text-slate-300 hover:text-white min-h-[44px]"
          >
            Sign In
          </Link>
          <Button
            href="/contact"
            variant="primary"
            size="lg"
            className="w-full min-h-[48px]"
            onClick={onClose}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
