// modeles/fidelites.ts
// Source de vérité pour tous les types du module de fidélité "Atelier du Terroir"

// ─── Enum des raisons d'événements de points ─────────────────────────────────

export type LoyaltyEventReason =
    | "purchase"
    | "refund"
    | "referral_bonus"
    | "first_purchase"
    | "birthday_bonus"
    | "points_expiry"
    | "admin_adjustment"
    | "order_discount";

/** Labels lisibles par raison d'événement */
export const LOYALTY_EVENT_LABELS: Record<LoyaltyEventReason, string> = {
    purchase: "Achat",
    refund: "Remboursement",
    referral_bonus: "Bonus parrainage",
    first_purchase: "Premier achat",
    birthday_bonus: "Bonus anniversaire",
    points_expiry: "Expiration de points",
    admin_adjustment: "Ajustement administrateur",
    order_discount: "Réduction commande",
};

/** Couleurs et icônes par raison d'événement */
export const LOYALTY_EVENT_CONFIG: Record<LoyaltyEventReason, {
    color: string;
    bg: string;
    border: string;
    icon: string;
}> = {
    purchase: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "ShoppingBag" },
    refund: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: "RotateCcw" },
    referral_bonus: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "Users" },
    first_purchase: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "Star" },
    birthday_bonus: { color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", icon: "Cake" },
    points_expiry: { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: "Clock" },
    admin_adjustment: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "Settings" },
    order_discount: { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "Percent" },
};

// ─── Configuration visuelle des paliers ──────────────────────────────────────

export const TIER_CONFIG: Record<string, {
    color: string;
    gradient: string;
    shimmer: string;
    textColor: string;
    border: string;
    bg: string;
    icon: string;
    rank: number;
}> = {
    Bronze: {
        color: "#CD7F32",
        gradient: "from-amber-700 via-orange-500 to-amber-600",
        shimmer: "from-amber-700/0 via-amber-400/40 to-amber-700/0",
        textColor: "text-amber-600",
        border: "border-amber-600/30",
        bg: "bg-amber-500/10",
        icon: "Medal",
        rank: 1,
    },
    Silver: {
        color: "#C0C0C0",
        gradient: "from-slate-400 via-gray-300 to-slate-400",
        shimmer: "from-slate-400/0 via-white/50 to-slate-400/0",
        textColor: "text-slate-400",
        border: "border-slate-400/30",
        bg: "bg-slate-400/10",
        icon: "Star",
        rank: 2,
    },
    Gold: {
        color: "#FFD700",
        gradient: "from-yellow-500 via-amber-300 to-yellow-400",
        shimmer: "from-yellow-500/0 via-yellow-200/60 to-yellow-500/0",
        textColor: "text-yellow-400",
        border: "border-yellow-400/30",
        bg: "bg-yellow-400/10",
        icon: "Crown",
        rank: 3,
    },
    Platinum: {
        color: "#E5E4E2",
        gradient: "from-cyan-400 via-sky-300 to-blue-400",
        shimmer: "from-cyan-400/0 via-white/60 to-cyan-400/0",
        textColor: "text-cyan-300",
        border: "border-cyan-400/30",
        bg: "bg-cyan-400/10",
        icon: "Gem",
        rank: 4,
    },
    Diamond: {
        color: "#B9F2FF",
        gradient: "from-violet-500 via-purple-400 to-fuchsia-400",
        shimmer: "from-violet-500/0 via-fuchsia-300/60 to-violet-500/0",
        textColor: "text-violet-300",
        border: "border-violet-400/30",
        bg: "bg-violet-400/10",
        icon: "Star",
        rank: 5,
    },
};

/** Retourne la config d'un palier par nom (avec fallback Bronze) */
export const getTierConfig = (tierName: string) =>
    TIER_CONFIG[tierName] ?? TIER_CONFIG["Bronze"];

// ─── Interfaces Backend ───────────────────────────────────────────────────────

/** Palier de fidélité (readOnly depuis le backend) */
export interface Tier {
    readonly id: string;
    readonly name: string;
    readonly min_points: number;
    readonly min_solde: string;
    readonly discount_percent: string;
}

/** Informations de l'utilisateur liées au profil */
export interface LoyaltyUser {
    readonly id: number;
    readonly email: string;
    readonly name: string;
    readonly role: string;
    readonly phone_number: string;
    readonly profile_image: string | null;
    readonly is_active: boolean;
    readonly is_verified: boolean;
}

/** Profil de fidélité complet d'un utilisateur */
export interface LoyaltyProfile {
    readonly id: string;
    readonly user: LoyaltyUser;
    readonly tier: Tier;
    readonly tier_name: string;
    readonly points_balance: number;
    readonly total_points_earned: number;
    readonly total_points_gagne: number;
    readonly total_solde: string;
    readonly next_tier: { name: string; points_needed: number } | null;
    readonly created_at: string;
}

/** Événement individuel dans le journal de points */
export interface LoyaltyEvent {
    readonly id: string;
    readonly points_delta: number;
    readonly new_points_balance_after: number;
    readonly reason: LoyaltyEventReason;
    readonly reason_display: string;
    readonly description: string;
    readonly created_at: string;
}

/** Payload pour ajustement manuel de points (admin) */
export interface AdminAdjustPointsPayload {
    user_id: string;
    points: number;
    reason: string;
}

/** Réponse après ajustement admin */
export interface AdminAdjustPointsResponse {
    readonly success: boolean;
    readonly user_email: string;
    readonly points_adjusted: number;
    readonly new_balance: number;
}

/** Payload pour dépense de points */
export interface RedeemPointsPayload {
    points_to_spend: number;
    order_id: string;
}

/** Réponse après dépense de points */
export interface RedeemPointsResponse {
    readonly success: boolean;
    readonly points_spent: number;
    readonly discount_amount: string;
    readonly order_total_after: string;
}

// ─── Types utilitaires Frontend ───────────────────────────────────────────────

/** Agrégats calculés côté frontend à partir de la liste des profils */
export interface LoyaltyStats {
    totalMembers: number;
    totalPointsEarned: number;
    totalPointsBalance: number;
    totalSpend: number;
    byTier: Record<string, number>;
}

/** Calcule les stats agrégées depuis la liste des profils */
export function computeLoyaltyStats(profiles: LoyaltyProfile[]): LoyaltyStats {
    const byTier: Record<string, number> = {};
    let totalPointsEarned = 0;
    let totalPointsBalance = 0;
    let totalSpend = 0;

    for (const p of profiles) {
        totalPointsEarned += p.total_points_earned;
        totalPointsBalance += p.points_balance;
        totalSpend += parseFloat(p.total_solde || "0");
        byTier[p.tier_name] = (byTier[p.tier_name] || 0) + 1;
    }

    return {
        totalMembers: profiles.length,
        totalPointsEarned,
        totalPointsBalance,
        totalSpend,
        byTier,
    };
}
