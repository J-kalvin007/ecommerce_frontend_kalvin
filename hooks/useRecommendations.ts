"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { ProductListItem } from "@/modeles";
import {
  getRecommendationsWithAI,
  type AIProductSuggestion,
} from "@/services/ai.service";

type RecommendationContext = {
  cartItems?: string[];
  viewedCategories?: string[];
  userIntent?: string;
};

export function useRecommendations(
  products: ProductListItem[],
  context: RecommendationContext = {},
) {
  const [recommendations, setRecommendations] = useState<AIProductSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cartItemsKey = context.cartItems?.join(",") ?? "";
  const viewedCategoriesKey = context.viewedCategories?.join(",") ?? "";
  const userIntent = context.userIntent ?? "";
  const requestContext = useMemo<RecommendationContext>(
    () => ({
      cartItems: context.cartItems,
      viewedCategories: context.viewedCategories,
      userIntent,
    }),
    [userIntent, context.cartItems, context.viewedCategories],
  );

  useEffect(() => {
    if (!products.length) return;

    startTransition(async () => {
      try {
        setError(null);
        const items = await getRecommendationsWithAI(products, requestContext);
        setRecommendations(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Recommendations IA indisponibles.");
      }
    });
  }, [products, cartItemsKey, viewedCategoriesKey, userIntent, requestContext]);

  return {
    recommendations,
    error,
    isLoading: isPending,
  };
}
