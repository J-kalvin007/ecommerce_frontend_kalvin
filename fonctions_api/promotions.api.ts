

// fonctions_api/promotions.api.ts
import { apiPrivate, apiPublic } from "@/lib/axios";
import type {
    AdminPromoCode,
    CreatePromoCodePayload,
    UpdatePromoCodePayload,
    DeactivateExpiredResponse,
    AdminSoldes,
    CreateSalePayload,
    UpdateSalePayload,
    AdminBanner,
    CreateBannerPayload,
    UpdateBannerPayload,
    ValidateCodePayload,
    ValidatePromoResponse,
    PromoCodeList,
    Banner,
    Soldes,
    BannerType,
} from "@/modeles/promotions";
import type { Result, ApiError } from "@/modeles/user";
import { AxiosError } from "axios";

const handleApiError = (error: unknown): Result<never> => {
    // ... même logique que dans categories.api.ts
    // (je reprends la fonction standard)
    if (error instanceof AxiosError) {
        return {
            ok: false,
            error: {
                status: error.response?.status || 500,
                message: error.response?.data?.detail || error.message,
                raw: error.response?.data,
            },
        };
    }
    return { ok: false, error: { status: 500, message: "Erreur inconnue" } };
};

// ─── Codes promo ─────────────────────────────────────────────
export const getAdminPromoCodes = async (): Promise<Result<AdminPromoCode[]>> => {
    try {
        const res = await apiPrivate.get<AdminPromoCode[]>("/api/v1/promotions/admin/codes-promo/");
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const getAdminPromoCodeById = async (id: string): Promise<Result<AdminPromoCode>> => {
    try {
        const res = await apiPrivate.get<AdminPromoCode>(`/api/v1/promotions/admin/codes-promo/${id}/`);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const createAdminPromoCode = async (payload: CreatePromoCodePayload): Promise<Result<AdminPromoCode>> => {
    try {
        const res = await apiPrivate.post<AdminPromoCode>("/api/v1/promotions/admin/codes-promo/", payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const updateAdminPromoCode = async (id: string, payload: UpdatePromoCodePayload): Promise<Result<AdminPromoCode>> => {
    try {
        const res = await apiPrivate.put<AdminPromoCode>(`/api/v1/promotions/admin/codes-promo/${id}/`, payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const patchAdminPromoCode = async (id: string, payload: UpdatePromoCodePayload): Promise<Result<AdminPromoCode>> => {
    try {
        const res = await apiPrivate.patch<AdminPromoCode>(`/api/v1/promotions/admin/codes-promo/${id}/`, payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const deleteAdminPromoCode = async (id: string): Promise<Result<void>> => {
    try {
        await apiPrivate.delete(`/api/v1/promotions/admin/codes-promo/${id}/`);
        return { ok: true, data: undefined };
    } catch (e) { return handleApiError(e); }
};

export const deactivateExpiredPromoCodes = async (): Promise<Result<DeactivateExpiredResponse>> => {
    try {
        const res = await apiPrivate.post<DeactivateExpiredResponse>("/api/v1/promotions/admin/codes-promo/deactivate_expired/");
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

// ─── Ventes soldes ──────────────────────────────────────────
export const getAdminSales = async (): Promise<Result<AdminSoldes[]>> => {
    try {
        const res = await apiPrivate.get<AdminSoldes[]>("/api/v1/promotions/admin/ventes-solde/");
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const getAdminSaleById = async (id: string): Promise<Result<AdminSoldes>> => {
    try {
        const res = await apiPrivate.get<AdminSoldes>(`/api/v1/promotions/admin/ventes-solde/${id}/`);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const createAdminSale = async (payload: CreateSalePayload): Promise<Result<AdminSoldes>> => {
    try {
        const res = await apiPrivate.post<AdminSoldes>("/api/v1/promotions/admin/ventes-solde/", payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const updateAdminSale = async (id: string, payload: UpdateSalePayload): Promise<Result<AdminSoldes>> => {
    try {
        const res = await apiPrivate.put<AdminSoldes>(`/api/v1/promotions/admin/ventes-solde/${id}/`, payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const patchAdminSale = async (id: string, payload: UpdateSalePayload): Promise<Result<AdminSoldes>> => {
    try {
        const res = await apiPrivate.patch<AdminSoldes>(`/api/v1/promotions/admin/ventes-solde/${id}/`, payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const deleteAdminSale = async (id: string): Promise<Result<void>> => {
    try {
        await apiPrivate.delete(`/api/v1/promotions/admin/ventes-solde/${id}/`);
        return { ok: true, data: undefined };
    } catch (e) { return handleApiError(e); }
};

// ─── Bannières (recommandations) ────────────────────────────
export const getAdminBanners = async (): Promise<Result<AdminBanner[]>> => {
    try {
        const res = await apiPrivate.get<AdminBanner[]>("/api/v1/promotions/admin/recommendations/");
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const createAdminBanner = async (payload: CreateBannerPayload): Promise<Result<AdminBanner>> => {
    try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            if (k === "image" && v instanceof File) formData.append("image", v);
            else formData.append(k, String(v));
        });
        const res = await apiPrivate.post<AdminBanner>("/api/v1/promotions/admin/recommendations/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const updateAdminBanner = async (id: string, payload: UpdateBannerPayload): Promise<Result<AdminBanner>> => {
    try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            if (k === "image" && v instanceof File) formData.append("image", v);
            else formData.append(k, String(v));
        });
        const res = await apiPrivate.put<AdminBanner>(`/api/v1/promotions/admin/recommendations/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const deleteAdminBanner = async (id: string): Promise<Result<void>> => {
    try {
        await apiPrivate.delete(`/api/v1/promotions/admin/recommendations/${id}/`);
        return { ok: true, data: undefined };
    } catch (e) { return handleApiError(e); }
};

// ─── Endpoints publics ──────────────────────────────────────
export const validatePromoCode = async (payload: ValidateCodePayload): Promise<Result<ValidatePromoResponse>> => {
    try {
        const res = await apiPrivate.post<ValidatePromoResponse>("/api/v1/promotions/codes-promo/validate/", payload);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const getActivePromoCodes = async (): Promise<Result<PromoCodeList[]>> => {
    try {
        const res = await apiPublic.get<PromoCodeList[]>("/api/v1/promotions/codes-promo-actifs/");
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const getActiveRecommendations = async (type?: BannerType): Promise<Result<Banner[]>> => {
    try {
        const url = type
            ? `/api/v1/promotions/recommendations-actives/?type=${type}`
            : "/api/v1/promotions/recommendations-actives/";
        const res = await apiPublic.get<Banner[]>(url);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const getActiveSales = async (): Promise<Result<Soldes[]>> => {
    try {
        const res = await apiPublic.get<Soldes[]>("/api/v1/promotions/soldes-actifs/");
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};
