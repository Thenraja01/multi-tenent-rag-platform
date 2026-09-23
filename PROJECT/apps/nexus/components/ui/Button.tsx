import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  icon,
  iconPosition = "right",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none text-center cursor-pointer";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 border border-blue-500/50 hover:shadow-blue-500/30",
    secondary:
      "bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700 hover:border-slate-600",
    outline:
      "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700/80 hover:border-slate-500",
    ghost:
      "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white",
    link: "bg-transparent text-blue-400 hover:text-blue-300 p-0 underline-offset-4 hover:underline",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5 min-h-[36px]",
    md: "text-sm px-4 py-2.5 gap-2 min-h-[44px]",
    lg: "text-base px-6 py-3.5 gap-2.5 min-h-[48px]",
  };

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {content}
    </button>
  );
}
