/**
 * Composant carte KPI pour le Dashboard Admin
 * @module app/admin/components/dashboard/components/KpiCard
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColorClass?: string;
  iconBgClass?: string;
  trend?: {
    value: number; // en pourcentage (ex: 12.5)
    label: string; // ex: "depuis le mois dernier"
    isPositive?: boolean; // si non défini, on déduit si value > 0
  };
  delay?: number;
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-primary",
  iconBgClass = "bg-primary/10",
  trend,
  delay = 0,
  loading = false,
}: KpiCardProps) {
  // Déduire si la tendance est positive ou non (si trend existe)
  const isTrendPositive = trend?.isPositive !== undefined ? trend.isPositive : (trend?.value || 0) > 0;
  const isTrendNeutral = trend?.value === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>
          
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </p>
          )}

          {trend && !loading && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={cn(
                  "flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  isTrendNeutral
                    ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    : isTrendPositive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                )}
              >
                {isTrendNeutral ? (
                  <Minus className="mr-0.5 h-3 w-3" />
                ) : isTrendPositive ? (
                  <ArrowUpRight className="mr-0.5 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-0.5 h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            iconBgClass,
            iconColorClass
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}
