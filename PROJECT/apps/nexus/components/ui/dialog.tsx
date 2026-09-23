import React from "react";
import { Card } from "./Card";
import { cn } from "@/lib/utils/cn";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <Card className={cn("w-full max-w-lg p-6 bg-slate-900 border-slate-800 shadow-2xl relative", className)}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
        >
          ✕
        </button>
        {title && <h3 className="text-lg font-bold text-white mb-1">{title}</h3>}
        {description && <p className="text-xs text-slate-400 mb-4">{description}</p>}
        {children}
      </Card>
    </div>
  );
};
