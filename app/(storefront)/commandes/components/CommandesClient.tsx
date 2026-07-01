



"use client";

/* ============================================================================
 *  CommandesClient.tsx
 * ----------------------------------------------------------------------------
 *  Tunnel de commande premium.
 *
 *  Direction artistique :
 *  - Palette ancrée sur le vert forêt de marque (#1f4d3f) associé à un
 *    champagne/or discret (#c9a876) réservé aux accents de précision
 *    (fil de progression, badges de confiance, micro-détails de luxe).
 *  - Typographie : la classe "font-display" existante porte l'émotion sur
 *    les titres, le corps reste sur la police utilitaire du design system.
 *  - Signature visuelle : un "fil d'or" qui relie les étapes du stepper et
 *    se déploie en fonction de la progression réelle de la commande, plus
 *    une respiration ambiante (halos radiaux très doux) en arrière-plan.
 *  - Toute la logique métier (hooks, handlers, state, API) est strictement
 *    identique à la version d'origine : seules la structure JSX, les
 *    classes et les micro-interactions ont été enrichies.
 * ==========================================================================*/

import { mediaUrl } from "@/lib/mediaUrl";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Lock,
  ArrowLeft,
  ArrowRight,
  Shield,
  Wallet as WalletIcon,
  Phone,
  Loader2,
  Sparkles,
  Receipt,
  BadgeCheck,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useThemeStore } from "@/store/theme.store";

// API
import { validateOrder } from "@/fonctions_api/commandes.api";
import { getMyWallet, payWithWallet } from "@/fonctions_api/wallets-paiements.api";
import { getMyLoyaltyProfile, redeemLoyaltyPoints, getPointValue } from "@/fonctions_api/fidelites.api";
import { getFraisLivraison } from "@/fonctions_api/livraisons.api";

// Types
import { OrderDetail } from "@/modeles/commandes";
import { Wallet } from "@/modeles/wallets-paiements";
import { LoyaltyProfile, PointValue } from "@/modeles/fidelites";

// Composants nouvellement créés
import PaysSelector from "./PaysSelector";
import LocalisationCarte from "./LocalisationCarte";
import PointsFideliteCard from "./PointsFideliteCard";
import RecapitulatifCommande from "./RecapitulatifCommande";
import WalletCard from "./WalletCard";
import ModaleRecharge from "./ModaleRecharge";
import ModaleResultatPaiement from "./ModaleResultatPaiement";
import PayDunyaCheckout from "./PayDunyaCheckout";
import CodePromoInput, { CodePromoApplique } from "./CodePromoInput";
import PhoneInputWithCountry from "@/components/special/PhoneInputWithCountry";
import Toast from "@/components/special/Toast";
import ConfirmPaiementModal from "@/components/special/confirmPaiement";
import { useUIStore } from "@/store/uiStore";

/* ------------------------------------------------------------------ */
/*  Types & constantes                                                  */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: 1, label: "Adresse", icon: MapPin },
  { id: 2, label: "Paiement", icon: CreditCard },
  { id: 3, label: "Confirmation", icon: CheckCircle2 },
] as const;

/* Jetons de design "premium" — dérivés du vert de marque existant.
 * L'or n'est utilisé qu'avec parcimonie : fil de progression, anneaux
 * de focus ponctuels, badges de confiance. Tout le reste reste discret. */
const BRAND_FOREST = "#1f4d3f";
const BRAND_GOLD = "#c9a876";
const BRAND_GOLD_SOFT = "rgba(201,168,118,0.16)";

interface AddressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string; // Stockera "Texte Adresse|lat&lng"
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Rayon de la terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en km
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

/* Variants Framer Motion réutilisés pour les révélations en cascade.
 * Purement présentationnel : n'affecte aucune logique métier. */
const fieldsContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const fieldItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function CommandesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams?.get("payment") === "success";

  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";
  const prefersReducedMotion = useReducedMotion();

  const { items, getTotal, getItemCount, clearCart } = useCartStore();
  const itemCount = getItemCount();
  const subtotal = getTotal();

  // État du flux (si on revient avec success, on force l'étape 4)
  const [step, setStep] = useState(paymentSuccess ? 4 : 1);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paydunya">("wallet");
  const [isProcessing, setIsProcessing] = useState(false);

  // Notification Toast
  const [toastConfig, setToastConfig] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "info",
    message: ""
  });

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastConfig({ show: true, type, message });
  };

  // Formulaire d'adresse
  const [address, setAddress] = useState<AddressForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "TG", // Togo par défaut
  });

  const updateAddress = (field: keyof AddressForm, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  // État de la commande & réductions
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [codeApplique, setCodeApplique] = useState<CodePromoApplique | null>(null);
  const [pointsAppliques, setPointsAppliques] = useState(0);
  const [remiseFideliteFCFA, setRemiseFideliteFCFA] = useState(0);

  // État Wallet & Fidélité
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loyaltyProfile, setLoyaltyProfile] = useState<LoyaltyProfile | null>(null);
  const [pointValueConfig, setPointValueConfig] = useState<PointValue | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Modales
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  /** Contrôle la modale de confirmation de paiement wallet */
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Actions Zustand pour le parcours de paiement
  const setPaymentOrderRef = useUIStore((s) => s.setPaymentOrderRef);

  // État des frais de livraison dynamiques
  const [fraisLivraisonAdmin, setFraisLivraisonAdmin] = useState<{ prix_livraison: number, coordonnee_admin: { lat: number, lng: number } } | null>(null);
  const [dynamicShippingCost, setDynamicShippingCost] = useState<number | null>(null);

  // Fetch frais livraison au montage
  useEffect(() => {
    getFraisLivraison().then(res => {
      if (res.ok && res.data.coordonnee_admin) {
        const coords = res.data.coordonnee_admin.split(",");
        if (coords.length >= 2) {
          setFraisLivraisonAdmin({
            prix_livraison: parseFloat(res.data.prix_livraison),
            coordonnee_admin: { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) }
          });
        }
      }
    });
  }, []);

  // Calcul dynamique des frais de livraison
  useEffect(() => {
    if (fraisLivraisonAdmin && address.address) {
      const parts = address.address.split("|");
      if (parts.length > 1) {
        const coordsStr = parts[1].split("&");
        if (coordsStr.length > 1) {
          const lat = parseFloat(coordsStr[0]);
          const lng = parseFloat(coordsStr[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            const distance = getDistanceFromLatLonInKm(
              lat,
              lng,
              fraisLivraisonAdmin.coordonnee_admin.lat,
              fraisLivraisonAdmin.coordonnee_admin.lng
            );
            const basePrice = fraisLivraisonAdmin.prix_livraison;
            const calculatedCost = Math.ceil(distance * basePrice);
            // On s'assure d'avoir au moins le prix de base si la distance est trop faible
            setDynamicShippingCost(calculatedCost > basePrice ? calculatedCost : basePrice);
          }
        }
      }
    }
  }, [address.address, fraisLivraisonAdmin]);

  // Coûts
  const shippingCost = (dynamicShippingCost !== null ? dynamicShippingCost : 0);
  const remisePromo = codeApplique ? parseFloat(codeApplique.discount_amount) : 0;
  const total = Math.max(0, subtotal + shippingCost - remisePromo - remiseFideliteFCFA);

  // Validation Étape 1
  const canProceedStep1 = useMemo(() => {
    return (
      address.firstName &&
      address.lastName &&
      address.email &&
      address.phone &&
      address.address &&
      address.city &&
      address.country
    );
  }, [address]);

  // Chargement des données au montage de l'étape 2 ou 3
  useEffect(() => {
    if (step >= 2) {
      const loadPaymentData = async () => {
        setLoadingData(true);
        try {
          const [resWallet, resLoyalty, resPointValue] = await Promise.all([
            getMyWallet(),
            getMyLoyaltyProfile(),
            getPointValue(),
          ]);
          if (resWallet.ok) setWallet(resWallet.data);
          if (resLoyalty.ok) setLoyaltyProfile(resLoyalty.data);
          if (resPointValue.ok) setPointValueConfig(resPointValue.data);
        } catch (error) {
          console.error("Erreur chargement données de paiement", error);
        } finally {
          setLoadingData(false);
        }
      };
      loadPaymentData();
    }
  }, [step]);

  // Passage à l'étape suivante
  const handleNext = async () => {
    if (step === 1) {
      // Création de la commande brouillon au passage à l'étape 2
      setIsProcessing(true);
      const res = await validateOrder({
        address_livraison: address.address,
        phone_livraison: address.phone,
        city: address.city,
        country: address.country,
        notes: address.addressLine2,
        frais_livraison: shippingCost,
        discount_amount: remisePromo + remiseFideliteFCFA,
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      });
      setIsProcessing(false);

      if (res.ok) {
        setOrder(res.data);
        setStep(2);
      } else {
        showToast("error", "Erreur lors de la validation de l'adresse : " + (res.error?.message || ""));
      }
    } else {
      setStep(step + 1);
    }
  };

  // Paiement via Wallet
  const handlePayWithWallet = async () => {
    if (!order) return;
    setIsProcessing(true);
    // Fermer la modale de confirmation pendant le traitement
    setConfirmModalOpen(false);

    try {
      // Si des points de fidélité sont appliqués, les déduire d'abord
      if (pointsAppliques > 0) {
        await redeemLoyaltyPoints({
          points_to_spend: pointsAppliques,
          order_id: order.id,
        });
      }

      const res = await payWithWallet({ order_id: order.id });

      if (res.ok) {
        /**
         * Succès : on nettoie le panier et on redirige vers la page de succès
         * dédiée avec la référence de commande. La facture est désormais
         * envoyée par email via le service SMTP Django (signal post-save).
         */
        clearCart();
        router.push(`/paiement/commande/success?ref=${encodeURIComponent(order.reference || "")}`);
      } else {
        /**
         * Échec : on redirige vers la page d'échec dédiée. Le panier est
         * conservé grâce à Zustand (pannierStore) pour que l'utilisateur
         * puisse reprendre sans ressaisir ses informations.
         */
        router.push("/paiement/commande/echec");
      }
    } catch (err) {
      // En cas d'exception réseau, même comportement : page d'échec
      router.push("/paiement/commande/echec");
    } finally {
      setIsProcessing(false);
    }
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    if (paymentSuccess) {
      clearCart();
    }
  }, [paymentSuccess, clearCart]);

  if (!isMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (itemCount === 0 && step !== 4) {
    return (
      <div className="page-transition relative flex min-h-[60vh] flex-col items-center justify-center gap-6 overflow-hidden px-4 py-20">
        {/* Halo ambiant très discret, cohérent avec l'identité premium du tunnel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: isDark
              ? "radial-gradient(60% 50% at 50% 0%, rgba(31,77,63,0.25), transparent 70%)"
              : "radial-gradient(60% 50% at 50% 0%, rgba(31,77,63,0.06), transparent 70%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-alt shadow-inner"
        >
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
        </motion.div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Votre panier est vide</h1>
          <p className="mt-2 text-muted">Ajoutez des produits avant de passer commande</p>
        </div>
        <Link
          href="/products"
          className="group flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1f4d3f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f4d3f]/90 hover:shadow-xl hover:shadow-[#1f4d3f]/30"
        >
          Découvrir la boutique
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  const bgElevated = isDark ? "rgba(255,255,255,0.02)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  // Progression réelle du fil de stepper (0 → 1), bornée pour l'étape 4 (post-paiement)
  const stepperProgress = Math.min(1, Math.max(0, (step - 1) / (STEPS.length - 1)));

  return (
    <div className="page-transition relative min-h-screen overflow-hidden pb-20">
      {/* --------------------------------------------------------------
       *  Halos ambiants — signature visuelle discrète du tunnel premium
       * ------------------------------------------------------------ */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: isDark
            ? "radial-gradient(45% 35% at 12% 0%, rgba(31,77,63,0.28), transparent 70%), radial-gradient(40% 30% at 100% 10%, rgba(201,168,118,0.08), transparent 70%)"
            : "radial-gradient(45% 35% at 12% 0%, rgba(31,77,63,0.07), transparent 70%), radial-gradient(40% 30% at 100% 10%, rgba(201,168,118,0.10), transparent 70%)",
        }}
      />

      {/* En-tête Stepper */}
      <div
        className="sticky top-0 z-20 border-b backdrop-blur-md"
        style={{ borderColor: border, background: isDark ? "rgba(14,26,17,0.72)" : "rgba(250,250,249,0.82)" }}
      >
        <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: BRAND_GOLD }}
              >
                Étape {Math.min(step, STEPS.length)} sur {STEPS.length}
              </p>
              <h1 className="font-display text-2xl font-bold lg:text-3xl">Finalisation</h1>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)",
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${border}`,
              }}
            >
              <Lock className="h-3.5 w-3.5" style={{ color: BRAND_FOREST }} />
              Paiement sécurisé
            </div>
          </div>

          {/* ----------------------------------------------------------
           *  Stepper premium : fil de progression animé (or) reliant
           *  les pastilles d'étape — la signature visuelle du tunnel.
           * -------------------------------------------------------- */}
          <div className="relative mt-7">
            {/* Rail de fond */}
            {/* <div
              aria-hidden
              className="absolute left-5 right-5 top-5 h-[2px] sm:left-6 sm:right-6"
              style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
            /> */}
            {/* Fil de progression doré, animé en largeur */}
            {/* <motion.div
              aria-hidden
              className="absolute left-5 top-5 h-[2px] sm:left-6"
              style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD})` }}
              initial={false}
              animate={{ width: `calc(${stepperProgress * 100}% - ${stepperProgress > 0 ? 8 : 0}px)` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            /> */}

            <div className="relative flex items-center justify-between sm:justify-start sm:gap-8">
              {STEPS.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2 sm:flex-row sm:gap-2.5">
                    <motion.div
                      className="relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                      animate={{
                        scale: isActive ? 1.08 : 1,
                        boxShadow: isActive
                          ? `0 0 0 4px ${BRAND_GOLD_SOFT}`
                          : "0 0 0 0px transparent",
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        background: isActive || isDone ? BRAND_FOREST : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                        color: isActive || isDone ? "#ffffff" : isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)",
                      }}
                    >
                      {isDone ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </motion.span>
                      ) : (
                        <s.icon className="h-4.5 w-4.5" />
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-wide sm:text-xs",
                        isActive ? "opacity-100" : "opacity-60"
                      )}
                      style={{ color: isActive ? BRAND_FOREST : undefined }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* === Colonne Principale === */}
          <div className="lg:col-span-7 xl:col-span-8">
            <AnimatePresence mode="wait">
              {/* --- ÉTAPE 1 : Adresse --- */}
              {step === 1 && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SectionHeading
                    eyebrow="01"
                    title="Informations de livraison"
                    subtitle="Ces informations nous permettent de préparer et d'acheminer votre commande avec précision."
                    isDark={isDark}
                  />

                  <motion.div
                    variants={fieldsContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6 rounded-2xl p-5 shadow-sm sm:p-7"
                    style={{ background: bgElevated, border: `1px solid ${border}` }}
                  >
                    {/* Sous-section : Identité & contact */}
                    <FieldGroupLabel label="Identité & contact" isDark={isDark} />
                    <motion.div variants={fieldItemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Prénom" value={address.firstName} onChange={(v) => updateAddress("firstName", v)} required />
                      <InputField label="Nom" value={address.lastName} onChange={(v) => updateAddress("lastName", v)} required />
                    </motion.div>
                    <motion.div variants={fieldItemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-end">
                      <InputField label="Email" type="email" value={address.email} onChange={(v) => updateAddress("email", v)} required />
                      <div className="flex flex-col">
                        <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Téléphone <span style={{ color: BRAND_FOREST }}>*</span></label>
                        <PhoneInputWithCountry value={address.phone} onChange={(v) => updateAddress("phone", v)} required />
                      </div>
                    </motion.div>

                    {/* Sous-section : Localisation */}
                    <motion.div variants={fieldItemVariants} className="border-t pt-5" style={{ borderColor: border }}>
                      <FieldGroupLabel label="Localisation GPS & adresse" isDark={isDark} icon={MapPin} />
                      <LocalisationCarte value={address.address} onChange={(v) => updateAddress("address", v)} />
                    </motion.div>

                    <motion.div variants={fieldItemVariants}>
                      <InputField label="Informations complémentaires (Bâtiment, Étage...)" value={address.addressLine2} onChange={(v) => updateAddress("addressLine2", v)} />
                    </motion.div>

                    {/* Sous-section : Ville & pays */}
                    <motion.div variants={fieldItemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Ville" value={address.city} onChange={(v) => updateAddress("city", v)} required />
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Pays</label>
                        <PaysSelector value={address.country} onChange={(v) => updateAddress("country", v)} />
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}



              {/* --- ÉTAPE 2 : Paiement --- */}
              {step === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SectionHeading
                    eyebrow="02"
                    title="Méthode de paiement"
                    subtitle="Choisissez comment régler votre commande, en toute confiance."
                    isDark={isDark}
                  />

                  {/* Choix de la méthode */}
                  <div className="mb-8 grid grid-cols-2 gap-4">
                    <PaymentMethodCard
                      active={paymentMethod === "wallet"}
                      onClick={() => setPaymentMethod("wallet")}
                      icon={WalletIcon}
                      label="Mon Portefeuille"
                      accentColor={BRAND_FOREST}
                      accentBg="rgba(31,77,63,0.06)"
                      accentShadow="rgba(31,77,63,0.12)"
                      bgElevated={bgElevated}
                      border={border}
                    />
                    <PaymentMethodCard
                      active={paymentMethod === "paydunya"}
                      onClick={() => setPaymentMethod("paydunya")}
                      icon={Phone}
                      label="Mobile Money"
                      accentColor="#0f76b5"
                      accentBg="rgba(15,118,181,0.06)"
                      accentShadow="rgba(15,118,181,0.12)"
                      bgElevated={bgElevated}
                      border={border}
                    />
                  </div>

                  {/* Interfaces spécifiques au paiement */}
                  <AnimatePresence mode="wait">
                    {paymentMethod === "wallet" && (
                      <motion.div
                        key="wallet-ui"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <WalletCard
                          wallet={wallet}
                          totalAPayer={total}
                          onOpenRecharge={() => setRechargeModalOpen(true)}
                        />
                      </motion.div>
                    )}

                    {paymentMethod === "paydunya" && order && (
                      <motion.div
                        key="paydunya-ui"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        {/* PayDunyaCheckout reçoit la référence commande pour la
                            stocker dans Zustand avant la redirection PayDunya */}
                        <PayDunyaCheckout
                          orderId={order.id}
                          amount={total}
                          orderReference={order.reference || undefined}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* --- ÉTAPE 3 : Confirmation --- */}
              {step === 3 && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl p-8 text-center lg:p-14"
                  style={{ background: bgElevated, border: `1px solid ${border}` }}
                >
                  {/* Liseré doré supérieur — détail de finition premium */}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{ background: `linear-gradient(90deg, ${BRAND_FOREST}, ${BRAND_GOLD}, ${BRAND_FOREST})` }}
                  />

                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </motion.div>

                  <div>
                    <h2 className="font-display text-3xl font-bold">Commande confirmée !</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                      Merci pour votre commande. Nous la préparons avec le plus grand soin.
                      Vous recevrez un email de confirmation à <strong>{address.email}</strong>.
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-3 rounded-2xl px-8 py-4"
                    style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f8f9f8", border: `1px solid ${border}` }}
                  >
                    <Receipt className="h-5 w-5 shrink-0" style={{ color: BRAND_GOLD }} />
                    <div className="text-left">
                      <p className="mb-0.5 text-[11px] uppercase tracking-widest text-muted">N° de commande</p>
                      <p className="font-mono text-xl font-black" style={{ color: BRAND_FOREST }}>
                        {order?.reference || "REF-ATTENTE"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Link
                      href="/products"
                      className="group flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-8 py-4 font-bold text-white shadow-lg shadow-[#1f4d3f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f4d3f]/90 hover:shadow-xl hover:shadow-[#1f4d3f]/30"
                    >
                      Continuer mes achats
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Stepper (uniquement pour < 4) */}
            {step < 4 && (
              <div className="mt-8 flex items-center justify-between border-t pt-8" style={{ borderColor: border }}>
                <button
                  onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
                  className="group flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all duration-300 hover:bg-surface-alt"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" /> Retour
                </button>

                {step === 1 && (
                  <button
                    onClick={handleNext}
                    disabled={!canProceedStep1 || isProcessing}
                    className="group flex cursor-pointer items-center gap-2 rounded-xl bg-[#1f4d3f] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#1f4d3f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f4d3f]/90 hover:shadow-xl hover:shadow-[#1f4d3f]/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuer"}
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                )}

                {step === 2 && (
                  <button
                    onClick={handleNext}
                    className="group flex cursor-pointer items-center gap-2 rounded-xl bg-[#1f4d3f] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#1f4d3f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f4d3f]/90 hover:shadow-xl hover:shadow-[#1f4d3f]/30"
                  >
                    Aller au paiement
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                )}

                {step === 3 && paymentMethod === "wallet" && (
                  <button
                    onClick={() => setConfirmModalOpen(true)}
                    disabled={isProcessing || !wallet || parseFloat(wallet.balance) < total}
                    className="group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-[#1f4d3f] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#1f4d3f]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f4d3f]/90 hover:shadow-xl hover:shadow-[#1f4d3f]/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <><Lock className="h-5 w-5" /> Payer {formatCurrency(String(total), "FCFA")}</>
                    )}
                  </button>
                )}

                {/* PayDunya gère son propre bouton, donc on n'affiche rien ici à l'étape 3 si PayDunya est sélectionné */}
                {step === 3 && paymentMethod === "paydunya" && (
                  <div />
                )}
              </div>
            )}
          </div>

          {/* === Colonne Récapitulatif === */}
          {step < 4 && (
            <div className="lg:col-span-5 xl:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="sticky top-28 space-y-6"
              >
                {/* Récap Coûts */}
                <RecapitulatifCommande
                  sousTotal={subtotal}
                  fraisLivraison={shippingCost}
                  remisePromo={remisePromo}
                  remiseFidelite={remiseFideliteFCFA}
                />

                {/* Promotions & Fidélité (affiché aux étapes 2 et 3) */}
                {step >= 2 && (
                  <div className="space-y-4">
                    <CodePromoInput
                      cartTotal={subtotal + shippingCost}
                      codeApplique={codeApplique}
                      onCodeChange={setCodeApplique}
                    />
                    <PointsFideliteCard
                      profil={loyaltyProfile}
                      totalCommande={subtotal + shippingCost - remisePromo}
                      valeurPointFCFA={pointValueConfig?.valeur_un_point_frcfa ?? 10}
                      pointsAppliques={pointsAppliques}
                      onPointsChange={(pts, fcfa) => {
                        setPointsAppliques(pts);
                        setRemiseFideliteFCFA(fcfa);
                      }}
                    />
                  </div>
                )}

                {/* Articles du panier */}
                <div className="rounded-3xl p-6" style={{ background: bgElevated, border: `1px solid ${border}` }}>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-bold">Dans votre panier</h4>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{ background: BRAND_GOLD_SOFT, color: BRAND_GOLD }}
                    >
                      {itemCount} article{itemCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {items.map((item) => (
                      <li key={item.productId} className="group flex gap-4 transition-transform duration-300 hover:-translate-y-0.5">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-alt shadow-sm">
                          {(item.image || item.productImage) ? (
                            <Image
                              src={mediaUrl(item.image || item.productImage) || "/placeholder.png"}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="64px"
                              unoptimized
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                // Si l'image primaire échoue, tenter productImage
                                if (item.productImage && target.src !== (mediaUrl(item.productImage) || "")) {
                                  target.src = mediaUrl(item.productImage) || "/placeholder.png";
                                } else {
                                  target.style.display = "none";
                                }
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-muted/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="truncate font-semibold text-sm">{item.name}</p>
                          <p className="mt-1 text-xs text-muted">Qté: {item.quantity}</p>
                        </div>
                        <span className="pt-1 font-bold text-sm">
                          {formatCurrency(String(parseFloat(item.price) * item.quantity), item.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Informations de livraison estimée (utilise l'icône Truck déjà importée) */}
                {shippingCost > 0 && (
                  <div
                    className="flex items-center gap-2.5 rounded-2xl p-4 text-xs"
                    style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${border}` }}
                  >
                    <Truck className="h-4 w-4 shrink-0" style={{ color: BRAND_FOREST }} />
                    <span className="text-muted">
                      Frais de livraison calculés selon votre position : <strong className="font-semibold">{formatCurrency(String(shippingCost), "FCFA")}</strong>
                    </span>
                  </div>
                )}

                {/* Sécurité */}
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Shield className="h-4 w-4" />
                  Transaction protégée par chiffrement 256-bit
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {/* Modale de recharge wallet
          isInCommandFlow=true : la recharge est déclenchée depuis le tunnel
          commande, le flag Zustand sera positionné avant la redirection PayDunya */}
      <ModaleRecharge
        open={rechargeModalOpen}
        onOpenChange={setRechargeModalOpen}
        montantDefaut={Math.max(5000, total - (wallet ? parseFloat(wallet.balance) : 0))}
        isInCommandFlow={true}
      />

      <ModaleResultatPaiement
        open={resultModalOpen}
        status={paymentStatus}
        message={paymentMessage}
        orderReference={order?.reference}
        onClose={() => setResultModalOpen(false)}
      />

      {/* Modale de confirmation de paiement wallet — affichée avant l'appel API */}
      <ConfirmPaiementModal
        open={confirmModalOpen}
        amount={total}
        walletBalance={wallet ? parseFloat(wallet.balance) : 0}
        customerName={address.firstName || undefined}
        orderReference={order?.reference || undefined}
        isProcessing={isProcessing}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handlePayWithWallet}
      />

      <Toast
        show={toastConfig.show}
        type={toastConfig.type}
        message={toastConfig.message}
        onClose={() => setToastConfig({ ...toastConfig, show: false })}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-composants présentationnels (purement visuels, sans état métier) */
/* ------------------------------------------------------------------ */

/**
 * En-tête de section premium : numéro repère discret + titre + sous-titre.
 * Le numéro encode une vraie séquence (les étapes du tunnel), donc son
 * usage ici est justifié et non décoratif.
 */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  isDark,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  isDark: boolean;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold"
        style={{ background: BRAND_GOLD_SOFT, color: BRAND_GOLD }}
      >
        {eyebrow}
      </span>
      <div>
        <h2 className="font-display text-[1.15rem] font-bold leading-tight">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-[13px]" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/** Étiquette discrète pour regrouper visuellement un sous-ensemble de champs. */
function FieldGroupLabel({
  label,
  isDark,
  icon: Icon,
}: {
  label: string;
  isDark: boolean;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5" style={{ color: BRAND_GOLD }} />}
      <span
        className="text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
      >
        {label}
      </span>
    </div>
  );
}

/** Carte de sélection d'une méthode de paiement, avec micro-interactions raffinées. */
function PaymentMethodCard({
  active,
  onClick,
  icon: Icon,
  label,
  accentColor,
  accentBg,
  accentShadow,
  bgElevated,
  border,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accentColor: string;
  accentBg: string;
  accentShadow: string;
  bgElevated: string;
  border: string;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        borderColor: active ? accentColor : border,
        background: active ? accentBg : bgElevated,
        boxShadow: active ? `0 8px 24px ${accentShadow}` : "none",
      }}
    >
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md"
          style={{ background: accentColor }}
        >
          <BadgeCheck className="h-3.5 w-3.5" />
        </motion.div>
      )}
      <div
        className={cn("rounded-full p-3 transition-colors duration-300", active ? "text-white" : "bg-surface-alt text-muted")}
        style={active ? { background: accentColor } : undefined}
      >
        <Icon className="h-6 w-6" />
      </div>
      <span className="font-bold">{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-composant InputField (Conservé et amélioré)                  */
/* ------------------------------------------------------------------ */

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

function InputField({ label, type = "text", value, onChange, placeholder, required }: InputFieldProps) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.02)" : "#fcfcfc";

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
        {label} {required && <span style={{ color: BRAND_FOREST }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-[45px] rounded-lg px-3.5 text-sm outline-none transition-all duration-200 focus:border-[#1f4d3f] focus:ring-2 focus:ring-[#1f4d3f]/20"
        style={{
          background: inputBg,
          border: `1px solid ${border}`,
        }}
      />
    </div>
  );
}