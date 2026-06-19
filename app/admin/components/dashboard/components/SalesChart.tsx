/**
 * Graphique de l'évolution des ventes (CA) sur le temps
 * @module app/admin/components/dashboard/components/SalesChart
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SalesChartProps {
  data: {
    date: string; // Ex: '15 Juin'
    revenue: number;
    ordersCount: number;
  }[];
  loading?: boolean;
}

export function SalesChart({ data, loading = false }: SalesChartProps) {
  // Option pour un affichage plus "doux" si pas de données
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    // Données fictives vides pour structure si aucune donnée
    return Array.from({ length: 7 }).map((_, i) => ({
      date: `Jour ${i + 1}`,
      revenue: 0,
      ordersCount: 0,
    }));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex h-full min-h-[350px] w-full flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Aperçu des revenus
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Évolution du chiffre d'affaires sur les 7 derniers jours
        </p>
      </div>

      <div className="relative flex-1 min-h-[250px] w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-slate-700/50"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const rev = payload[0].payload.revenue;
                    const count = payload[0].payload.ordersCount;
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-lg">
                        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                          {payload[0].payload.date}
                        </p>
                        <div className="space-y-1">
                          <p className="flex items-center justify-between gap-4 text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Revenus</span>
                            <span className="font-bold text-primary">
                              {formatCurrency(rev, "FCFA")}
                            </span>
                          </p>
                          <p className="flex items-center justify-between gap-4 text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Commandes</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {count}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary, #6366f1)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary, #6366f1)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
