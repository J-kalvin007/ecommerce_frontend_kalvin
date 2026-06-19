/**
 * Graphique circulaire de la répartition des commandes par statut
 * @module app/admin/components/dashboard/components/OrderStatusChart
 */

"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface OrderStatusChartProps {
  data: {
    name: string; // Ex: 'En attente'
    value: number; // Ex: 15 (nombre de commandes)
    color: string; // Ex: '#f59e0b'
  }[];
  loading?: boolean;
}

export function OrderStatusChart({ data, loading = false }: OrderStatusChartProps) {
  // Option pour un affichage plus "doux" si pas de données
  const chartData = data.length > 0 ? data : [{ name: "Aucune donnée", value: 1, color: "#e2e8f0" }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex h-full min-h-[350px] w-full flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Répartition par statut
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Statuts des commandes globales
        </p>
      </div>

      <div className="relative flex-1 min-h-[250px] w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length && data.length > 0) {
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: payload[0].payload.color }}
                          />
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {payload[0].payload.name}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {payload[0].value}
                          </span>{" "}
                          commande(s)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                formatter={(value, entry: any) => {
                  return <span className="text-slate-600 dark:text-slate-300">{value}</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
