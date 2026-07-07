import { apiPublic } from "@/lib/axios";
import { getPublicProducts } from "@/fonctions_api/produits.api";
import { getActivePromoCodes, getActiveSales } from "@/fonctions_api/promotions.api";
import type { ProductListItem } from "@/modeles";

type ChatProductSuggestion = {
  name: string;
  price: string;
  slug: string;
};

type ChatLinkSuggestion = {
  label: string;
  href: string;
};

export type ChatAssistantResponse = {
  reply: string;
  products: ChatProductSuggestion[];
  links?: ChatLinkSuggestion[];
};

type ProductVariantLite = {
  name: string;
  price: string;
  stock: number;
  weight_grams?: number | null;
};

type CatalogProduct = ProductListItem & {
  variants?: ProductVariantLite[];
  discount_price?: string | null;
};

function productPageUrl(slug: string): string {
  return `/products/${slug.trim()}`;
}

const ORDERS_LINK: ChatLinkSuggestion = { label: "Mes commandes", href: "/customer/commandes" };
const PROMO_LINK: ChatLinkSuggestion = { label: "Voir les promotions", href: "/promotions" };
const BOUTIQUE_LINK: ChatLinkSuggestion = { label: "Voir la boutique", href: "/products" };
const CONTACT_LINK: ChatLinkSuggestion = { label: "Nous contacter", href: "/contact" };

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matches(message: string, terms: string[]): boolean {
  return terms.some((term) => message.includes(normalizeText(term)));
}

function isDeliveryIntent(message: string): boolean {
  if (matches(message, ["livraison", "livrez", "livre", "expedition", "expedie", "delai", "delais"])) {
    return true;
  }

  if (matches(message, ["lome"]) && matches(message, ["livraison", "livrez", "livre", "frais", "delai", "delais", "cout", "tarif"])) {
    return true;
  }

  return matches(message, ["frais", "cout", "tarif"])
    && matches(message, ["livraison", "delai", "delais", "livrez", "livre", "lome"]);
}

export function isNonProductIntentMessage(userMessage: string): boolean {
  const message = normalizeText(userMessage);

  if (matches(message, ["endommage", "abime", "different", "recu", "reclamation"])) return true;
  if (matches(message, ["suivre", "suivi", "statut"]) && matches(message, ["commande", "paiement"])) return true;
  if (matches(message, ["paiement", "payer", "mobile money", "flooz", "t-money", "paydunya", "carte"])) return true;
  if (isDeliveryIntent(message)) return true;
  if (matches(message, ["promotion", "promotions", "promo", "reduction", "solde", "soldes", "offre", "offres"])) return true;
  if (matches(message, ["bonjour", "bjr", "salut", "hello"])) return true;
  if (matches(message, ["contact", "telephone", "email"])) return true;
  if (matches(message, ["retour", "rembours"])) return true;
  if (
    message.includes("a quoi sert")
    || message.includes("but du site")
    || message.includes("que vendez")
    || message.includes("que proposez")
    || message.includes("qui etes vous")
  ) {
    return true;
  }

  return false;
}

function parseAmount(value: string): number {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} FCFA`;
}

function toChatProducts(products: CatalogProduct[], limit = 3): ChatProductSuggestion[] {
  return products
    .map((product) => {
      const slug = product.slug?.trim();
      if (!slug) return null;
      return { name: product.name, price: product.price, slug };
    })
    .filter((product): product is ChatProductSuggestion => product !== null)
    .slice(0, limit);
}

function findByName(catalog: CatalogProduct[], ...terms: string[]): CatalogProduct | undefined {
  return catalog.find((product) => {
    const haystack = normalizeText(product.name);
    return terms.some((term) => haystack.includes(normalizeText(term)));
  });
}

function findAllByName(catalog: CatalogProduct[], ...terms: string[]): CatalogProduct[] {
  return catalog.filter((product) => {
    const haystack = normalizeText(`${product.name} ${product.category_name ?? ""}`);
    return terms.some((term) => haystack.includes(normalizeText(term)));
  });
}

function findByCategory(catalog: CatalogProduct[], ...terms: string[]): CatalogProduct[] {
  return catalog.filter((product) => {
    const category = normalizeText(product.category_name ?? "");
    return terms.some((term) => category.includes(normalizeText(term)));
  });
}

const MEAT_TERMS = [
  "viande", "volaille", "poulet", "lapin", "pintade", "canard", "dinde",
  "boeuf", "porc", "mouton", "chevre", "caprin",
];

const ANIMAL_TERMS = [...MEAT_TERMS, "oeuf", "oeufs"];

const CULTIVATED_CATEGORY_TERMS = [
  "legume", "fruit", "cereale", "grain", "epice", "tubercule", "legumineuse",
  "maraicher", "ferme", "verger", "plantation",
];

const CULTIVATED_NAME_TERMS = [
  "tomate", "oignon", "mais", "riz", "haricot", "fonio", "manioc", "igname",
  "patate", "gombo", "aubergine", "piment", "carotte", "chou", "salade",
  "concombre", "banane", "orange", "mangue", "ananas", "mil", "sorgho",
  "arachide", "soja", "sesame", "gingembre", "curcuma", "betterave",
];

function productHaystack(product: CatalogProduct): string {
  return normalizeText(`${product.name} ${product.category_name ?? ""}`);
}

function isMeatProduct(product: CatalogProduct): boolean {
  const haystack = productHaystack(product);
  return MEAT_TERMS.some((term) => haystack.includes(normalizeText(term)));
}

function isAnimalProduct(product: CatalogProduct): boolean {
  const haystack = productHaystack(product);
  return ANIMAL_TERMS.some((term) => haystack.includes(normalizeText(term)));
}

function isCultivatedProduct(product: CatalogProduct): boolean {
  if (isAnimalProduct(product)) return false;

  const haystack = productHaystack(product);
  if (CULTIVATED_CATEGORY_TERMS.some((term) => haystack.includes(normalizeText(term)))) {
    return true;
  }

  return CULTIVATED_NAME_TERMS.some((term) => haystack.includes(normalizeText(term)));
}

function filterInStock(products: CatalogProduct[]): CatalogProduct[] {
  return products.filter((product) => product.stock > 0);
}

function extractQuantity(text: string, keyword: string): number | null {
  const normalizedKeyword = normalizeText(keyword);
  const patterns = [
    new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*kg\\s*(?:de\\s+|d')?${normalizedKeyword}`),
    new RegExp(`${normalizedKeyword}[^\\d]{0,20}(\\d+(?:[.,]\\d+)?)\\s*kg`),
    new RegExp(`(\\d+)\\s+${normalizedKeyword}`),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return Number.parseFloat(match[1].replace(",", "."));
  }

  return null;
}

function extractProductResults(
  data: { results?: CatalogProduct[]; next?: string | null } | CatalogProduct[],
): CatalogProduct[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

async function loadFullCatalog(): Promise<CatalogProduct[]> {
  const catalog: CatalogProduct[] = [];
  let page = 1;

  while (page <= 10) {
    const result = await getPublicProducts({ page_size: 100, page });
    if (!result.ok) break;

    const batch = extractProductResults(result.data as { results?: CatalogProduct[]; next?: string | null } | CatalogProduct[]);
    if (!batch.length) break;

    catalog.push(...batch);

    const paginated = result.data as { next?: string | null };
    if (Array.isArray(result.data) || !paginated.next) break;
    page += 1;
  }

  return catalog;
}

async function getDeliveryReply(): Promise<string> {
  try {
    const response = await apiPublic.get<{ results?: Array<{ prix_livraison: string }> } | Array<{ prix_livraison: string }>>(
      "/api/v1/livraisons/frais/",
    );
    const rows = Array.isArray(response.data) ? response.data : response.data.results ?? [];
    const fee = rows[0]?.prix_livraison;

    if (fee) {
      return `Oui, nous livrons à Lomé et environs. Frais de livraison : ${formatFcfa(parseAmount(fee))}. Délai habituel : 24 à 48 h ouvrées.`;
    }
  } catch {
    // fallback below
  }

  return "Oui, nous livrons à Lomé et environs. Délai habituel : 24 à 48 h. Les frais exacts sont calculés au moment du checkout selon votre adresse.";
}

function handleDamagedProduct(): ChatAssistantResponse {
  return {
    reply:
      "Si vous recevez un produit endommagé ou différent de votre commande, contactez-nous dans les 24 h avec votre numéro de commande et une photo. Nous proposons un remplacement ou un remboursement selon le cas.",
    products: [],
    links: [CONTACT_LINK, ORDERS_LINK],
  };
}

function handleOrderTracking(): ChatAssistantResponse {
  return {
    reply:
      "Après le paiement, votre commande passe en traitement puis en livraison. Connectez-vous à votre espace client, rubrique « Mes commandes », pour suivre le statut en temps réel.",
    products: [],
    links: [ORDERS_LINK],
  };
}

function handlePaymentMethods(): ChatAssistantResponse {
  return {
    reply:
      "Modes de paiement acceptés : Mobile Money (Flooz, T-Money), paiement via PayDunya (carte / mobile money) et espèces à la livraison selon les options activées au checkout.",
    products: [],
    links: [BOUTIQUE_LINK],
  };
}

function handleFreshVegetables(catalog: CatalogProduct[]): ChatAssistantResponse {
  const vegetables = filterInStock(findByCategory(catalog, "legume"));

  if (!vegetables.length) {
    return {
      reply: "Aucun légume frais disponible pour le moment. Revenez consulter la boutique très bientôt.",
      products: [],
      links: [BOUTIQUE_LINK],
    };
  }

  const names = vegetables.slice(0, 8).map((product) => product.name).join(", ");
  return {
    reply: `Voici les légumes frais disponibles aujourd'hui (${vegetables.length} références) : ${names}${vegetables.length > 8 ? "…" : ""}.`,
    products: toChatProducts(vegetables, 3),
    links: [{ label: "Voir tous les légumes", href: "/products?search=légume" }],
  };
}

function handleChickenStock(catalog: CatalogProduct[]): ChatAssistantResponse {
  const chicken = findByName(catalog, "poulet");
  if (!chicken?.variants?.length) {
    return {
      reply: "Je n'ai pas trouvé de poulet de chair en stock pour le moment.",
      products: [],
      links: [BOUTIQUE_LINK],
    };
  }

  const targetVariants = chicken.variants.filter((variant) => {
    const name = normalizeText(variant.name);
    const weight = variant.weight_grams ?? 0;
    return (
      (weight >= 2000 && weight <= 2500)
      || (name.includes("2 kg") || name.includes("2,5 kg") || name.includes("2.5 kg"))
    ) && variant.stock > 0;
  });

  if (!targetVariants.length) {
    return {
      reply: "Le poulet de chair est disponible, mais pas en conditionnement 2 à 2,5 kg actuellement. Consultez les autres découpes ci-dessous.",
      products: chicken.slug ? [{ name: chicken.name, price: chicken.price, slug: chicken.slug }] : [],
    };
  }

  const details = targetVariants
    .map((variant) => `${variant.name} : ${formatFcfa(parseAmount(variant.price))} (${variant.stock} en stock)`)
    .join("\n• ");

  return {
    reply: `Oui, nous avons du poulet de chair 2 à 2,5 kg en stock :\n• ${details}`,
    products: chicken.slug ? [{ name: chicken.name, price: targetVariants[0].price, slug: chicken.slug }] : [],
  };
}

function handleEggPackaging(catalog: CatalogProduct[]): ChatAssistantResponse {
  const eggs = findByName(catalog, "oeuf");
  if (!eggs?.variants?.length) {
    return {
      reply: "Je n'ai pas trouvé de conditionnements d'œufs disponibles pour le moment.",
      products: [],
      links: [BOUTIQUE_LINK],
    };
  }

  const details = eggs.variants
    .filter((variant) => variant.stock > 0)
    .map((variant) => `${variant.name} : ${formatFcfa(parseAmount(variant.price))}`)
    .join("\n• ");

  return {
    reply: `Voici les conditionnements d'œufs disponibles :\n• ${details}`,
    products: eggs.slug ? [{ name: eggs.name, price: eggs.price, slug: eggs.slug }] : [],
  };
}

function handleCartCalculation(message: string, catalog: CatalogProduct[]): ChatAssistantResponse | null {
  if (!matches(message, ["calcul", "montant total", "combien", "budget", "acheter", "coute"])) return null;
  if (!matches(message, ["tomate", "oignon", "poulet", "kg"])) return null;

  const tomatoQty = extractQuantity(message, "tomate") ?? (message.includes("10") && message.includes("tomate") ? 10 : null);
  const onionQty = extractQuantity(message, "oignon") ?? (message.includes("5") && message.includes("oignon") ? 5 : null);
  const chickenQty = extractQuantity(message, "poulet") ?? (message.match(/(\d+)\s+poulet/)?.[1] ? Number(message.match(/(\d+)\s+poulet/)![1]) : null);

  if (!tomatoQty && !onionQty && !chickenQty) return null;

  const lines: string[] = [];
  let total = 0;
  const products: ChatProductSuggestion[] = [];

  if (tomatoQty) {
    const tomato = findByName(catalog, "tomate");
    if (tomato) {
      const lineTotal = parseAmount(tomato.price) * tomatoQty;
      total += lineTotal;
      lines.push(`${tomatoQty} kg de ${tomato.name} × ${formatFcfa(parseAmount(tomato.price))}/kg = ${formatFcfa(lineTotal)}`);
      if (tomato.slug) products.push({ name: tomato.name, price: tomato.price, slug: tomato.slug });
    }
  }

  if (onionQty) {
    const onion = findByName(catalog, "oignon blanc") ?? findByName(catalog, "oignon");
    if (onion) {
      const lineTotal = parseAmount(onion.price) * onionQty;
      total += lineTotal;
      lines.push(`${onionQty} kg de ${onion.name} × ${formatFcfa(parseAmount(onion.price))}/kg = ${formatFcfa(lineTotal)}`);
      if (onion.slug) products.push({ name: onion.name, price: onion.price, slug: onion.slug });
    }
  }

  if (chickenQty) {
    const chicken = findByName(catalog, "poulet");
    const variant = chicken?.variants?.find((item) => normalizeText(item.name).includes("2,5") || normalizeText(item.name).includes("2.5"))
      ?? chicken?.variants?.find((item) => normalizeText(item.name).includes("entier"));
    const unitPrice = variant ? parseAmount(variant.price) : chicken ? parseAmount(chicken.price) : 0;
    const lineTotal = unitPrice * chickenQty;
    total += lineTotal;
    lines.push(`${chickenQty} × ${variant?.name ?? "Poulet entier"} = ${formatFcfa(lineTotal)}`);
    if (chicken?.slug) products.push({ name: chicken.name, price: String(unitPrice), slug: chicken.slug });
  }

  if (!lines.length) return null;

  return {
    reply: `Estimation de votre commande (hors livraison) :\n• ${lines.join("\n• ")}\n\nTotal estimé : ${formatFcfa(total)}.`,
    products: products.slice(0, 3),
    links: [{ label: "Passer commande", href: "/commandes" }],
  };
}

async function handlePromotions(catalog: CatalogProduct[] = []): Promise<ChatAssistantResponse> {
  const [salesResult, codesResult] = await Promise.all([getActiveSales(), getActivePromoCodes()]);
  const sales = salesResult.ok ? salesResult.data : [];
  const codes = codesResult.ok ? codesResult.data : [];

  const discountedProducts = catalog.filter(
    (product) => product.stock > 0 && product.discount_price && parseAmount(product.discount_price) > 0,
  );

  if (!sales.length && !codes.length && !discountedProducts.length) {
    return {
      reply: "Aucune promotion active pour le moment. Consultez régulièrement la page promotions ou revenez bientôt.",
      products: [],
      links: [PROMO_LINK],
    };
  }

  const saleLines = sales.slice(0, 5).map(
    (sale) => `${sale.product_name} : ${formatFcfa(parseAmount(sale.sale_price))} au lieu de ${formatFcfa(parseAmount(sale.original_price))}`,
  );
  const codeLines = codes.slice(0, 3).map(
    (code) => `Code ${code.code} (${code.type_display}) : ${code.description || "réduction disponible"}`,
  );
  const discountLines = discountedProducts.slice(0, 5).map(
    (product) => `${product.name} : ${formatFcfa(parseAmount(product.discount_price!))} au lieu de ${formatFcfa(parseAmount(product.price))}`,
  );

  const saleProducts = sales
    .slice(0, 3)
    .filter((sale) => sale.product_slug?.trim())
    .map((sale) => ({
      name: sale.product_name,
      price: sale.sale_price,
      slug: sale.product_slug,
    }));

  const catalogPromoProducts = discountedProducts.slice(0, 3).flatMap((product) => {
    const slug = product.slug?.trim();
    if (!slug) return [];
    return [{
      name: product.name,
      price: product.discount_price ?? product.price,
      slug,
    }];
  });

  return {
    reply: [
      "Voici les promotions disponibles :",
      ...(saleLines.length ? ["Soldes flash :", ...saleLines.map((line) => `• ${line}`)] : []),
      ...(discountLines.length ? ["Produits remisés :", ...discountLines.map((line) => `• ${line}`)] : []),
      ...(codeLines.length ? ["Codes promo :", ...codeLines.map((line) => `• ${line}`)] : []),
    ].join("\n"),
    products: saleProducts.length > 0 ? saleProducts : catalogPromoProducts,
    links: [PROMO_LINK],
  };
}

function handleBioProducts(catalog: CatalogProduct[]): ChatAssistantResponse {
  const bioProducts = catalog.filter((product) => {
    const haystack = normalizeText(`${product.name} ${product.category_name ?? ""}`);
    return product.stock > 0 && (haystack.includes("bio") || product.product_type === "RAW");
  });

  const certified = bioProducts.filter((product) => normalizeText(product.name).includes("bio"));

  if (certified.length) {
    return {
      reply: `Produits bio / locaux disponibles (${certified.length}) : ${certified.slice(0, 6).map((p) => p.name).join(", ")}.`,
      products: toChatProducts(certified, 3),
    };
  }

  const local = findAllByName(catalog, "local").filter((product) => product.stock > 0).slice(0, 6);
  return {
    reply: local.length
      ? `Nous n'avons pas de label « certifié bio » explicite, mais voici des produits locaux et bruts : ${local.map((p) => p.name).join(", ")}.`
      : "Aucun produit certifié bio n'est listé actuellement. Demandez-nous un produit précis ou parcourez la boutique.",
    products: toChatProducts(local, 3),
    links: [BOUTIQUE_LINK],
  };
}

function handleOutOfStock(catalog: CatalogProduct[]): ChatAssistantResponse {
  const outOfStock = catalog.filter((product) => product.stock <= 0);
  if (!outOfStock.length) {
    return {
      reply: "Bonne nouvelle : aucun produit n'est en rupture de stock actuellement.",
      products: [],
      links: [BOUTIQUE_LINK],
    };
  }

  return {
    reply: `Produits actuellement en rupture (${outOfStock.length}) : ${outOfStock.slice(0, 8).map((p) => p.name).join(", ")}. Date de retour : non communiquée — revenez bientôt ou contactez-nous.`,
    products: [],
    links: [CONTACT_LINK, BOUTIQUE_LINK],
  };
}

function handleCheapestChicken(catalog: CatalogProduct[]): ChatAssistantResponse {
  const chicken = findByName(catalog, "poulet");
  if (!chicken?.variants?.length) {
    return { reply: "Je n'ai pas trouvé de produits poulet à comparer.", products: [], links: [BOUTIQUE_LINK] };
  }

  const compared = chicken.variants
    .filter((variant) => variant.stock > 0)
    .map((variant) => {
      const weightKg = (variant.weight_grams ?? 0) / 1000 || 1;
      return {
        variant,
        pricePerKg: parseAmount(variant.price) / weightKg,
      };
    })
    .sort((a, b) => a.pricePerKg - b.pricePerKg);

  if (!compared.length) {
    return { reply: "Aucune découpe de poulet disponible actuellement.", products: [], links: [BOUTIQUE_LINK] };
  }

  const cheapest = compared[0];
  const lines = compared.slice(0, 4).map(
    (entry) => `${entry.variant.name} : ${formatFcfa(parseAmount(entry.variant.price))} (${formatFcfa(entry.pricePerKg)}/kg)`,
  );

  return {
    reply: `Le plus économique est ${cheapest.variant.name} à ${formatFcfa(cheapest.pricePerKg)}/kg.\nComparatif :\n• ${lines.join("\n• ")}`,
    products: chicken.slug ? [{ name: chicken.name, price: cheapest.variant.price, slug: chicken.slug }] : [],
  };
}

function handleCultivatedProducts(catalog: CatalogProduct[]): ChatAssistantResponse {
  const cultivated = filterInStock(catalog.filter(isCultivatedProduct));

  if (!cultivated.length) {
    return {
      reply: "Aucun produit cultivé (fruits, légumes, céréales) disponible pour le moment. Consultez la boutique ou revenez bientôt.",
      products: [],
      links: [BOUTIQUE_LINK],
    };
  }

  const preview = cultivated.slice(0, 8);
  const names = preview.map((product) => product.name).join(", ");

  return {
    reply: [
      `Voici ${cultivated.length} produit${cultivated.length > 1 ? "s" : ""} cultivé${cultivated.length > 1 ? "s" : ""} du terroir`,
      "(fruits, légumes et céréales — sans viandes) :",
      `${names}${cultivated.length > 8 ? "…" : ""}.`,
      "Cliquez sur une carte pour voir le détail.",
    ].join(" "),
    products: toChatProducts(cultivated, 3),
    links: [{ label: "Voir les produits cultivés", href: "/products?search=légume" }],
  };
}

function handleMeatProducts(catalog: CatalogProduct[]): ChatAssistantResponse {
  const meats = filterInStock(catalog.filter(isMeatProduct));

  if (!meats.length) {
    return {
      reply: "Aucune viande ou volaille disponible pour le moment. Revenez consulter la boutique très bientôt.",
      products: [],
      links: [BOUTIQUE_LINK],
    };
  }

  const preview = meats.slice(0, 8);
  const names = preview.map((product) => product.name).join(", ");

  return {
    reply: [
      `Voici ${meats.length} viande${meats.length > 1 ? "s" : ""} et volaille${meats.length > 1 ? "s" : ""} disponibles :`,
      `${names}${meats.length > 8 ? "…" : ""}.`,
      "Cliquez sur une carte pour commander.",
    ].join(" "),
    products: toChatProducts(meats, 3),
    links: [{ label: "Voir les viandes", href: "/products?search=viande" }],
  };
}

function handleLocalBasket(catalog: CatalogProduct[]): ChatAssistantResponse {
  const cultivated = filterInStock(catalog.filter(isCultivatedProduct)).slice(0, 4);
  const meats = filterInStock(catalog.filter(isMeatProduct)).slice(0, 2);
  const picked = [...cultivated, ...meats];
  const total = picked.reduce((sum, product) => sum + parseAmount(product.price), 0);

  const cultivatedNames = cultivated.map((product) => product.name).join(", ") || "—";
  const meatNames = meats.map((product) => product.name).join(", ") || "—";

  return {
    reply: [
      `Panier local suggéré (${picked.length} produits) pour ${formatFcfa(total)} :`,
      `• Produits cultivés : ${cultivatedNames}.`,
      `• Viandes : ${meatNames}.`,
    ].join("\n"),
    products: toChatProducts(picked, 3),
    links: [{ label: "Composer mon panier", href: "/commandes" }],
  };
}

function handleBudgetRecommendation(message: string, catalog: CatalogProduct[]): ChatAssistantResponse | null {
  const budgetMatch = message.match(/(\d[\d\s.]{2,})\s*fcfa/);
  if (!budgetMatch && !message.includes("25000")) return null;
  if (!matches(message, ["budget", "recommand", "famille", "personnes", "semaine", "nourrir"])) return null;

  const budget = budgetMatch ? parseAmount(budgetMatch[1].replace(/\s/g, "")) : 25000;
  const affordable = [...catalog]
    .filter((product) => product.stock > 0)
    .sort((a, b) => parseAmount(a.price) - parseAmount(b.price));

  const basket: CatalogProduct[] = [];
  let spent = 0;

  for (const product of affordable) {
    const price = parseAmount(product.price);
    if (price <= 0 || spent + price > budget) continue;
    basket.push(product);
    spent += price;
    if (basket.length >= 8) break;
  }

  return {
    reply: `Avec un budget de ${formatFcfa(budget)}, voici une sélection équilibrée (${formatFcfa(spent)} utilisés) : ${basket.map((p) => p.name).join(", ")}.`,
    products: toChatProducts(basket, 3),
    links: [{ label: "Voir la boutique", href: "/products" }],
  };
}

function handleBarbecueRecommendation(message: string, catalog: CatalogProduct[]): ChatAssistantResponse | null {
  if (!matches(message, ["barbecue", "bbq", "grillade", "20 personnes", "20 personne"])) return null;

  const poultry = findAllByName(catalog, "poulet", "pintade", "lapin").filter((product) => product.stock > 0);
  const wholeChicken = findByName(catalog, "poulet");
  const variant = wholeChicken?.variants?.find((item) => normalizeText(item.name).includes("entier"));

  const chickensNeeded = 8;
  const unitPrice = variant ? parseAmount(variant.price) : wholeChicken ? parseAmount(wholeChicken.price) : 0;

  return {
    reply: `Pour un barbecue de 20 personnes, prévoyez environ ${chickensNeeded} poulets entiers (≈ ${formatFcfa(unitPrice * chickensNeeded)}), plus légumes et boissons. Volailles disponibles : ${poultry.map((p) => p.name).join(", ")}.`,
    products: toChatProducts(poultry, 3),
    links: wholeChicken?.slug ? [{ label: "Voir le poulet", href: productPageUrl(wholeChicken.slug) }] : [BOUTIQUE_LINK],
  };
}

export async function resolveSmartAssistantResponse(
  userMessage: string,
): Promise<ChatAssistantResponse | null> {
  const message = normalizeText(userMessage);

  if (matches(message, ["endommage", "abime", "different", "recu", "reclamation", "colis"])) {
    return handleDamagedProduct();
  }

  if (matches(message, ["suivre", "suivi", "statut"]) && matches(message, ["commande", "paiement"])) {
    return handleOrderTracking();
  }

  if (matches(message, ["paiement", "payer", "mobile money", "flooz", "t-money", "paydunya", "carte"])) {
    return handlePaymentMethods();
  }

  if (isDeliveryIntent(message)) {
    return {
      reply: await getDeliveryReply(),
      products: [],
      links: [BOUTIQUE_LINK],
    };
  }

  if (matches(message, ["promotion", "promotions", "promo", "reduction", "solde", "soldes", "offre", "offres"])) {
    const catalog = await loadFullCatalog();
    return handlePromotions(catalog);
  }

  const catalog = await loadFullCatalog();
  if (!catalog.length) return null;

  if (matches(message, ["bio", "biologique", "certifie"])) {
    return handleBioProducts(catalog);
  }

  if (matches(message, ["rupture", "epuise", "indisponible", "stock"]) && matches(message, ["quand", "retour", "disponible"])) {
    return handleOutOfStock(catalog);
  }

  if (matches(message, ["economique", "moins cher", "compare"]) && matches(message, ["poulet", "cuisse", "aile", "entier"])) {
    return handleCheapestChicken(catalog);
  }

  if (
    matches(message, ["cultive", "cultives", "recolte", "maraicher"])
    || (matches(message, ["produit", "produits", "propose", "proposez", "suggestion", "suggestions"]) && matches(message, ["cultive", "cultives"]))
  ) {
    return handleCultivatedProducts(catalog);
  }

  if (
    matches(message, ["viande", "viandes", "volaille", "volailles"])
    && !matches(message, ["cultive", "cultives"])
  ) {
    return handleMeatProducts(catalog);
  }

  if (matches(message, ["local", "terroir"]) && matches(message, ["panier", "compose"])) {
    return handleLocalBasket(catalog);
  }

  const budgetReply = handleBudgetRecommendation(message, catalog);
  if (budgetReply) return budgetReply;

  const bbqReply = handleBarbecueRecommendation(message, catalog);
  if (bbqReply) return bbqReply;

  const cartReply = handleCartCalculation(message, catalog);
  if (cartReply) return cartReply;

  if (matches(message, ["legume", "legumes frais", "legumes"]) && matches(message, ["disponible", "categorie", "aujourd", "quels"])) {
    return handleFreshVegetables(catalog);
  }

  if (matches(message, ["poulet"]) && matches(message, ["2 kg", "2,5", "2.5", "chair", "stock", "prix"])) {
    return handleChickenStock(catalog);
  }

  if (matches(message, ["oeuf", "oeufs"]) && matches(message, ["conditionnement", "plateau", "demi", "unite", "unit"])) {
    return handleEggPackaging(catalog);
  }

  return null;
}
