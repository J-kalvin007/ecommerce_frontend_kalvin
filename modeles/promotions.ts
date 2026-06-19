


// modeles/promotions.ts
import type { ProductList } from "./produits";
import type { Category } from "./categories";

export type DiscountType = "percentage" | "fixed_amount" | "free_shipping";

export interface AdminPromoCode {
    id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    code: string;
    description: string;
    type: DiscountType;
    value: string;          // decimal
    number_times_used: number;
    starts_at: string;      // ISO datetime
    expires_at: string | null;
    applicable_products: ProductList[];
    applicable_categories: Category[];
    restricted_to_tiers: string[];
}

export interface CreatePromoCodePayload {
    is_active?: boolean;
    code?: string;                    // auto-généré si vide
    description?: string;
    type: DiscountType;
    value: string;
    starts_at?: string;
    expires_at?: string | null;
    applicable_products?: string[];
    applicable_categories?: string[];
    restricted_to_tiers?: string[];
}

export type UpdatePromoCodePayload = Partial<CreatePromoCodePayload>;

export interface DeactivateExpiredResponse {
    deactivated: number;
}

// ─── Ventes soldes (flash) ──────────────────────────────────
export interface AdminSoldes {
    id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    sale_price: string;
    original_price: string;
    quota_stock_limit: number | null;
    product_sold_count: number;
    starts_at: string;
    ends_at: string;
    product: ProductList;
    variant: any | null;
}

export interface CreateSalePayload {
    is_active?: boolean;
    sale_price: string;
    quota_stock_limit?: number | null;
    starts_at?: string;
    ends_at: string;
    product: string;
    variant?: string | null;
}

export type UpdateSalePayload = Partial<CreateSalePayload>;

// ─── Bannières / recommandations ────────────────────────────
export type BannerType = "carousel" | "popup" | "hero" | "side_banner";

export interface AdminBanner {
    id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    title: string;
    subtitle: string;
    image: string;
    cta_label: string;
    cta_url: string;
    banner_type: BannerType;
    position: number;
    starts_at: string;
    ends_at: string | null;
}

export interface CreateBannerPayload {
    is_active?: boolean;
    title: string;
    subtitle?: string;
    image: string | File;
    cta_label?: string;
    cta_url?: string;
    banner_type: BannerType;
    position?: number;
    starts_at?: string;
    ends_at?: string | null;
}

export type UpdateBannerPayload = Partial<CreateBannerPayload>;

// ─── Endpoints publics (validation) ─────────────────────────
export interface ValidateCodePayload {
    code: string;
    cart_total: string;
}

export interface ValidatePromoResponse {
    valid: boolean;
    code: string;
    type: string;
    value: string;
    discount_amount: string;
    description: string;
}

export interface ValidatePromoErrorResponse {
    valid: boolean;
    error_code: string;
    detail: string;
}

export interface PromoCodeList {
    id: string;
    code: string;
    description: string;
    type: DiscountType;
    type_display: string;
    value: string;
    starts_at: string;
    expires_at: string | null;
}

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

export interface Soldes {
    id: string;
    product_name: string;
    product_slug: string;
    product_image: string;
    variant: string | null;
    sale_price: string;
    original_price: string;
    discount_percent: number;
    remaining_stock: number | null;
    starts_at: string;
    ends_at: string;
}