import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface Step {
  id: number;
  label: string;
}

export interface RegistrationStepperProps {
  steps: Step[];
  currentStep: number;
}

export const RegistrationStepper: React.FC<RegistrationStepperProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : isCompleted
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-slate-900 text-slate-500 border border-slate-800"
              )}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span>{step.id}</span>
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "w-4 h-0.5",
                  isCompleted ? "bg-emerald-500/50" : "bg-slate-800"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
