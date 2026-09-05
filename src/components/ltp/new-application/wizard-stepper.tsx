"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface WizardStep {
  id: number;
  label: string;
}

export function WizardStepper({
  steps,
  currentStep,
  className,
}: {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-1 px-1", className)}>
      {steps.map((s, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isUpcoming = idx > currentStep;
        return (
          <React.Fragment key={s.id}>
            <button
              type="button"
              onClick={() => idx <= currentStep && undefined}
              disabled={idx > currentStep}
              className="group flex items-center gap-2 disabled:cursor-not-allowed"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all",
                  isCompleted && "border-success bg-success text-success-foreground",
                  isCurrent && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/10",
                  isUpcoming && "border-border bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-4" /> : idx + 1}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium leading-tight sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 min-w-[8px] rounded-full transition-colors",
                  idx < currentStep ? "bg-success" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
