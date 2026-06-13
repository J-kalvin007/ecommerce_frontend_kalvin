"use client";

import { useState, useTransition } from "react";
import type { ProductListItem } from "@/modeles";
import { searchProductsWithAI } from "@/services/ai.service";

export function useAISearch(products: ProductListItem[]) {
  const [answer, setAnswer] = useState("");
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runSearch = (query: string) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await searchProductsWithAI(query, products);
        setAnswer(result.answer);
        setMatchedIds(result.productIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Recherche IA indisponible.");
      }
    });
  };

  return {
    answer,
    matchedIds,
    error,
    isLoading: isPending,
    runSearch,
  };
}
