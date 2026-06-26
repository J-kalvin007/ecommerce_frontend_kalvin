/**
 * livraisons.api.ts — API Service pour les livraisons
 * ─────────────────────────────────────────────────────────────────────────────
 * @module fonctions_api/livraisons.api
 */

import { apiPrivate } from "@/lib/axios";
import type { Result } from "@/modeles/user";
import type { Delivery } from "@/modeles/livraisons";

export interface FraisLivraison {
    prix_livraison: string;
    coordonnee_admin: string;
}

export const getFraisLivraison = async (): Promise<Result<FraisLivraison>> => {
    try {
        const res = await apiPrivate.get<FraisLivraison[]>("/api/v1/livraisons/frais/");
        const data = (res.data as any)?.results ?? res.data;
        if (Array.isArray(data) && data.length > 0) {
            return { ok: true, data: data[0] };
        }
        return { ok: false, error: { status: 404, message: "Aucun frais de livraison trouvé" } };
    } catch (error: any) {
        return {
            ok: false,
            error: {
                status: error.response?.status || 500,
                message: error.response?.data?.detail || error.message || "Erreur lors de la récupération des frais de livraison"
            }
        };
    }
};

/**
 * Récupère la liste des livraisons du client connecté.
 * GET /api/v1/livraisons/suivi/
 */
export const getMyDeliveries = async (params?: {
    ordering?: string;
    search?: string;
}): Promise<Result<Delivery[]>> => {
    try {
        const res = await apiPrivate.get<{ results?: Delivery[] } | Delivery[]>(
            "/api/v1/livraisons/suivi/",
            { params }
        );
        const data = (res.data as any)?.results ?? res.data;
        return { ok: true, data: Array.isArray(data) ? data : [] };
    } catch (error: any) {
        return {
            ok: false,
            error: {
                status: error.response?.status || 500,
                message:
                    error.response?.data?.detail ||
                    error.message ||
                    "Impossible de charger vos livraisons.",
            },
        };
    }
};
