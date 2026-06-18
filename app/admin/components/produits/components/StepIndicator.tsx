
// components/admin/produits/StepIndicator.tsx
"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export interface Step {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  completedSteps: number[];
}

export function StepIndicator({ steps, currentStep, onStepClick, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex w-full items-center justify-between">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(idx);
        const isActive = idx === currentStep;
        return (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onStepClick?.(idx)}
              className="flex flex-col items-center gap-1.5 group focus:outline-none"
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isActive
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
                    : isCompleted
                    ? "border-primary bg-primary/10 text-primary cursor-pointer"
                    : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-primary/60 cursor-pointer"
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="stepActiveRing"
                    className="absolute inset-0 rounded-full ring-4 ring-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200",
                  isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-border/60">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: idx < currentStep ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}