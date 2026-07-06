export interface CartItemAPI {
  id: string;
  product: string;
  product_details?: any; 
  quantity: number;
  subtotal: string;
  parent_product_id: string;
  slug: string;
  primary_image: string | null;
}

export interface CartAPI {
  id: string;
  user: string;
  items: CartItemAPI[];
  total: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface AddCartItemPayload {
  product_id: string;
  quantity: number;
}
