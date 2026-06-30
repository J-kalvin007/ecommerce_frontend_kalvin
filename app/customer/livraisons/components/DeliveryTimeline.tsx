"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { DeliveryStatus } from "@/modeles/livraisons";
import { DELIVERY_STATUS_MAP } from "@/modeles/livraisons";

interface DeliveryTimelineProps {
  currentStatus: DeliveryStatus;
}

export default function DeliveryTimeline({ currentStatus }: DeliveryTimelineProps) {
  const steps: DeliveryStatus[] = ["pending", "in_transit", "delivered"];
  
  // If cancelled, we show a special state, otherwise we follow the normal steps
  const isCancelled = currentStatus === "cancelled";
  
  // Get current step index (0, 1, 2). If cancelled, we don't highlight normal steps.
  const currentIndex = isCancelled 
    ? -1 
    : steps.indexOf(currentStatus);

  return (
    <div className="relative mt-6 mb-2">
      {/* Background Line */}
      <div className="absolute top-3 left-0 w-full h-1 bg-[#E8E3D8] -translate-y-1/2 rounded-full" />

      {/* Animated Fill Line */}
      {!isCancelled && currentIndex >= 0 && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-3 left-0 h-1 bg-[#10b981] -translate-y-1/2 rounded-full"
        />
      )}

      {isCancelled && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-3 left-0 h-1 bg-[#ef4444] -translate-y-1/2 rounded-full"
        />
      )}

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, idx) => {
          const cfg = DELIVERY_STATUS_MAP[step];
          const isCompleted = !isCancelled && idx <= currentIndex;
          const isCurrent = !isCancelled && idx === currentIndex;

          let nodeColor = "#E8E3D8"; // default inactive
          let iconColor = "#8A9080";
          
          if (isCancelled) {
             nodeColor = "#fee2e2";
             iconColor = "#ef4444";
          } else if (isCompleted) {
             nodeColor = "#10b981"; // completed (green)
             iconColor = "#ffffff";
          }

          return (
            <div key={step} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-white shadow-sm transition-colors duration-500"
                style={{ backgroundColor: nodeColor }}
              >
                {isCompleted && <Check className="h-3 w-3" style={{ color: iconColor }} strokeWidth={3} />}
                {isCancelled && <div className="h-2 w-2 rounded-full bg-[#ef4444]" />}
                {!isCompleted && !isCancelled && <div className="h-2 w-2 rounded-full bg-white" />}
              </motion.div>

              <div className="mt-2 text-center">
                <span className={`text-[12px] font-bold ${isCurrent ? 'text-[#1f241c]' : 'text-[#8A9080]'}`}>
                  {isCancelled && idx === 1 ? "Annulée" : isCancelled ? "" : cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
