"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  defaultOpenIndex?: number;
  className?: string;
}

export function FAQAccordion({
  items,
  defaultOpenIndex = 0,
  className,
}: FAQAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([defaultOpenIndex]);

  const toggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className={cn("space-y-3 w-full max-w-3xl mx-auto", className)}>
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div
            key={index}
            className={cn(
              "rounded-xl border transition-all duration-200 overflow-hidden",
              isOpen
                ? "border-slate-700 bg-slate-900/80 shadow-md"
                : "border-slate-800/80 bg-slate-900/30 hover:border-slate-700"
            )}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left transition-colors min-h-[52px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-semibold text-slate-100">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180 text-blue-400"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
