export * from "./categories";
export * from "./produits";
export * from "./user";
import type { ProductDetail, ProductList } from "./produits";

export interface Order {
  id: string;
  order_number?: string;
  created_at?: string;
  total_amount?: string | number;
  status: string;
  shipping_address?: {
    full_name: string;
  };
  guest_email?: string;
  items?: Array<{ quantity: number }>;
  wallet_transaction_id?: string;
  currency?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
}

export type Product = ProductDetail & {
  currency?: string;
  compare_at_price?: string;
  avg_rating?: number;
  review_count?: number;
  stock_status?: string;
  labels?: string[];
  country_of_origin?: string;
  weight_g?: number;
  category_detail?: { name: string };
};

// Extend ProductList for frontend components that expect old fields
declare module "./produits" {
  interface ProductList {
    compare_at_price?: string;
    currency?: string;
    avg_rating?: number;
    review_count?: number;
    stock_status?: string;
    labels?: string[];
    is_featured?: boolean;
  }
}
