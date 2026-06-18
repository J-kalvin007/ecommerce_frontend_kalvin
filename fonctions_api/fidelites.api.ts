// fonctions_api/fidelites.api.ts
// Service Layer complet pour le module de fidélité — pattern Result<T>

import { apiPrivate } from "@/lib/axios";
import { AxiosError } from "axios";
import type { Result } from "@/modeles/user";
import type {
    LoyaltyProfile,
    LoyaltyEvent,
    Tier,
    AdminAdjustPointsPayload,
    AdminAdjustPointsResponse,
    RedeemPointsPayload,
    RedeemPointsResponse,
} from "@/modeles/fidelites";

// ─── Gestion centralisée des erreurs ─────────────────────────────────────────

const handleApiError = (error: unknown): Result<never> => {
    if (error instanceof AxiosError) {
        const status  = error.response?.status || 500;
        const data    = error.response?.data;
        const message =
            data?.detail ||
            data?.message ||
            (typeof data === "string" ? data : null) ||
            error.message ||
            "Une erreur inattendue est survenue";
        return { ok: false, error: { status, message, raw: data } };
    }
    return { ok: false, error: { status: 500, message: "Erreur réseau inconnue" } };
};

/** Normalise la réponse paginée DRF ou tableau direct */
const extractList = <T>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object") {
        const d = data as { results?: unknown; data?: unknown };
        if (Array.isArray(d.results)) return d.results as T[];
        if (Array.isArray(d.data))    return d.data as T[];
    }
    return [];
};

// ─── ADMIN — Profils de fidélité ──────────────────────────────────────────────

/**
 * Récupère la liste complète de tous les profils de fidélité.
 * GET /api/v1/fidelites/admin/profiles/
 */
export const getAdminLoyaltyProfiles = async (): Promise<Result<LoyaltyProfile[]>> => {
    try {
        const res = await apiPrivate.get("/api/v1/fidelites/admin/profiles/");
        return { ok: true, data: extractList<LoyaltyProfile>(res.data) };
    } catch (e) { return handleApiError(e); }
};

/**
 * Récupère le détail d'un profil de fidélité par son UUID.
 * GET /api/v1/fidelites/admin/profiles/{id}/
 */
export const getAdminLoyaltyProfileById = async (id: string): Promise<Result<LoyaltyProfile>> => {
    try {
        const res = await apiPrivate.get<LoyaltyProfile>(`/api/v1/fidelites/admin/profiles/${id}/`);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

/**
 * Crée un profil de fidélité.
 * POST /api/v1/fidelites/admin/profiles/
 */
export const createAdminLoyaltyProfile = async (): Promise<Result<LoyaltyProfile>> => {
    try {
        const res = await apiPrivate.post<LoyaltyProfile>("/api/v1/fidelites/admin/profiles/", {});
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

/**
 * Mise à jour complète d'un profil (PUT).
 * PUT /api/v1/fidelites/admin/profiles/{id}/
 */
export const updateAdminLoyaltyProfile = async (
    id: string,
    payload: Record<string, unknown>
): Promise<Result<LoyaltyProfile>> => {
    try {
        const res = await apiPrivate.put<LoyaltyProfile>(`/api/v1/fidelites/admin/profiles/${id}/`, payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

/**
 * Mise à jour partielle d'un profil (PATCH).
 * PATCH /api/v1/fidelites/admin/profiles/{id}/
 */
export const patchAdminLoyaltyProfile = async (
    id: string,
    payload: Record<string, unknown>
): Promise<Result<LoyaltyProfile>> => {
    try {
        const res = await apiPrivate.patch<LoyaltyProfile>(`/api/v1/fidelites/admin/profiles/${id}/`, payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

/**
 * Supprime un profil de fidélité.
 * DELETE /api/v1/fidelites/admin/profiles/{id}/
 */
export const deleteAdminLoyaltyProfile = async (id: string): Promise<Result<void>> => {
    try {
        await apiPrivate.delete(`/api/v1/fidelites/admin/profiles/${id}/`);
        return { ok: true, data: undefined };
    } catch (e) { return handleApiError(e); }
};

/**
 * Ajustement manuel de points pour un utilisateur (admin uniquement).
 * POST /api/v1/fidelites/admin/profiles/adjust_points/
 */
export const adjustAdminLoyaltyPoints = async (
    payload: AdminAdjustPointsPayload
): Promise<Result<AdminAdjustPointsResponse>> => {
    try {
        const res = await apiPrivate.post<AdminAdjustPointsResponse>(
            "/api/v1/fidelites/admin/profiles/adjust_points/",
            payload
        );
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

// ─── ADMIN — Paliers de fidélité ──────────────────────────────────────────────

/**
 * Crée un palier de fidélité.
 * POST /api/v1/fidelites/admin/tiers/
 */
export const createAdminLoyaltyTier = async (payload: Partial<Tier>): Promise<Result<Tier>> => {
    try {
        const res = await apiPrivate.post<Tier>("/api/v1/fidelites/admin/tiers/", payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

/**
 * Mise à jour d'un palier (PATCH).
 * PATCH /api/v1/fidelites/admin/tiers/{id}/
 */
export const updateAdminLoyaltyTier = async (id: string, payload: Partial<Tier>): Promise<Result<Tier>> => {
    try {
        const res = await apiPrivate.patch<Tier>(`/api/v1/fidelites/admin/tiers/${id}/`, payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

/**
 * Supprime un palier de fidélité.
 * DELETE /api/v1/fidelites/admin/tiers/{id}/
 */
export const deleteAdminLoyaltyTier = async (id: string): Promise<Result<void>> => {
    try {
        await apiPrivate.delete(`/api/v1/fidelites/admin/tiers/${id}/`);
        return { ok: true, data: undefined };
    } catch (e) { return handleApiError(e); }
};

// ─── PUBLICS / CLIENT ─────────────────────────────────────────────────────────

/**
 * Liste tous les paliers de fidélité disponibles.
 * GET /api/v1/fidelites/liste-des-grades/
 */
export const getLoyaltyTiers = async (): Promise<Result<Tier[]>> => {
    try {
        const res = await apiPrivate.get("/api/v1/fidelites/liste-des-grades/");
        return { ok: true, data: extractList<Tier>(res.data) };
    } catch (e) { return handleApiError(e); }
};

/**
 * Profil de fidélité de l'utilisateur connecté.
 * GET /api/v1/fidelites/mon-profil-fidelite/
 */
export const getMyLoyaltyProfile = async (): Promise<Result<LoyaltyProfile>> => {
    try {
        const res = await apiPrivate.get<LoyaltyProfile>("/api/v1/fidelites/mon-profil-fidelite/");
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

/**
 * Journal paginé des événements de points de l'utilisateur connecté.
 * GET /api/v1/fidelites/historique-utilisation/
 */
export const getLoyaltyHistory = async (): Promise<Result<LoyaltyEvent[]>> => {
    try {
        const res = await apiPrivate.get("/api/v1/fidelites/historique-utilisation/");
        return { ok: true, data: extractList<LoyaltyEvent>(res.data) };
    } catch (e) { return handleApiError(e); }
};

/**
 * Dépenser des points sur une commande.
 * POST /api/v1/fidelites/depenser-mes-points/
 */
export const redeemLoyaltyPoints = async (
    payload: RedeemPointsPayload
): Promise<Result<RedeemPointsResponse>> => {
    try {
        const res = await apiPrivate.post<RedeemPointsResponse>(
            "/api/v1/fidelites/depenser-mes-points/",
            payload
        );
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};
