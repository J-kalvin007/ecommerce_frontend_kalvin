/**
 * livraisons.api.ts — API Service pour les livraisons
 * -----------------------------------------------------------------------------
 * @module fonctions_api/livraisons.api
 */

import { apiPrivate } from "@/lib/axios";
import type { Result } from "@/modeles/user";
import type { Delivery, PatchedDelivery, FraisLivraison, PatchedFraisLivraison } from "@/modeles/livraisons";

/* ═══════════════════════════════════════════════════════════════════════════
   FRAIS DE LIVRAISON (/api/v1/livraisons/frais/)
   ═══════════════════════════════════════════════════════════════════════════ */

export const getFraisLivraisons = async (params?: {
    ordering?: string;
}): Promise<Result<FraisLivraison[]>> => {
    try {
        const res = await apiPrivate.get<{ results?: FraisLivraison[] } | FraisLivraison[]>(
            "/api/v1/livraisons/frais/",
            { params }
        );
        const data = (res.data as any)?.results ?? res.data;
        return { ok: true, data: Array.isArray(data) ? data : [] };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Impossible de charger les frais de livraison." } };
    }
};

// Helper for the first one (often there's only one fee config)
export const getFraisLivraison = async (): Promise<Result<FraisLivraison>> => {
    const res = await getFraisLivraisons();
    if (res.ok && res.data && res.data.length > 0) {
        return { ok: true, data: res.data[0] };
    }
    return { ok: false, error: { status: 404, message: "Aucun frais de livraison trouvé" } };
};

export const createFraisLivraison = async (data: Omit<FraisLivraison, "id" | "created_at" | "updated_at">): Promise<Result<FraisLivraison>> => {
    try {
        const res = await apiPrivate.post<FraisLivraison>("/api/v1/livraisons/frais/", data);
        return { ok: true, data: res.data };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Erreur de création" } };
    }
};

export const getFraisLivraisonById = async (id: string): Promise<Result<FraisLivraison>> => {
    try {
        const res = await apiPrivate.get<FraisLivraison>(`/api/v1/livraisons/frais/${id}/`);
        return { ok: true, data: res.data };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Frais introuvable" } };
    }
};

export const updateFraisLivraison = async (id: string, data: Omit<FraisLivraison, "id" | "created_at" | "updated_at">): Promise<Result<FraisLivraison>> => {
    try {
        const res = await apiPrivate.put<FraisLivraison>(`/api/v1/livraisons/frais/${id}/`, data);
        return { ok: true, data: res.data };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Erreur de mise à jour" } };
    }
};

export const partialUpdateFraisLivraison = async (id: string, data: PatchedFraisLivraison): Promise<Result<FraisLivraison>> => {
    try {
        const res = await apiPrivate.patch<FraisLivraison>(`/api/v1/livraisons/frais/${id}/`, data);
        return { ok: true, data: res.data };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Erreur de mise à jour partielle" } };
    }
};

export const deleteFraisLivraison = async (id: string): Promise<Result<void>> => {
    try {
        await apiPrivate.delete(`/api/v1/livraisons/frais/${id}/`);
        return { ok: true, data: undefined };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Erreur de suppression" } };
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   LIVRAISONS SUIVI (/api/v1/livraisons/suivi/)
   ═══════════════════════════════════════════════════════════════════════════ */

export const getDeliveries = async (params?: {
    delivery_person?: number;
    order_reference?: string;
    ordering?: string;
    search?: string;
    status?: string;
}): Promise<Result<Delivery[]>> => {
    try {
        const res = await apiPrivate.get<{ results?: Delivery[] } | Delivery[]>(
            "/api/v1/livraisons/suivi/",
            { params }
        );
        const data = (res.data as any)?.results ?? res.data;
        return { ok: true, data: Array.isArray(data) ? data : [] };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Impossible de charger les livraisons." } };
    }
};

// Alias for customer readability
export const getMyDeliveries = getDeliveries;

export const createDelivery = async (data: Omit<Delivery, "id" | "order_reference" | "delivery_person_name" | "created_at" | "updated_at">): Promise<Result<Delivery>> => {
    try {
        const res = await apiPrivate.post<Delivery>("/api/v1/livraisons/suivi/", data);
        return { ok: true, data: res.data };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Erreur de création de livraison" } };
    }
};

export const getDeliveryById = async (id: string): Promise<Result<Delivery>> => {
    try {
        const res = await apiPrivate.get<Delivery>(`/api/v1/livraisons/suivi/${id}/`);
        return { ok: true, data: res.data };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Livraison introuvable" } };
    }
};

export const updateDelivery = async (id: string, data: Omit<Delivery, "id" | "order_reference" | "delivery_person_name" | "created_at" | "updated_at">): Promise<Result<Delivery>> => {
    try {
        const res = await apiPrivate.put<Delivery>(`/api/v1/livraisons/suivi/${id}/`, data);
        return { ok: true, data: res.data };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Erreur de mise à jour" } };
    }
};

export const partialUpdateDelivery = async (id: string, data: PatchedDelivery): Promise<Result<Delivery>> => {
    try {
        const res = await apiPrivate.patch<Delivery>(`/api/v1/livraisons/suivi/${id}/`, data);
        return { ok: true, data: res.data };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Erreur de mise à jour partielle" } };
    }
};

export const deleteDelivery = async (id: string): Promise<Result<void>> => {
    try {
        await apiPrivate.delete(`/api/v1/livraisons/suivi/${id}/`);
        return { ok: true, data: undefined };
    } catch (error: any) {
        return { ok: false, error: { status: error.response?.status || 500, message: error.response?.data?.detail || error.message || "Erreur de suppression" } };
    }
};
