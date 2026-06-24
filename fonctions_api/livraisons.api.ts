// fonctions_api/livraisons.api.ts
import { apiPrivate } from "@/lib/axios";
import type { Result } from "@/modeles/user";

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
