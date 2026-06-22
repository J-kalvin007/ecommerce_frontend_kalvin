// modeles/bannieres.ts

export type BannerTypeEnum = "carousel" | "popup" | "hero" | "side_banner";

export type BannerType = "carousel" | "popup" | "hero" | "side_banner";


export interface AdminBanner {
    readonly id: string;
    readonly created_at: string;
    readonly updated_at: string;
    is_active: boolean;
    title: string;
    subtitle: string | null;
    image: string;
    cta_label: string | null;
    cta_url: string | null;
    banner_type: BannerTypeEnum;
    position: number;
    starts_at: string | null;
    ends_at: string | null;
}

export interface CreateAdminBannerPayload {
    is_active: boolean;
    title: string;
    subtitle?: string | null;
    image: File | string; // File from input or string URL
    cta_label?: string | null;
    cta_url?: string | null;
    banner_type: BannerTypeEnum;
    position: number;
    starts_at?: string | null;
    ends_at?: string | null;
}

export const BANNER_TYPE_LABELS: Record<BannerTypeEnum, string> = {
    carousel: "Carrousel Principal",
    popup: "Fenêtre Popup",
    hero: "En-tête Hero",
    side_banner: "Bannière Latérale"
};

export const BANNER_TYPE_COLORS: Record<BannerTypeEnum, { bg: string, text: string, border: string }> = {
    carousel: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
    popup: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
    hero: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
    side_banner: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
};



export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    cta_label: string;
    cta_url: string;
    banner_type: BannerType;
    position: number;
}