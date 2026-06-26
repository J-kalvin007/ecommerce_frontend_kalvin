/**
 * Wallets & Paiements API Service — Repository Pattern
 *
 * Couverture complète de tous les endpoints Django DRF du module paiements :
 *
 *  [ADMIN]
 *   GET  /api/v1/paiements/admin/all-transactions/      → getAdminAllTransactions()
 *   GET  /api/v1/paiements/admin/all-wallets/           → getAdminAllWallets()
 *   POST /api/v1/paiements/admin/retrait-fonds/         → adminWithdraw()
 *   PATCH /api/v1/paiements/admin/wallets/{id}/status/  → updateWalletStatus()
 *
 *  [CLIENT / COMMUN]
 *   GET  /api/v1/paiements/my-wallet/                         → getMyWallet()
 *   GET  /api/v1/paiements/wallet/historique-transactions/    → getMyWalletHistory()
 *   POST /api/v1/paiements/wallet/deposit/                    → depositWallet()
 *   POST /api/v1/paiements/wallet/achat/                      → payWithWallet()
 *   POST /api/v1/paiements/remboursement-commande/            → refundOrder()
 *   POST /api/v1/paiements/initier-paiement-direct/           → initiateDirectPayment()
 *
 * Pattern de retour uniforme : Result<T> = { ok: true; data: T } | { ok: false; error: ApiError }
 *
 * @module fonctions_api/wallets-paiements.api
 */

import { apiPrivate } from "@/lib/axios";
import { AxiosError } from "axios";
import type { Result, ApiError } from "@/modeles/user";
import type {
  AdminWallet,
  Wallet,
  MyTransfer,
  WalletTransaction,
  Payment,
  WalletDepositResponse,
  InitiatePaymentResponse,
  OrderRefundResponse,
  AdminWithdrawPayload,
  WalletStatusUpdatePayload,
  DepositPayload,
  WalletPayPayload,
  OrderRefundPayload,
  InitiatePaymentPayload,
} from "@/modeles/wallets-paiements";

/* ============================================================
   Helper interne — normalisation des erreurs Axios
   Conforme au même pattern utilisé dans categories.api.ts
   ============================================================ */
const handleApiError = (error: unknown): { ok: false; error: ApiError } => {
  if (error instanceof AxiosError) {
    return {
      ok: false,
      error: {
        status: error.response?.status || 500,
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.non_field_errors?.[0] ||
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

/* ============================================================
   ENDPOINTS ADMIN
   Tous nécessitent un token d'authentification avec rôle admin.
   ============================================================ */

/**
 * Récupère l'historique complet et unifié de toutes les transactions
 * financières de la plateforme (Wallet + PayDunya + Remboursements).
 *
 * @returns MyTransfer[] — transactions triées par date décroissante
 */
export const getAdminAllTransactions = async (): Promise<Result<MyTransfer[]>> => {
  try {
    const response = await apiPrivate.get<any>(
      "/api/v1/paiements/admin/all-transactions/"
    );
    const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
    return { ok: true, data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère la liste de tous les wallets utilisateurs avec leur solde
 * et le solde total cumulé de la plateforme.
 *
 * @returns AdminWallet[] — wallets avec informations propriétaire
 */
export const getAdminAllWallets = async (): Promise<Result<AdminWallet[]>> => {
  try {
    const response = await apiPrivate.get<any>(
      "/api/v1/paiements/admin/all-wallets/"
    );
    const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
    return { ok: true, data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Effectue un retrait de fonds administrateur vers un numéro Mobile Money.
 *
 * @param payload - { amount, phone_number, description? }
 * @returns Payment — détail du paiement de retrait initié
 * @throws 502 si la passerelle PayDunya est indisponible
 */
export const adminWithdraw = async (
  payload: AdminWithdrawPayload
): Promise<Result<Payment>> => {
  try {
    const response = await apiPrivate.post<Payment>(
      "/api/v1/paiements/admin/retrait-fonds/",
      payload
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Met à jour le statut d'un wallet (actif, suspendu, bloqué).
 * Opération irréversible si solde > 0 → Django retourne 400.
 *
 * @param walletId - UUID du wallet à modifier
 * @param payload  - { status: WalletStatus }
 * @returns AdminWallet — wallet mis à jour
 */
export const updateWalletStatus = async (
  walletId: string,
  payload: WalletStatusUpdatePayload
): Promise<Result<AdminWallet>> => {
  try {
    const response = await apiPrivate.patch<AdminWallet>(
      `/api/v1/paiements/admin/wallets/${walletId}/status/`,
      payload
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/* ============================================================
   ENDPOINTS CLIENT / COMMUNS
   ============================================================ */

/**
 * Récupère le solde et le statut du wallet de l'utilisateur connecté.
 *
 * @returns Wallet — solde, statut et dates
 */
export const getMyWallet = async (): Promise<Result<Wallet>> => {
  try {
    const response = await apiPrivate.get<Wallet>("/api/v1/paiements/my-wallet/");
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Récupère l'historique complet des transactions du wallet de l'utilisateur connecté.
 *
 * @returns WalletTransaction[] — historique trié par date décroissante
 */
export const getMyWalletHistory = async (): Promise<Result<WalletTransaction[]>> => {
  try {
    const response = await apiPrivate.get<WalletTransaction[]>(
      "/api/v1/paiements/wallet/historique-transactions/"
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Initie une recharge du wallet via PayDunya Mobile Money.
 *
 * @param payload - { amount, phone_number }
 * @returns WalletDepositResponse — { payment_id, redirect_url, token }
 * @throws 400 si wallet inactif, 502 si passerelle indisponible
 */
export const depositWallet = async (
  payload: DepositPayload
): Promise<Result<WalletDepositResponse>> => {
  try {
    const response = await apiPrivate.post<WalletDepositResponse>(
      "/api/v1/paiements/recharge-user-wallet/",
      payload
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Paye une commande avec le solde du wallet.
 *
 * @param payload - { order_id: UUID }
 * @returns Payment — détail du paiement effectué
 * @throws 400 si wallet inactif, 402 si solde insuffisant
 */
export const payWithWallet = async (
  payload: WalletPayPayload
): Promise<Result<Payment>> => {
  try {
    const response = await apiPrivate.post<Payment>(
      "/api/v1/paiements/wallet/achat/",
      payload
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Déclenche un remboursement manuel d'une commande.
 * Accessible aux admins et aux clients autorisés.
 *
 * @param payload - { order_id: UUID }
 * @returns OrderRefundResponse — { detail, refunded_payments[] }
 * @throws 403 si non autorisé, 404 si aucun paiement trouvé
 */
export const refundOrder = async (
  payload: OrderRefundPayload
): Promise<Result<OrderRefundResponse>> => {
  try {
    const response = await apiPrivate.post<OrderRefundResponse>(
      "/api/v1/paiements/remboursement-commande/",
      payload
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Initie un paiement PayDunya direct (avec ou sans commande existante).
 *
 * @param payload - { order_id?, amount, phone_number }
 * @returns InitiatePaymentResponse — { payment_id, redirect_url, token }
 * @throws 502 si passerelle PayDunya indisponible
 */
export const initiateDirectPayment = async (
  payload: InitiatePaymentPayload
): Promise<Result<InitiatePaymentResponse>> => {
  try {
    const response = await apiPrivate.post<InitiatePaymentResponse>(
      "/api/v1/paiements/initier-paiement-direct/",
      payload
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};
