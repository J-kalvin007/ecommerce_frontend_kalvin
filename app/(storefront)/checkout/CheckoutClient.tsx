/**
 * CheckoutClient — Flux de commande multi-étapes premium
 *
 * Étapes : 1) Adresse  2) Livraison  3) Paiement  4) Confirmation
 *
 * @module app/checkout/CheckoutClient
 */

"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Truck, CreditCard, CheckCircle2, ChevronRight,
  ShoppingBag, Lock, ArrowLeft, ArrowRight, Shield,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

/* ------------------------------------------------------------------ */
/*  Types & constantes                                                  */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: 1, label: "Adresse", icon: MapPin },
  { id: 2, label: "Livraison", icon: Truck },
  { id: 3, label: "Paiement", icon: CreditCard },
  { id: 4, label: "Confirmation", icon: CheckCircle2 },
] as const;

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard", delay: "5-7 jours", price: 2500, icon: "📦" },
  { id: "express", label: "Express", delay: "2-3 jours", price: 5000, icon: "🚀" },
  { id: "overnight", label: "Livraison 24h", delay: "Demain", price: 10000, icon: "⚡" },
] as const;

interface AddressForm {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; addressLine2: string; city: string;
  postalCode: string; country: string;
}

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

export default function CheckoutClient() {
  const router = useRouter();
  const { items, getTotal, getItemCount, clearCart } = useCartStore();
  const itemCount = getItemCount();
  const subtotal = getTotal();

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const [address, setAddress] = useState<AddressForm>({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", addressLine2: "", city: "",
    postalCode: "", country: "FR",
  });

  const shippingCost = SHIPPING_OPTIONS.find((o) => o.id === shipping)?.price ?? 2500;
  const total = subtotal + shippingCost;

  const updateAddress = (field: keyof AddressForm, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  /* Validation basique de l'étape courante */
  const canProceed = useMemo(() => {
    if (step === 1) {
      return address.firstName && address.lastName && address.email && address.address && address.city && address.postalCode;
    }
    return true;
  }, [step, address]);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simuler l'appel API
    await new Promise((r) => setTimeout(r, 2000));
    setIsProcessing(false);
    setStep(4);
  };

  /* Panier vide → rediriger */
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
        <Link href="/products" className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
          Découvrir la boutique <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* En-tête */}
      <div className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold lg:text-3xl">Checkout</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" />
              Paiement sécurisé SSL
            </div>
          </div>
          {/* Stepper */}
          <div className="mt-6 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  step >= s.id ? "bg-primary text-white" : "bg-surface-alt text-muted"
                )}>
                  <s.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className={cn("h-4 w-4", step > s.id ? "text-primary" : "text-border")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max-width)] px-[var(--spacing-page-x)] py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* === Colonne formulaire === */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* --- ÉTAPE 1 : Adresse --- */}
              {step === 1 && (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="mb-6 font-display text-xl font-bold">Adresse de livraison</h2>
                  <div className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Prénom" value={address.firstName} onChange={(v) => updateAddress("firstName", v)} required />
                      <InputField label="Nom" value={address.lastName} onChange={(v) => updateAddress("lastName", v)} required />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputField label="Email" type="email" value={address.email} onChange={(v) => updateAddress("email", v)} required />
                      <InputField label="Téléphone" type="tel" value={address.phone} onChange={(v) => updateAddress("phone", v)} />
                    </div>
                    <InputField label="Adresse" value={address.address} onChange={(v) => updateAddress("address", v)} required />
                    <InputField label="Complément d'adresse" value={address.addressLine2} onChange={(v) => updateAddress("addressLine2", v)} />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <InputField label="Ville" value={address.city} onChange={(v) => updateAddress("city", v)} required />
                      <InputField label="Code postal" value={address.postalCode} onChange={(v) => updateAddress("postalCode", v)} required />
                      <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1.5 block text-sm font-medium">Pays</label>
                        <select value={address.country} onChange={(e) => updateAddress("country", e.target.value)}
                          className="w-full rounded-xl border border-border bg-surface py-3 px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                          <option value="FR">France</option>
                          <option value="BE">Belgique</option>
                          <option value="CH">Suisse</option>
                          <option value="CA">Canada</option>
                          <option value="MA">Maroc</option>
                          <option value="SN">Sénégal</option>
                          <option value="CI">Côte d&apos;Ivoire</option>
                          <option value="US">États-Unis</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- ÉTAPE 2 : Livraison --- */}
              {step === 2 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="mb-6 font-display text-xl font-bold">Mode de livraison</h2>
                  <div className="space-y-3">
                    {SHIPPING_OPTIONS.map((opt) => (
                      <button key={opt.id} onClick={() => setShipping(opt.id)}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all",
                          shipping === opt.id ? "border-primary bg-primary/5 shadow-md" : "border-border bg-surface-elevated hover:border-primary/30"
                        )}>
                        <span className="text-2xl">{opt.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{opt.label}</p>
                          <p className="text-sm text-muted">{opt.delay}</p>
                        </div>
                        <span className="text-lg font-bold">{formatCurrency(String(opt.price), "FCFA")}</span>
                        <div className={cn("flex h-5 w-5 items-center justify-center rounded-full border-2",
                          shipping === opt.id ? "border-primary bg-primary" : "border-border")}>
                          {shipping === opt.id && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* --- ÉTAPE 3 : Paiement --- */}
              {step === 3 && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="mb-6 font-display text-xl font-bold">Paiement</h2>
                  {/* Méthodes */}
                  <div className="mb-6 flex gap-3">
                    {[
                      { id: "card", label: "Carte bancaire", icon: "💳" },
                      { id: "wallet", label: "Portefeuille", icon: "👛" },
                      { id: "mobile", label: "Mobile Money", icon: "📱" },
                    ].map((m) => (
                      <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                        className={cn(
                          "flex flex-1 flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
                          paymentMethod === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        )}>
                        <span className="text-2xl">{m.icon}</span>
                        <span className="text-xs font-semibold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                  {/* Formulaire carte */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-6">
                      <InputField label="Numéro de carte" placeholder="1234 5678 9012 3456" value="" onChange={() => { }} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Date d'expiration" placeholder="MM/AA" value="" onChange={() => { }} />
                        <InputField label="CVV" placeholder="123" value="" onChange={() => { }} />
                      </div>
                      <InputField label="Titulaire de la carte" placeholder="Jean Dupont" value="" onChange={() => { }} />
                    </div>
                  )}
                  {paymentMethod === "wallet" && (
                    <div className="rounded-2xl border border-border bg-surface-elevated p-6 text-center">
                      <p className="text-lg font-semibold">Solde du portefeuille</p>
                      <p className="mt-1 text-3xl font-bold text-primary">0 FCFA</p>
                      <p className="mt-2 text-sm text-muted">Rechargez votre portefeuille pour utiliser ce mode</p>
                    </div>
                  )}
                  {paymentMethod === "mobile" && (
                    <div className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-6">
                      <InputField label="Numéro de téléphone" placeholder="+33 6 12 34 56 78" value="" onChange={() => { }} />
                      <p className="text-sm text-muted">Vous recevrez un code de validation par SMS</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* --- ÉTAPE 4 : Confirmation --- */}
              {step === 4 && (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-surface-elevated p-8 text-center lg:p-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">Commande confirmée !</h2>
                  <p className="max-w-md text-muted">
                    Merci pour votre commande ! Vous recevrez un email de confirmation avec les détails
                    de suivi à <strong>{address.email || "votre adresse email"}</strong>.
                  </p>
                  <div className="rounded-xl bg-surface-alt px-6 py-3">
                    <p className="text-sm text-muted">N° de commande</p>
                    <p className="font-mono text-lg font-bold text-primary">SAF-{Date.now().toString(36).toUpperCase()}</p>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link href="/products" onClick={() => clearCart()}
                      className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
                      Continuer les achats <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation entre étapes */}
            {step < 4 && (
              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                  className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-all hover:bg-surface-alt">
                  <ArrowLeft className="h-4 w-4" /> Retour
                </button>
                {step < 3 ? (
                  <button onClick={() => setStep(step + 1)} disabled={!canProceed}
                    className={cn("flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all",
                      canProceed ? "bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow" : "cursor-not-allowed bg-primary/50")}>
                    Continuer <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={handlePlaceOrder} disabled={isProcessing}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-glow-strong">
                    {isProcessing ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Traitement...</>
                    ) : (
                      <><Lock className="h-4 w-4" /> Payer {formatCurrency(String(total), "FCFA")}</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* === Colonne récapitulatif === */}
          {step < 4 && (
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-2xl border border-border bg-surface-elevated p-6">
                <h3 className="mb-4 font-display text-lg font-bold">Récapitulatif</h3>
                {/* Articles */}
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted">Qté: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {formatCurrency(String(parseFloat(item.price) * item.quantity), item.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="my-4 border-t border-border" />
                {/* Totaux */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Sous-total</span><span>{formatCurrency(String(subtotal), "FCFA")}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Livraison</span><span>{formatCurrency(String(shippingCost), "FCFA")}</span></div>
                </div>
                <div className="my-3 border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(String(total), "FCFA")}</span>
                </div>
                {/* Trust */}
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/5 px-3 py-2 text-xs text-success">
                  <Shield className="h-4 w-4" />
                  Paiement sécurisé 256-bit SSL
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sous-composant InputField                                           */
/* ------------------------------------------------------------------ */

function InputField({ label, type = "text", value, onChange, placeholder, required }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-border bg-surface py-3 px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
      />
    </div>
  );
}
