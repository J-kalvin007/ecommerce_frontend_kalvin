"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Delivery } from "@/modeles/livraisons";
import DeliveryCard from "./DeliveryCard";

interface DeliveryListProps {
  deliveries: Delivery[];
}

export default function DeliveryList({ deliveries }: DeliveryListProps) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      layout
    >
      <AnimatePresence mode="popLayout">
        {deliveries.map((delivery, idx) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            index={idx}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
