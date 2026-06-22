// hooks/useApplyPromoCode.ts
"use client";

import { useState } from "react";
import { validatePromoCode } from "@/fonctions_api/promotions.api";
import { useCartStore } from "@/store/pannierStore";
import { useAuthStore } from "@/store/authStore";
import type { PromoCodeList } from "@/modeles/promotions";

interface ApplyResult {
    ok: boolean;
    message: string;
    reason?: "login" | "error";
}

export function useApplyPromoCode() {
    const [applyingCode, setApplyingCode] = useState<string | null>(null);
    const { user } = useAuthStore();
    const { promoCode, setPromoCode, getSubtotal, toggleDrawer } = useCartStore();

    const applyCode = async (
        code: string,
        options?: { promo?: PromoCodeList }
    ): Promise<ApplyResult> => {
        // Vérification de la connexion utilisateur
        if (!user) {
            return {
                ok: false,
                message: "Veuillez vous connecter pour utiliser un code promo.",
                reason: "login",
            };
        }

        setApplyingCode(code.toUpperCase());

        try {
            // Sous-total avant application du code
            const subtotal = getSubtotal().toString();

            // Appel API de validation
            const result = await validatePromoCode({
                code: code.trim(),
                cart_total: subtotal,
            });

            if (result.ok && result.data.valid) {
                // Application du code dans le store panier
                const discount = parseFloat(result.data.discount_amount);
                setPromoCode(code.toUpperCase(), discount);
                return {
                    ok: true,
                    message: `Code appliqué : -${result.data.discount_amount} FCFA`,
                };
            } else if (result.ok && !result.data.valid) {
                return {
                    ok: false,
                    //   message: result.data.detail || "Code invalide ou conditions non remplies.",
                    message: "Code invalide ou conditions non remplies.",
                };
            } else {
                return {
                    ok: false,
                    //   message: result.error?.message || "Erreur lors de la validation.",
                    message: "Erreur lors de la validation.",
                };
            }
        } catch {
            return { ok: false, message: "Impossible d'appliquer le code." };
        } finally {
            setApplyingCode(null);
        }
    };

    return {
        applyCode,
        applyingCode,
        activePromoCode: promoCode, // directement depuis le store
    };
}