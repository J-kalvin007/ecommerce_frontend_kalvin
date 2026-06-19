/**
 * Modèles TypeScript — Wallets & Paiements
 *
 * Correspond EXACTEMENT aux sérialiseurs Django renvoyés par :
 *   - /api/v1/paiements/admin/all-wallets/       → AdminWallet[]
 *   - /api/v1/paiements/admin/all-transactions/  → MyTransfer[]
 *   - /api/v1/paiements/admin/retrait-fonds/     → Payment (POST)
 *   - /api/v1/paiements/admin/wallets/{id}/status/ → AdminWallet (PATCH)
 *   - /api/v1/paiements/my-wallet/               → Wallet
 *   - /api/v1/paiements/wallet/historique-transactions/ → WalletTransaction[]
 *   - /api/v1/paiements/wallet/deposit/          → WalletDepositResponse (POST)
 *   - /api/v1/paiements/wallet/achat/            → Payment (POST)
 *   - /api/v1/paiements/remboursement-commande/  → OrderRefundResponse (POST)
 *   - /api/v1/paiements/initier-paiement-direct/ → InitiatePaymentResponse (POST)
 *
 * @module modeles/wallets-paiements
 */

/* ============================================================
   ENUMS — Statuts et types métier
   ============================================================ */

/** Statut possible d'un wallet utilisateur */
export type WalletStatus = "active" | "suspendu" | "blocked";

/** Libellés humains des statuts wallet */
export const WALLET_STATUS_LABELS: Record<WalletStatus, string> = {
  active: "Actif",
  suspendu: "Suspendu",
  blocked: "Bloqué",
};

/** Fournisseur de paiement */
export type PaymentProvider = "paydunya" | "stripe";

/** Libellés humains des fournisseurs */
export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  paydunya: "PayDunya",
  stripe: "Stripe",
};

/** Type de paiement */
export type PaymentType =
  | "order_payment"
  | "wallet_topup"
  | "direct_payment"
  | "admin_withdraw";

/** Libellés humains des types de paiement */
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  order_payment: "Paiement de commande",
  wallet_topup: "Recharge de portefeuille",
  direct_payment: "Paiement direct",
  admin_withdraw: "Retrait administrateur",
};

/** Statut possible d'un paiement */
export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "cancelled"
  | "refunded";

/** Libellés humains des statuts paiement */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  success: "Réussi",
  failed: "Échoué",
  cancelled: "Annulé",
  refunded: "Remboursé",
};

/** Type de transaction wallet */
export type WalletTransactionType =
  | "deposit"
  | "withdrawal"
  | "payment"
  | "refund"
  | "cashback";

/** Libellés humains des types de transaction */
export const WALLET_TRANSACTION_TYPE_LABELS: Record<WalletTransactionType, string> = {
  deposit: "Dépôt",
  withdrawal: "Retrait",
  payment: "Paiement",
  refund: "Remboursement",
  cashback: "Cashback",
};

/** Statut d'une transaction wallet (sous-ensemble de PaymentStatus) */
export type WalletTransactionStatus = "pending" | "success" | "failed" | "cancelled";

/* ============================================================
   MODÈLES DE RÉPONSE BACKEND (READ-ONLY)
   Ces interfaces correspondent aux sérialiseurs Django en lecture.
   ============================================================ */

/**
 * AdminWallet — Sérialiseur complet du wallet pour l'administration.
 * Endpoint : GET /api/v1/paiements/admin/all-wallets/
 *            PATCH /api/v1/paiements/admin/wallets/{id}/status/
 */
export interface AdminWallet {
  /** UUID unique du wallet */
  id: string;
  /** Email de l'utilisateur propriétaire */
  user_email: string;
  /** Nom complet de l'utilisateur propriétaire */
  user_name: string;
  /** Solde actuel en FCFA (string décimal ex: "12500.00") */
  balance: string;
  /** Statut opérationnel du wallet */
  status: WalletStatus;
  /** Date de création ISO 8601 */
  created_at: string;
  /** Date de dernière mise à jour ISO 8601 */
  updated_at: string;
}

/**
 * Wallet — Vue simplifiée pour le client (son propre wallet).
 * Endpoint : GET /api/v1/paiements/my-wallet/
 */
export interface Wallet {
  /** UUID unique du wallet */
  id: string;
  /** Solde actuel en FCFA (string décimal) */
  balance: string;
  /** Statut opérationnel */
  status: WalletStatus;
  /** Date de création ISO 8601 */
  created_at: string;
  /** Date de dernière mise à jour ISO 8601 */
  updated_at: string;
}

/**
 * Payment — Détail complet d'un paiement.
 * Utilisé dans les réponses de : wallet/achat, remboursement, retrait admin.
 */
export interface Payment {
  /** UUID unique du paiement */
  id: string;
  /** UUID de la commande associée (null pour les recharges wallet) */
  order: string | null;
  /** Fournisseur de paiement utilisé */
  provider: PaymentProvider;
  /** Type de paiement */
  payment_type: PaymentType;
  /** Montant en FCFA (string décimal) */
  amount: string;
  /** Statut actuel du paiement */
  status: PaymentStatus;
  /** Token PayDunya ou autre référence externe */
  reference_externe: string;
  /** Date de création ISO 8601 */
  created_at: string;
}

/**
 * MyTransfer — Transaction unifiée pour l'historique global admin.
 * Endpoint : GET /api/v1/paiements/admin/all-transactions/
 * Fusionne les transactions Wallet, PayDunya et Remboursements.
 */
export interface MyTransfer {
  /** UUID unique de la transaction */
  id: string;
  /** Label humain du type (ex: "Recharge de portefeuille") */
  type_label: string;
  /** Label humain du statut (ex: "Réussi") */
  status_label: string;
  /** Label humain du fournisseur (ex: "PayDunya") */
  provider_label: string;
  /** Montant en FCFA (string décimal) */
  amount: string;
  /** Token PayDunya ou référence externe */
  reference_externe: string;
  /** UUID de la commande associée (null pour les recharges) */
  order: string | null;
  /** Référence lisible de la commande */
  order_reference: string;
  /** Date de création ISO 8601 */
  created_at: string;
}

/**
 * WalletTransaction — Historique des transactions d'un wallet spécifique.
 * Endpoint : GET /api/v1/paiements/wallet/historique-transactions/
 */
export interface WalletTransaction {
  /** UUID unique de la transaction */
  id: string;
  /** Type de la transaction */
  transaction_type: WalletTransactionType;
  /** Montant en FCFA (string décimal) */
  amount: string;
  /** Référence unique interne (UUID ou token) */
  reference: string;
  /** UUID de la commande associée (null si recharge) */
  order: string | null;
  /** Statut de la transaction */
  status: WalletTransactionStatus;
  /** Date de création ISO 8601 */
  created_at: string;
}

/* ============================================================
   PAYLOADS DE REQUÊTE (WRITE — POST / PATCH)
   ============================================================ */

/**
 * AdminWithdrawPayload — Corps de la requête POST pour un retrait Mobile Money.
 * Endpoint : POST /api/v1/paiements/admin/retrait-fonds/
 */
export interface AdminWithdrawPayload {
  /** Montant à retirer en FCFA (string décimal) */
  amount: string;
  /** Numéro Mobile Money du destinataire (max 30 char) */
  phone_number: string;
  /** Description optionnelle du retrait (max 255 char) */
  description?: string;
}

/**
 * WalletStatusUpdatePayload — Corps de la requête PATCH pour modifier le statut.
 * Endpoint : PATCH /api/v1/paiements/admin/wallets/{id}/status/
 */
export interface WalletStatusUpdatePayload {
  status: WalletStatus;
}

/**
 * DepositPayload — Corps de la requête POST pour recharger un wallet.
 * Endpoint : POST /api/v1/paiements/wallet/deposit/
 */
export interface DepositPayload {
  /** Montant en FCFA (string décimal) */
  amount: string;
  /** Numéro Mobile Money (max 30 char) */
  phone_number: string;
}

/**
 * WalletPayPayload — Corps de la requête POST pour payer via wallet.
 * Endpoint : POST /api/v1/paiements/wallet/achat/
 */
export interface WalletPayPayload {
  /** UUID de la commande à payer */
  order_id: string;
}

/**
 * OrderRefundPayload — Corps de la requête POST pour un remboursement.
 * Endpoint : POST /api/v1/paiements/remboursement-commande/
 */
export interface OrderRefundPayload {
  /** UUID de la commande à rembourser */
  order_id: string;
}

/**
 * InitiatePaymentPayload — Corps de la requête POST pour un paiement direct.
 * Endpoint : POST /api/v1/paiements/initier-paiement-direct/
 */
export interface InitiatePaymentPayload {
  /** UUID de la commande (null si paiement sans commande) */
  order_id?: string | null;
  /** Montant en FCFA (string décimal) */
  amount: string;
  /** Numéro Mobile Money (max 30 char) */
  phone_number: string;
}

/* ============================================================
   MODÈLES DE RÉPONSE POUR LES INITIATIONS DE PAIEMENT
   ============================================================ */

/**
 * WalletDepositResponse — Réponse d'une recharge wallet.
 * Endpoint : POST /api/v1/paiements/wallet/deposit/
 */
export interface WalletDepositResponse {
  payment_id: number;
  redirect_url: string;
  token: string;
}

/**
 * InitiatePaymentResponse — Réponse d'une initiation de paiement direct.
 * Endpoint : POST /api/v1/paiements/initier-paiement-direct/
 */
export interface InitiatePaymentResponse {
  payment_id: number;
  redirect_url: string;
  token: string;
}

/**
 * OrderRefundResponse — Réponse d'une demande de remboursement.
 * Endpoint : POST /api/v1/paiements/remboursement-commande/
 */
export interface OrderRefundResponse {
  detail: string;
  refunded_payments: Payment[];
}

/* ============================================================
   TYPES UTILITAIRES FRONTEND
   ============================================================ */

/**
 * PlatformStats — Statistiques calculées côté frontend à partir des données brutes.
 * Utilisées pour les cartes KPI de la section WalletSection.
 */
export interface PlatformStats {
  /** Solde total cumulé de tous les wallets actifs */
  totalBalance: number;
  /** Nombre total de wallets */
  totalWallets: number;
  /** Nombre de wallets actifs */
  activeWallets: number;
  /** Nombre de wallets suspendus ou bloqués */
  inactiveWallets: number;
  /** Nombre total de transactions */
  totalTransactions: number;
}
