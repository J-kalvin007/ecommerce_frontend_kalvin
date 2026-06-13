'use client';

import { useUIStore } from '@/store/uiStore';

/**
 * Hook de commodité pour accéder au store UI.
 * Facilite l'importation et pourrait inclure une logique supplémentaire si nécessaire.
 */
export function useUI() {
  const ui = useUIStore();
  return ui;
}
