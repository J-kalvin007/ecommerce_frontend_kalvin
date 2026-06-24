"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/pannierStore";
import { useThemeStore } from "@/store/theme.store";

// API
import { validateOrder } from "@/fonctions_api/commandes.api";
import { getMyWallet, payWithWallet } from "@/fonctions_api/wallets-paiements.api";
import { getMyLoyaltyProfile, redeemLoyaltyPoints } from "@/fonctions_api/fidelites.api";
import { getFraisLivraison } from "@/fonctions_api/livraisons.api";

// Types
import { OrderDetail } from "@/modeles/commandes";
import { Wallet } from "@/modeles/wallets-paiements";
import { LoyaltyProfile } from "@/modeles/fidelites";

// Utilitaires de facturation
import { generateInvoicePDFBase64, InvoiceData } from "@/lib/invoice_pdf_generator";

// Composants nouvellement créés
import PaysSelector from "./PaysSelector";
import LocalisationCarte from "./LocalisationCarte";
import ModeLivraisonSelector, { OptionLivraisonId } from "./ModeLivraisonSelector";
// import CodePromoInput, { CodePromoApplique } from "./CodePromoInput";
import PointsFideliteCard from "./PointsFideliteCard";
import RecapitulatifCommande from "./RecapitulatifCommande";
import WalletCard from "./WalletCard";
import ModaleRecharge from "./ModaleRecharge";
import ModaleResultatPaiement from "./ModaleResultatPaiement";
import PayDunyaCheckout from "./PayDunyaCheckout";
import CodePromoInput, { CodePromoApplique } from "./CodePromoInput";
import PhoneInputWithCountry from "@/components/special/PhoneInputWithCountry";
import Toast from "@/components/special/Toast";

/* ------------------------------------------------------------------ */
/*  Types & constantes                                                  */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: 1, label: "Adresse", icon: MapPin },
  { id: 2, label: "Livraison", icon: Truck },
  { id: 3, label: "Paiement", icon: CreditCard },
  { id: 4, label: "Confirmation", icon: CheckCircle2 },
] as const;

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

export default function CommandesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams?.get("payment") === "success";
  
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  const { items, getTotal, getItemCount, clearCart } = useCartStore();
  const itemCount = getItemCount();
  const subtotal = getTotal();

  // État du flux (si on revient avec success, on force l'étape 4)
  const [step, setStep] = useState(paymentSuccess ? 4 : 1);
  const [shipping, setShipping] = useState<OptionLivraisonId>("standard");
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
  const [loadingData, setLoadingData] = useState(false);

  // Modales
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  // État des frais de livraison dynamiques
  const [fraisLivraisonAdmin, setFraisLivraisonAdmin] = useState<{prix_livraison: number, coordonnee_admin: {lat: number, lng: number}} | null>(null);
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
  const shippingCost = shipping === "standard" ? (dynamicShippingCost !== null ? dynamicShippingCost : 2500) : 0; // Seul standard est actif pour l'instant
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
          const [resWallet, resLoyalty] = await Promise.all([
            getMyWallet(),
            getMyLoyaltyProfile(),
          ]);
          if (resWallet.ok) setWallet(resWallet.data);
          if (resLoyalty.ok) setLoyaltyProfile(resLoyalty.data);
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
        setPaymentStatus("success");
        setPaymentMessage("Votre paiement a été effectué avec succès. Votre facture vous sera envoyée par email.");
        setResultModalOpen(true);

        // Envoi de la facture en arrière-plan (Snapshot des données du panier avant le clearCart)
        const orderRef = order.reference || "REF-INCONNU";
        const snapshotItems = [...items];
        const snapshotSubtotal = subtotal;

        const invoiceData: InvoiceData = {
          reference: orderRef,
          date: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()),
          customer: {
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            phone: address.phone,
            address: address.address,
            city: address.city,
            country: address.country,
          },
          items: snapshotItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: parseFloat(item.price),
            total: parseFloat(item.price) * item.quantity
          })),
          subtotal: snapshotSubtotal,
          shipping: shippingCost,
          discount: remisePromo,
          loyaltyDiscount: remiseFideliteFCFA,
          total: total
        };

        generateInvoicePDFBase64(invoiceData).then(pdfBase64 => {
          fetch('/api/orders/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: address.email,
              name: `${address.firstName} ${address.lastName}`,
              orderReference: orderRef,
              pdfBase64
            })
          }).catch(err => console.error("Erreur API Facture", err));
        }).catch(err => console.error("Erreur Génération PDF", err));

        clearCart();
        setStep(4);
      } else {
        setPaymentStatus("error");
        setPaymentMessage(res.error?.message || "Solde insuffisant ou erreur de paiement.");
        setResultModalOpen(true);
      }
    } catch (err) {
      setPaymentStatus("error");
      setPaymentMessage("Une erreur inattendue est survenue.");
      setResultModalOpen(true);
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
      <div className="page-transition flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-20">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-alt">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Votre panier est vide</h1>
          <p className="mt-2 text-muted">Ajoutez des produits avant de passer commande</p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1f4d3f]/90"
        >
          Découvrir la boutique <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const bgElevated = isDark ? "rgba(255,255,255,0.02)" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div className="page-transition min-h-screen pb-20">
      {/* En-tête Stepper */}
      <div className="border-b" style={{ borderColor: border, background: isDark ? "rgba(14,26,17,0.5)" : "#fafaf9" }}>
        <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold lg:text-3xl">Finalisation</h1>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
              <Lock className="h-3.5 w-3.5" />
              Paiement sécurisé
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 sm:gap-4">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
                    step >= s.id
                      ? "bg-[#1f4d3f] text-white shadow-lg"
                      : "bg-surface-alt text-muted"
                  )}
                  style={step < s.id ? { background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" } : {}}
                >
                  <s.icon className="h-4 w-4" />
                  <span className={cn(step === s.id ? "inline" : "hidden sm:inline")}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    className={cn("h-4 w-4", step > s.id ? "text-[#1f4d3f]" : "opacity-30")}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* === Colonne Principale === */}
          <div className="lg:col-span-7 xl:col-span-8">
            <AnimatePresence mode="wait">
              {/* --- ÉTAPE 1 : Adresse --- */}
              {step === 1 && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="mb-5 font-display text-[1.1rem] font-bold">Informations de livraison</h2>
                  <div className="space-y-5 rounded-2xl p-5 shadow-sm" style={{ background: bgElevated, border: `1px solid ${border}` }}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Prénom" value={address.firstName} onChange={(v) => updateAddress("firstName", v)} required />
                      <InputField label="Nom" value={address.lastName} onChange={(v) => updateAddress("lastName", v)} required />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Email" type="email" value={address.email} onChange={(v) => updateAddress("email", v)} required />
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Téléphone <span className="text-[#1f4d3f]">*</span></label>
                        <PhoneInputWithCountry value={address.phone} onChange={(v) => updateAddress("phone", v)} required />
                      </div>
                    </div>

                    <div className="border-t pt-4" style={{ borderColor: border }}>
                      <label className="mb-2 block text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Localisation GPS & Adresse</label>
                      <LocalisationCarte value={address.address} onChange={(v) => updateAddress("address", v)} />
                    </div>

                    <InputField label="Informations complémentaires (Bâtiment, Étage...)" value={address.addressLine2} onChange={(v) => updateAddress("addressLine2", v)} />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Ville" value={address.city} onChange={(v) => updateAddress("city", v)} required />
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Pays</label>
                        <PaysSelector value={address.country} onChange={(v) => updateAddress("country", v)} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- ÉTAPE 2 : Livraison --- */}
              {step === 2 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="mb-6 font-display text-xl font-bold">Mode de livraison</h2>
                  <ModeLivraisonSelector 
                    value={shipping} 
                    onChange={setShipping} 
                    dynamicStandardPrice={dynamicShippingCost}
                  />
                </motion.div>
              )}

              {/* --- ÉTAPE 3 : Paiement --- */}
              {step === 3 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="mb-6 font-display text-xl font-bold">Méthode de paiement</h2>

                  {/* Choix de la méthode */}
                  <div className="mb-8 grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod("wallet")}
                      className="flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all"
                      style={{
                        borderColor: paymentMethod === "wallet" ? "#1f4d3f" : border,
                        background: paymentMethod === "wallet" ? "rgba(31,77,63,0.05)" : bgElevated,
                        boxShadow: paymentMethod === "wallet" ? "0 4px 20px rgba(31,77,63,0.1)" : "none",
                      }}
                    >
                      <div className={cn("rounded-full p-3", paymentMethod === "wallet" ? "bg-[#1f4d3f] text-white" : "bg-surface-alt text-muted")}>
                        <WalletIcon className="h-6 w-6" />
                      </div>
                      <span className="font-bold">Mon Portefeuille</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("paydunya")}
                      className="flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all"
                      style={{
                        borderColor: paymentMethod === "paydunya" ? "#0f76b5" : border, // PayDunya blue
                        background: paymentMethod === "paydunya" ? "rgba(15,118,181,0.05)" : bgElevated,
                        boxShadow: paymentMethod === "paydunya" ? "0 4px 20px rgba(15,118,181,0.1)" : "none",
                      }}
                    >
                      <div className={cn("rounded-full p-3", paymentMethod === "paydunya" ? "bg-[#0f76b5] text-white" : "bg-surface-alt text-muted")}>
                        <Phone className="h-6 w-6" />
                      </div>
                      <span className="font-bold">Mobile Money</span>
                    </button>
                  </div>

                  {/* Interfaces spécifiques au paiement */}
                  {paymentMethod === "wallet" && (
                    <WalletCard
                      wallet={wallet}
                      totalAPayer={total}
                      onOpenRecharge={() => setRechargeModalOpen(true)}
                    />
                  )}

                  {paymentMethod === "paydunya" && order && (
                    <PayDunyaCheckout orderId={order.id} amount={total} />
                  )}
                </motion.div>
              )}

              {/* --- ÉTAPE 4 : Confirmation --- */}
              {step === 4 && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 rounded-3xl p-8 text-center lg:p-12"
                  style={{ background: bgElevated, border: `1px solid ${border}` }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h2 className="font-display text-3xl font-bold">Commande confirmée !</h2>
                  <p className="max-w-md text-sm leading-relaxed text-muted">
                    Merci pour votre commande. Nous la préparons avec le plus grand soin.
                    Vous recevrez un email de confirmation à <strong>{address.email}</strong>.
                  </p>
                  <div className="rounded-2xl px-8 py-4" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f8f9f8" }}>
                    <p className="text-xs uppercase tracking-widest text-muted mb-1">N° de commande</p>
                    <p className="font-mono text-xl font-black text-[#1f4d3f]">
                      {order?.reference || "REF-ATTENTE"}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/products"
                      className="flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105"
                    >
                      Continuer mes achats <ArrowRight className="h-5 w-5" />
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
                  className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all hover:bg-surface-alt"
                >
                  <ArrowLeft className="h-4 w-4" /> Retour
                </button>

                {step === 1 && (
                  <button
                    onClick={handleNext}
                    disabled={!canProceedStep1 || isProcessing}
                    className="cursor-pointer flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-[#1f4d3f]/90 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuer"} <ArrowRight className="h-5 w-5" />
                  </button>
                )}

                {step === 2 && (
                  <button
                    onClick={handleNext}
                    className="cursor-pointer flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-[#1f4d3f]/90"
                  >
                    Aller au paiement <ArrowRight className="h-5 w-5" />
                  </button>
                )}

                {step === 3 && paymentMethod === "wallet" && (
                  <button
                    onClick={handlePayWithWallet}
                    disabled={isProcessing || !wallet || parseFloat(wallet.balance) < total}
                    className="cursor-pointer flex items-center gap-2 rounded-xl bg-[#1f4d3f] px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-[#1f4d3f]/90 disabled:opacity-50"
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
              <div className="sticky top-28 space-y-6">

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
                  <h4 className="mb-4 font-bold">Dans votre panier ({itemCount})</h4>
                  <ul className="space-y-4">
                    {items.map((item) => (
                      <li key={item.productId} className="flex gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                          {item.image && (
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
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

                {/* Sécurité */}
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Shield className="h-4 w-4" />
                  Transaction protégée par chiffrement 256-bit
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <ModaleRecharge
        open={rechargeModalOpen}
        onOpenChange={setRechargeModalOpen}
        montantDefaut={Math.max(5000, total - (wallet ? parseFloat(wallet.balance) : 0))}
      />

      <ModaleResultatPaiement
        open={resultModalOpen}
        status={paymentStatus}
        message={paymentMessage}
        orderReference={order?.reference}
        onClose={() => setResultModalOpen(false)}
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
        {label} {required && <span className="text-[#1f4d3f]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg py-2.5 px-3.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[#1f4d3f]/20 focus:border-[#1f4d3f]"
        style={{
          background: inputBg,
          border: `1px solid ${border}`,
        }}
      />
    </div>
  );
}
