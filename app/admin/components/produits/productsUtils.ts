
// app/admin/components/produits/productsUtils.ts
// Types et utilitaires pour la gestion des produits admin
// (types absorbés depuis types.ts supprimé)

// --- Types --------------------------------------------------------------------

export interface ProductFormState {
  name: string;
  slug: string;
  sku: string;
  description: string;
  product_type: string;
  price: string;
  stock: string;
  weight_grams: string;
  seo_title: string;
  seo_description: string;
  is_top: boolean;
  alt_text: string;
}

export interface ProductFormErrors {
  name?: string;
  sku?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
}

export interface UploadedProductImage {
  id: string;
  file: File;
  preview: string;
  alt_text: string;
  is_primary?: boolean;
}

// --- Constantes ---------------------------------------------------------------

export const INITIAL_FORM: ProductFormState = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  product_type: "RAW",
  price: "",
  stock: "0",
  weight_grams: "0",
  seo_title: "",
  seo_description: "",
  is_top: false,
  alt_text: "",
};

// --- Utilitaires --------------------------------------------------------------

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

export function buildProductPayload(form: ProductFormState, categoryId: string) {
  return {
    category: categoryId || null,
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    sku: form.sku.trim(),
    description: form.description.trim() || null,
    product_type: form.product_type,
    price: form.price.trim(),
    stock: Number(form.stock || 0),
    weight_grams: Number(form.weight_grams || 0) || null,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
    is_top: Boolean(form.is_top),
  };
}