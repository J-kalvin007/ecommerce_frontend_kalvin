/**
 * Categories API Service — Repository Pattern pour les catégories du catalogue
 *
 * @module fonctions_api/categories.api
 */

import { apiPublic, apiPrivate } from "@/lib/axios";
import { AxiosError } from "axios";
import type { Result, ApiError } from "@/modeles/user";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  PatchCategoryPayload,
} from "@/modeles/categories";

const handleApiError = (error: unknown): { ok: false; error: ApiError } => {
  if (error instanceof AxiosError) {
    return {
      ok: false,
      error: {
        status: error.response?.status || 500,
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Une erreur serveur est survenue.",
        raw: error.response?.data,
      },
    };
  }
  return {
    ok: false,
    error: {
      status: 500,
      message: error instanceof Error ? error.message : "Erreur inconnue.",
    },
  };
};

export const getAdminCategories = async (): Promise<Result<Category[]>> => {
  try {
    const response = await apiPrivate.get<Category[]>("/api/v1/catalog/admin/categories/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAdminCategoryById = async (id: string): Promise<Result<Category>> => {
  try {
    const response = await apiPrivate.get<Category>(`/api/v1/catalog/admin/categories/${id}/`);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createAdminCategory = async (
  data: CreateCategoryPayload
): Promise<Result<Category>> => {
  try {
    let response;
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.slug) formData.append("slug", data.slug);
      if (data.description) formData.append("description", data.description);
      formData.append("image", data.image);
      if (data.parent) {
        formData.append("parent", data.parent);
        formData.append("parent_id", data.parent); // Pour compatibilité
      }

      response = await apiPrivate.post<Category>("/api/v1/catalog/admin/categories/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      const payload = { ...data };
      if (data.parent) {
        payload.parent = data.parent;
      }
      response = await apiPrivate.post<Category>("/api/v1/catalog/admin/categories/", payload);
    }
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateAdminCategory = async (
  id: string,
  data: UpdateCategoryPayload
): Promise<Result<Category>> => {
  try {
    let response;
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.slug) formData.append("slug", data.slug);
      if (data.description) formData.append("description", data.description);
      formData.append("image", data.image);
      if (data.parent) {
        formData.append("parent", data.parent);
        formData.append("parent_id", data.parent);
      }

      response = await apiPrivate.put<Category>(`/api/v1/catalog/admin/categories/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      const payload = { ...data };
      if (data.parent) {
        payload.parent = data.parent;
      }
      response = await apiPrivate.put<Category>(`/api/v1/catalog/admin/categories/${id}/`, payload);
    }
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const patchAdminCategory = async (
  id: string,
  data: PatchCategoryPayload
): Promise<Result<Category>> => {
  try {
    let response;
    if (data.image instanceof File) {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.slug) formData.append("slug", data.slug);
      if (data.description) formData.append("description", data.description);
      formData.append("image", data.image);
      if (data.parent) {
        formData.append("parent", data.parent);
        formData.append("parent_id", data.parent);
      }

      response = await apiPrivate.patch<Category>(`/api/v1/catalog/admin/categories/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      const payload = { ...data };
      if (data.parent) {
        payload.parent = data.parent;
      }
      response = await apiPrivate.patch<Category>(`/api/v1/catalog/admin/categories/${id}/`, payload);
    }
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteAdminCategory = async (id: string): Promise<Result<void>> => {
  try {
    await apiPrivate.delete(`/api/v1/catalog/admin/categories/${id}/`);
    return { ok: true, data: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPublicCategories = async (): Promise<Result<Category[]>> => {
  try {
    const response = await apiPublic.get<Category[]>("/api/v1/catalog/categories/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getPublicCategoryById = async (id: string): Promise<Result<Category>> => {
  try {
    const response = await apiPublic.get<Category>(`/api/v1/catalog/categories/${id}/`);
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};
