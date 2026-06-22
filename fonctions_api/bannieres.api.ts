// fonctions_api/bannieres.api.ts
import { apiPrivate, apiPublic } from "@/lib/axios";
import type { AdminBanner, Banner, BannerType, CreateAdminBannerPayload } from "@/modeles/bannieres";
import type { Result } from "@/modeles/user";
import { AxiosError } from "axios";

const handleApiError = (error: unknown): Result<never> => {
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

export const getAdminBanners = async (): Promise<Result<AdminBanner[]>> => {
    try {
        const res = await apiPrivate.get<AdminBanner[]>("/api/v1/promotions/admin/recommendations/");
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const getAdminBannerById = async (id: string): Promise<Result<AdminBanner>> => {
    try {
        const res = await apiPrivate.get<AdminBanner>(`/api/v1/promotions/admin/recommendations/${id}/`);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const createAdminBanner = async (payload: CreateAdminBannerPayload): Promise<Result<AdminBanner>> => {
    try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            if (k === "image" && v instanceof File) {
                formData.append("image", v);
            } else {
                formData.append(k, String(v));
            }
        });
        const res = await apiPrivate.post<AdminBanner>("/api/v1/promotions/admin/recommendations/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};

export const updateAdminBanner = async (id: string, payload: Partial<CreateAdminBannerPayload>): Promise<Result<AdminBanner>> => {
    try {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            // Pour l'image, n'envoyer que si c'est un nouveau fichier (File). 
            // Si c'est une string (URL), on l'ignore car le backend n'a pas besoin de la ré-uploader.
            if (k === "image") {
                if (v instanceof File) {
                    formData.append("image", v);
                }
            } else {
                formData.append(k, String(v));
            }
        });
        const res = await apiPrivate.patch<AdminBanner>(`/api/v1/promotions/admin/recommendations/${id}/`, formData, {
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



export const getActiveRecommendations = async (type?: BannerType): Promise<Result<Banner[]>> => {
    try {
        const url = type 
            ? `/api/v1/promotions/recommendations-actives/?type=${type}`
            : "/api/v1/promotions/recommendations-actives/";
        const res = await apiPublic.get<Banner[]>(url);
        return { ok: true, data: res.data };
    } catch (e) { return handleApiError(e); }
};