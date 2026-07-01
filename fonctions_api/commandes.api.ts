// fonctions_api/commandes.api.ts
import { apiPrivate } from "@/lib/axios";
import { AxiosError } from "axios";
import type { Result } from "@/modeles/user";
import type {
    OrderList,
    OrderDetail,
    UpdateOrderStatusPayload,
    OrderHistory,
    CheckoutPayload,
    AdminOrderFilters,
} from "@/modeles/commandes";

const handleApiError = (error: unknown): Result<never> => {
    if (error instanceof AxiosError) {
        return {
            ok: false,
            error: {
                status: error.response?.status || 500,
                message: error.response?.data?.detail || error.response?.data?.message || error.message,
                raw: error.response?.data,
            },
        };
    }
    return { ok: false, error: { status: 500, message: "Erreur inconnue" } };
};

// --- ADMIN --------------------------------------------------------------------

/** Récupérer toutes les commandes (admin) avec filtres optionnels */
export const getAdminOrders = async (filters?: AdminOrderFilters): Promise<Result<OrderList[]>> => {
    try {
        const res = await apiPrivate.get<OrderList[]>("/api/v1/commandes/admin/all-commandes/", {
            params: filters,
        });
        // Support pagination DRF
        const data = (res.data as any)?.results ?? res.data;
        return { ok: true, data: Array.isArray(data) ? data : [] };
    } catch (e) {
        return handleApiError(e);
    }
};

/** Récupérer une commande spécifique par sa référence (admin) */
export const getAdminOrderByReference = async (reference: string): Promise<Result<OrderDetail>> => {
    try {
        const res = await apiPrivate.get<OrderDetail>(
            `/api/v1/commandes/admin/commandes/${reference}/`
        );
        return { ok: true, data: res.data };
    } catch (e) {
        return handleApiError(e);
    }
};

/** Mettre à jour le statut d'une commande (admin) */
export const updateOrderStatus = async (
    reference: string,
    payload: UpdateOrderStatusPayload
): Promise<Result<OrderDetail>> => {
    try {
        const res = await apiPrivate.patch<OrderDetail>(
            `/api/v1/commandes/admin/commandes/${reference}/status/`,
            payload
        );
        return { ok: true, data: res.data };
    } catch (e) {
        return handleApiError(e);
    }
};

// --- CLIENT / MES COMMANDES ----------------------------------------------------

/** Récupérer les commandes du client connecté */
export const getMyOrders = async (): Promise<Result<OrderList[]>> => {
    try {
        const res = await apiPrivate.get<OrderList[]>("/api/v1/commandes/mes-commandes/");
        const data = (res.data as any)?.results ?? res.data;
        return { ok: true, data: Array.isArray(data) ? data : [] };
    } catch (e) {
        return handleApiError(e);
    }
};

/** Récupérer le détail d'une commande du client */
export const getMyOrderByReference = async (reference: string): Promise<Result<OrderDetail>> => {
    try {
        const res = await apiPrivate.get<OrderDetail>(
            `/api/v1/commandes/mes-commandes/${reference}/`
        );
        return { ok: true, data: res.data };
    } catch (e) {
        return handleApiError(e);
    }
};

/** Annuler une commande client */
export const cancelMyOrder = async (reference: string): Promise<Result<void>> => {
    try {
        await apiPrivate.post(`/api/v1/commandes/mes-commandes/${reference}/cancel/`);
        return { ok: true, data: undefined };
    } catch (e) {
        return handleApiError(e);
    }
};

/** Obtenir l'historique des changements de statut d'une commande */
export const getOrderHistory = async (reference: string): Promise<Result<OrderHistory[]>> => {
    try {
        const res = await apiPrivate.get<OrderHistory[]>(
            `/api/v1/commandes/mes-commandes/${reference}/historique/`
        );
        return { ok: true, data: res.data };
    } catch (e) {
        return handleApiError(e);
    }
};

/** Valider / passer une commande (checkout) */
export const validateOrder = async (payload: CheckoutPayload): Promise<Result<OrderDetail>> => {
    try {
        const res = await apiPrivate.post<OrderDetail>(
            "/api/v1/commandes/validate-commandes/",
            payload
        );
        return { ok: true, data: res.data };
    } catch (e) {
        return handleApiError(e);
    }
};