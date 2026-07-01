# Plan d'Implémentation — Refonte complète Parcours de Paiement & UX Premium

## Contexte

Refonte chirurgicale du tunnel de paiement e-commerce (Next.js + Django). 8 axes principaux : correction du bug wallet, modale de confirmation, service SMTP Django pour la facture, pages de succès/échec ultra-premium avec Lottie, gestion Zustand pour PayDunya et la recharge wallet, ouverture PayDunya dans le même onglet.

---

## User Review Required

> [!IMPORTANT]
> **Suppression totale de l'API locale `/api/orders/send-invoice`** : l'envoi de facture PDF est migré côté Django (SMTP + Celery). Toute logique frontend liée à `generateInvoicePDFBase64` et à la route Next.js correspondante sera supprimée de `CommandesClient.tsx`.

> [!WARNING]
> **PayDunya return/cancel URLs** : les URLs de retour de PayDunya dans `local.py` seront mises à jour pour pointer vers les nouvelles pages dédiées (`/paiement/commande/success` et `/paiement/commande/echec`, `/paiement/wallet/success` et `/paiement/wallet/echec`).

> [!CAUTION]
> **Bug critique wallet identifié** : dans `CommandesClient.tsx`, le bouton "Payer" à l'étape 3 (`step === 3`) appelle `handlePayWithWallet` mais ce bouton n'est rendu que si `step === 3 && paymentMethod === "wallet"`. Le problème est que l'étape 3 est la page de confirmation, mais visuellement c'est l'étape 2 qui montre le wallet. **Le flux logique passe de l'étape 2 (méthode) à l'étape 3 (confirmation+paiement) via "Aller au paiement" — cependant l'UI de la méthode de paiement est affichée à l'étape 2, et le bouton de paiement à l'étape 3 est masqué si step n'est pas exactement 3. Le problème de fond est que l'utilisateur clique "Aller au paiement" depuis l'étape 2 pour passer à l'étape 3, mais rien n'appelle `handlePayWithWallet` automatiquement ou intuitivement.** La correction: ajouter la modale de confirmation avant l'appel API, et s'assurer que le bouton de paiement au step=3 est bien visible et fonctionnel.

---

## Open Questions

> [!NOTE]
> **SMTP production** : les settings de production SMTP (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, etc.) doivent être injectés via variables d'environnement. En local, Mailpit sur port 1025 est déjà configuré — aucun changement requis côté `local.py` pour le SMTP, seulement ajout du service `FactureEmailService`.

> [!NOTE]
> **Génération PDF côté Django** : La génération du PDF de facture utilisera `reportlab` (déjà courant en Django) ou une template HTML → PDF avec `weasyprint`. Je vais implémenter une version simple avec `reportlab` pour ne pas introduire de nouvelles dépendances complexes. Si `reportlab` n'est pas disponible, l'email enverra les données structurées en HTML sans PDF joint.

---

## Proposed Changes

### 1. Store Zustand — Extension `uiStore.ts`

#### [MODIFY] [uiStore.ts](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/store/uiStore.ts)

Ajout de 4 nouveaux champs pour le parcours de paiement :
- `paymentOrderRef: string | null` — référence commande stockée pour PayDunya (retour automatique)
- `setPaymentOrderRef: (ref: string | null) => void`
- `inCommandFlow: boolean` — true si la recharge wallet est déclenchée depuis le tunnel commande
- `setInCommandFlow: (v: boolean) => void`

---

### 2. Composant — Modale de Confirmation Paiement Wallet

#### [MODIFY] [confirmPaiement.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/components/special/confirmPaiement.tsx)

Actuellement vide. Implémenter un composant `ConfirmPaiementModal` :
- Dialog premium glassmorphism
- Récapitulatif : montant, source (wallet), solde actuel
- Boutons : "Annuler" et "Confirmer le paiement"
- État de chargement sur le bouton confirmer
- Animation d'entrée Framer Motion

---

### 3. Correction + Enrichissement `CommandesClient.tsx`

#### [MODIFY] [CommandesClient.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/app/(storefront)/commandes/components/CommandesClient.tsx)

**Corrections** :
- **Bug wallet** : ajouter `confirmModalOpen: boolean` et `setConfirmModalOpen` en state. Le bouton "Payer" à l'étape 3 ouvre la modale de confirmation au lieu d'appeler directement `handlePayWithWallet`. La confirmation dans la modale déclenche `handlePayWithWallet`.
- **Suppression** de toute la logique `generateInvoicePDFBase64` et de l'appel à `/api/orders/send-invoice` — la facture est maintenant gérée côté Django.
- **Suppression** de l'import `generateInvoicePDFBase64` et `InvoiceData`.
- **PayDunya** : dans `PayDunyaCheckout`, remplacer `window.open(..., "_blank")` par `window.location.href = res.data.payment_url`. Avant la redirection, stocker la référence de commande dans `useUIStore().setPaymentOrderRef(order.reference)`.
- **Recharge wallet** : dans `ModaleRecharge`, avant la redirection PayDunya, appeler `useUIStore().setInCommandFlow(true)` si déclenchée depuis le tunnel commande. Transmettre via prop `isInCommandFlow` à `ModaleRecharge`.
- **Redirection succès wallet** : remplacer `setStep(4)` et `setResultModalOpen(true)` par `router.push(\`/paiement/commande/success?ref=${order.reference}\`)`.
- **Redirection échec wallet** : remplacer l'ouverture de `ModaleResultatPaiement` avec status error par `router.push(\`/paiement/commande/echec\`)`.

**Ajouts** :
- Import du composant `ConfirmPaiementModal` depuis `@/components/special/confirmPaiement`.
- Import de `useUIStore` depuis `@/store/uiStore`.
- Rendu du composant `ConfirmPaiementModal` avec les props nécessaires.

---

### 4. Composant PayDunyaCheckout — Correction ouverture onglet

#### [MODIFY] [PayDunyaCheckout.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/app/(storefront)/commandes/components/PayDunyaCheckout.tsx)

- Remplacer `window.open(res.data.payment_url, "_blank", ...)` par `window.location.href = res.data.payment_url`
- Ajouter la prop `orderReference?: string` pour stocker la ref dans Zustand avant redirection
- Ajouter prop `onBeforeRedirect?: () => void` pour permettre au parent de nettoyer l'état

---

### 5. Composant ModaleRecharge — Ajout flag `inCommandFlow`

#### [MODIFY] [ModaleRecharge.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/app/(storefront)/commandes/components/ModaleRecharge.tsx)

- Ajouter prop `isInCommandFlow?: boolean`
- Avant `window.location.href = res.data.payment_url`, si `isInCommandFlow`, appeler `useUIStore().setInCommandFlow(true)`

---

### 6. Pages Next.js — Succès et Échec Commande

#### [MODIFY] [paiement/commande/success/page.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/app/(storefront)/paiement/commande/success/page.tsx)

Page ultra-premium créée from scratch :
- Lecture `?ref=XXX` ou fallback depuis `useUIStore().paymentOrderRef`
- Lottie `success_01.json` en grand, animation confettis
- Message chaleureux avec prénom client
- Compteur 5s visible avec barre de progression circulaire
- Redirection auto → `/commandes/[reference]`
- Nettoie `paymentOrderRef` du store après utilisation

#### [MODIFY] [paiement/commande/echec/page.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/app/(storefront)/paiement/commande/echec/page.tsx)

Page ultra-premium créée from scratch :
- Lottie `faild.json` ou `attention.json`
- Message chaleureux d'erreur
- 2 CTAs : "Réessayer avec le wallet" et "Payer avec PayDunya"
- Les 2 redirigent vers `/commandes` (données conservées dans Zustand/panier)

---

### 7. Pages Next.js — Succès et Échec Recharge Wallet

#### [MODIFY] [paiement/wallet/success/page.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/app/(storefront)/paiement/wallet/success/page.tsx)

Page ultra-premium :
- Lottie `success_01.json`
- Lit `inCommandFlow` depuis Zustand
- Si `true` → après 5s, redirige vers `/commandes` + remet `inCommandFlow` à `false`
- Si `false` → redirige vers `/customer/wallet`
- Affiche message adapté au contexte

#### [MODIFY] [paiement/wallet/echec/page.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/app/(storefront)/paiement/wallet/echec/page.tsx)

Page ultra-premium :
- Lottie `attention.json`
- Lit `inCommandFlow` depuis Zustand
- Si `true` → proposer retour `/commandes` ou autre méthode
- Si `false` → retour `/customer/wallet`

---

### 8. Backend Django — Service FactureEmailService

#### [MODIFY] [services.py](file:///c:/Travaux_informatiques/Django/ecommerce_backend/ecommerce_backend/apps/commandes/services.py)

Ajout de la classe `FactureEmailService` :
```python
class FactureEmailService:
    @staticmethod
    def send_invoice_email(order: Order) -> bool:
        """Génère le HTML de facture et envoie par email au client via SMTP."""
```

Utilise `django.core.mail.send_mail` ou `EmailMultiAlternatives` pour envoyer un email HTML riche avec résumé de la commande (sans dépendance externe PDF dans un premier temps — génération PDF reportlab optionnelle).

#### [MODIFY] [signals.py](file:///c:/Travaux_informatiques/Django/ecommerce_backend/ecommerce_backend/apps/commandes/signals.py)

Ajout d'un signal `post_save` sur `Order` :
- Déclenche `FactureEmailService.send_invoice_email` via `transaction.on_commit` lorsque le statut passe à `"paid"`
- Pattern transactionnel pour éviter l'envoi si la transaction DB est annulée

#### [MODIFY] [views.py](file:///c:/Travaux_informatiques/Django/ecommerce_backend/ecommerce_backend/apps/commandes/views.py)

- Supprimer tout envoi de PDF dans les réponses de paiement (si présent)
- Ajouter commentaire documentant la migration vers SMTP

#### [MODIFY] [base.py](file:///c:/Travaux_informatiques/Django/ecommerce_backend/ecommerce_backend/config/settings/base.py)

- Documenter les variables SMTP de production (EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD via env vars)
- S'assurer que `DEFAULT_FROM_EMAIL` est correctement configuré

#### [MODIFY] [local.py](file:///c:/Travaux_informatiques/Django/ecommerce_backend/ecommerce_backend/config/settings/local.py)

- Mise à jour des URLs PayDunya return/cancel pour les nouvelles pages :
  - `PAYDUNYA_RETURN_URL` → `/paiement/commande/success`
  - `PAYDUNYA_CANCEL_URL` → `/paiement/commande/echec`
  - `PAYDUNYA_WALLET_SUCCESS_URL` → `/paiement/wallet/success`
  - `PAYDUNYA_WALLET_CANCEL_URL` → `/paiement/wallet/echec`

---

### 9. Page OrderDetailClient — Ajout bouton "Continuer mes achats"

#### [MODIFY] [OrderDetailClient.tsx](file:///c:/Travaux_informatiques/Next.Js/ecommerce_frontend_kalvin/app/(storefront)/commandes/[reference]/OrderDetailClient.tsx)

- Le bouton "Continuer mes achats" existe déjà (ligne 771-783)
- Ajouter une mise en valeur visuelle supplémentaire (animation d'entrée) pour le cas de retour depuis la page succès

---

## Verification Plan

### Automated Tests
- `npm run build` pour vérifier aucune erreur TypeScript
- Vérification Django : `python manage.py check`

### Manual Verification
1. **Flux wallet** : Commander → Étape 2 → Wallet → Étape 3 → Clic "Payer" → Modale confirmation → Confirmer → Redirection `/paiement/commande/success?ref=XXX` → Attente 5s → Redirection `/commandes/XXX`
2. **Flux PayDunya** : Commander → Étape 2 → PayDunya → Clic "Payer avec PayDunya" → Redirection même onglet vers PayDunya → Retour automatique vers `/paiement/commande/success` → Récupération ref depuis Zustand
3. **Flux recharge wallet depuis commande** : Solde insuffisant → "Recharger" → `inCommandFlow = true` → PayDunya recharge → Retour `/paiement/wallet/success` → Redirection auto vers `/commandes`
4. **Email facture** : Vérifier réception dans Mailpit après paiement wallet réussi
5. **Failure wallet** : Simuler échec → Redirection `/paiement/commande/echec` → Vérifier données panier conservées
