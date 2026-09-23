import React from "react";
import { Check } from "lucide-react";
import { Plan } from "@/types/plan";
import { cn } from "@/lib/utils/cn";

export interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string;
  onSelect: (planId: string) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  selectedPlanId,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {plans.map((p) => {
        const isSelected = selectedPlanId === p.id || selectedPlanId === p.slug;
        return (
          <div
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              "p-4 rounded-xl border text-left cursor-pointer transition-all relative",
              isSelected
                ? "border-blue-500 bg-blue-950/40 ring-1 ring-blue-500 shadow-md"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Check className="w-3 h-3" />
              </div>
            )}
            <div className="text-sm font-bold text-white mb-1">{p.name}</div>
            <div className="text-lg font-extrabold text-blue-400 mb-2">
              ${p.price}
              <span className="text-xs text-slate-400 font-normal">/mo</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{p.description}</p>
            <div className="text-[10px] font-mono text-slate-300 space-y-1 border-t border-slate-800/80 pt-2">
              <div>• {p.maxUsers} Max Users</div>
              <div>• {p.maxDomains} Domains</div>
              <div>• {p.maxStorage} GB Vector Store</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
