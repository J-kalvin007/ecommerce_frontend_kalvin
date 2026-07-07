import { isAxiosError } from "axios";
import { apiPrivate, apiPublic, getToken } from "@/lib/axios";
import { getPublicProducts } from "@/fonctions_api/produits.api";
import {
  isNonProductIntentMessage,
  resolveSmartAssistantResponse,
  type ChatAssistantResponse,
} from "@/services/chat-assistant";
import type { ProductListItem } from "@/modeles";
import type { CartItem } from "@/store/pannierStore";

export type AIChatMessage = {
  role: "user" | "assistant";
  content: string;
  products?: ChatProductSuggestion[];
  links?: ChatLinkSuggestion[];
};

export type ChatProductSuggestion = {
  name: string;
  price: string;
  slug: string;
};

export type ChatLinkSuggestion = {
  label: string;
  href: string;
};

export type { ChatAssistantResponse };

export type AIProductSuggestion = {
  productId: string;
  reason: string;
};

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.1-8b-instant";

const BOUTIQUE_LINK: ChatLinkSuggestion = { label: "Voir la boutique", href: "/products" };

const SEARCH_STOP_WORDS = new Set([
  "je", "j", "veux", "veut", "voudrais", "aimerais", "avoir", "besoin", "cherche", "chercher",
  "trouve", "trouver", "donne", "donnez", "propose", "proposez", "montre", "montrez",
  "de", "du", "des", "d", "la", "le", "les", "l", "un", "une", "mon", "ma", "mes", "ton", "ta",
  "pour", "est", "ce", "que", "qui", "comment", "quel", "quels", "quelle", "quelles", "en", "au",
  "aux", "sur", "avec", "sans", "pas", "plus", "tres", "bien", "svp", "stp", "merci", "bonjour",
]);

const GENERIC_PRODUCT_REPLY_PATTERNS = [
  /voici ce que nous proposons actuellement/i,
  /un aper[cç]u est affich[eé]/i,
  /ouvrez la boutique pour voir le d[eé]tail/i,
  /ouvrez la boutique pour parcourir/i,
];

function ensureApiKey() {
  if (!GROQ_API_KEY) {
    throw new Error("La cle Groq est absente de .env.local");
  }
}

function serializeProducts(products: ProductListItem[]) {
  return products.slice(0, 24).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    category: product.category_name ?? "",
    stock: product.stock,
  }));
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isQuotaError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("429")
    || message.includes("resource_exhausted")
    || message.includes("quota")
    || message.includes("rate_limit_exceeded")
  );
}

export function getProductPageUrl(slug: string | null | undefined): string | null {
  const cleaned = slug?.trim();
  return cleaned ? `/products/${cleaned}` : null;
}

function extractSearchTerms(message: string): string {
  return normalizeText(message)
    .split(/[\s']+/)
    .filter((token) => token.length > 2 && !SEARCH_STOP_WORDS.has(token))
    .join(" ");
}

function isGenericProductReply(reply: string): boolean {
  return GENERIC_PRODUCT_REPLY_PATTERNS.some((pattern) => pattern.test(reply));
}

function buildProductSearchReply(userMessage: string, products: ChatProductSuggestion[]): string {
  if (products.length === 0) return "";

  const [top] = products;
  const terms = extractSearchTerms(userMessage);

  if (products.length === 1) {
    return `Oui, nous avons bien ${top.name} disponible à ${top.price} FCFA. Cliquez sur la carte ci-dessous pour voir la fiche produit et commander.`;
  }

  if (terms) {
    return `Voici ${products.length} produits correspondant à « ${terms} ». Cliquez sur celui qui vous convient pour voir le détail.`;
  }

  return `Voici ${products.length} produits correspondant à votre demande. Cliquez sur celui qui vous intéresse pour voir le détail.`;
}

function toChatProduct(product: Pick<ProductListItem, "name" | "price" | "slug">): ChatProductSuggestion | null {
  const slug = product.slug?.trim();
  if (!slug) return null;
  return { name: product.name, price: product.price, slug };
}

function extractProductResults(
  data: { results?: ProductListItem[] } | ProductListItem[],
): ProductListItem[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

async function searchCatalogForMessage(userMessage: string): Promise<ChatProductSuggestion[]> {
  if (isNonProductIntentMessage(userMessage)) return [];

  const result = await getPublicProducts({ page_size: 100 });
  if (!result.ok) return [];

  const products = extractProductResults(result.data as { results?: ProductListItem[] } | ProductListItem[]);
  const searchQuery = extractSearchTerms(userMessage) || userMessage;

  return products
    .map((product) => ({
      product,
      score: Math.max(
        scoreProductMatch(userMessage, product),
        scoreProductMatch(searchQuery, product),
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ product }) => toChatProduct(product))
    .filter((product): product is ChatProductSuggestion => product !== null);
}

async function enrichAssistantResponse(
  data: ChatAssistantResponse,
  userMessage: string,
): Promise<ChatAssistantResponse> {
  const normalized = normalizeAssistantResponse(data);
  const backendHasSpecificProducts =
    normalized.products.length > 0 && !isGenericProductReply(normalized.reply) && normalized.reply.trim();

  if (backendHasSpecificProducts) {
    return normalized;
  }

  try {
    const smartReply = await resolveSmartAssistantResponse(userMessage);
    if (smartReply) return smartReply;

    if (!isNonProductIntentMessage(userMessage)) {
      const catalogMatches = await searchCatalogForMessage(userMessage);
      if (catalogMatches.length > 0) {
        return {
          ...normalized,
          products: catalogMatches,
          reply: buildProductSearchReply(userMessage, catalogMatches),
        };
      }
    }

    if (isGenericProductReply(normalized.reply) && normalized.products.length > 0) {
      return {
        ...normalized,
        reply: buildProductSearchReply(userMessage, normalized.products),
      };
    }
  } catch {
    // Keep normalized response if smart resolver fails.
  }

  return normalized;
}

function normalizeAssistantResponse(data: ChatAssistantResponse): ChatAssistantResponse {
  const products = (data.products ?? [])
    .map((product) => toChatProduct(product))
    .filter((product): product is ChatProductSuggestion => product !== null);

  const links = (data.links ?? []).map((link) => {
    if (link.href !== "/products") return link;
    const labelText = normalizeText(link.label.replace(/^voir\s+/i, ""));
    if (labelText.includes("boutique") || labelText.includes("catalogue")) {
      return BOUTIQUE_LINK;
    }
    return link;
  });

  return {
    reply: data.reply ?? "",
    products,
    links: links.length ? links : undefined,
  };
}

async function buildFallbackAssistantResponse(userMessage: string): Promise<ChatAssistantResponse> {
  try {
    const smartReply = await resolveSmartAssistantResponse(userMessage);
    if (smartReply) return smartReply;
  } catch {
    // Fall through to catalog search and FAQ replies.
  }

  const message = normalizeText(userMessage);

  if (
    message.includes("livraison")
    || message.includes("livrez")
    || message.includes("colis")
    || message.includes("expedition")
    || (message.includes("lome") && (message.includes("frais") || message.includes("delai")))
  ) {
    return {
      reply: "Oui, nous livrons à Lomé et environs. Délai habituel : 24 à 48 h. Les frais exacts sont calculés au checkout selon votre adresse.",
      products: [],
      links: [BOUTIQUE_LINK],
    };
  }

  if (!isNonProductIntentMessage(userMessage)) {
    const catalogMatches = await searchCatalogForMessage(userMessage).catch(() => [] as ChatProductSuggestion[]);
    if (catalogMatches.length > 0) {
      return {
        reply: buildProductSearchReply(userMessage, catalogMatches),
        products: catalogMatches,
      };
    }
  }

  let reply: string;
  let links: ChatLinkSuggestion[] = [];

  if (
    message.includes("paiement")
    || message.includes("mobile money")
    || message.includes("flooz")
    || message.includes("t-money")
    || message.includes("t money")
  ) {
    reply = "Nous acceptons Mobile Money (Flooz, T-Money) et les espèces à la livraison.";
  } else if (message.includes("retour") || message.includes("rembours")) {
    reply = "Les retours sont acceptés sous 24 h si le produit est endommagé à la livraison.";
  } else if (message.includes("commande") || message.includes("statut") || message.includes("suivi")) {
    reply = "Connectez-vous à votre compte et consultez « Mes commandes » pour suivre votre commande.";
    links = [{ label: "Mes commandes", href: "/customer/commandes" }];
  } else if (message.includes("bonjour") || message.includes("bjr") || message.includes("salut") || message.includes("hello")) {
    reply = "Bonjour ! Je suis l'assistant de L'Atelier du Terroir. Je peux vous aider sur les produits, la livraison, le paiement et vos commandes.";
  } else if (
    message.includes("produit")
    || message.includes("catalogue")
    || message.includes("boutique")
    || message.includes("cultiv")
    || message.includes("promotion")
    || message.includes("promo")
  ) {
    reply = "Parcourez notre boutique pour découvrir fruits, légumes, viandes et épices du terroir togolais.";
    links = [BOUTIQUE_LINK];
  } else if (message.includes("contact") || message.includes("telephone") || message.includes("email")) {
    reply = "Pour nous joindre : agrobusiness@dealandconsulting.com · +228 72318393 · Lomé, Togo.";
  } else {
    reply = "Je n'ai pas pu accéder au service pour le moment. Reformulez votre question ou parcourez la boutique.";
    links = [BOUTIQUE_LINK];
  }

  return { reply, products: [], links };
}

function scoreProductMatch(query: string, product: ProductListItem) {
  const normalizedQuery = normalizeText(query).trim();
  if (!normalizedQuery) return 0;

  const haystack = normalizeText(
    [product.name, product.category_name ?? ""].join(" "),
  );

  let score = 0;
  normalizedQuery.split(/\s+/).filter(Boolean).forEach((token) => {
    if (token.length <= 2) return;
    if (haystack.includes(token)) {
      score += token.length > 4 ? 3 : 2;
    }
  });

  if (haystack.includes(normalizedQuery)) {
    score += 8;
  }

  return score;
}

function searchProductsFallback(query: string, products: ProductListItem[]) {
  const ranked = [...products]
    .map((product) => ({ product, score: scoreProductMatch(query, product) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    answer: ranked.length
      ? `J'ai trouvé ${ranked.length} produit(s) correspondant à votre recherche.`
      : "Je n'ai pas trouvé de produit proche de cette recherche.",
    productIds: ranked.map((entry) => entry.product.id),
  };
}

function getRecommendationsFallback(
  products: ProductListItem[],
  context: { cartItems?: string[]; viewedCategories?: string[] },
) {
  const preferredCategories = new Set((context.viewedCategories ?? []).map((value) => normalizeText(value)));
  const preferredIds = new Set(context.cartItems ?? []);

  return [...products]
    .map((product) => {
      let score = 0;
      if (product.is_top) score += 3;
      if (preferredIds.has(product.id)) score += 4;
      if (preferredCategories.has(normalizeText(product.category_name ?? ""))) score += 5;
      const rating = Number.parseFloat(product.note_produit ?? "0");
      if (Number.isFinite(rating)) score += Math.round(rating);

      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ product }) => ({
      productId: product.id,
      reason: `Recommandé pour sa catégorie ${product.category_name ?? "produit"}.`,
    }));
}

async function callGroq(prompt: string) {
  ensureApiKey();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function mapCartItemsForBackend(items: CartItem[]) {
  return items.map((item) => ({
    product_id: item.productId,
    variant_id: item.variantId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    slug: item.slug,
  }));
}

export async function askCommerceAssistant(
  userMessage: string,
  history: AIChatMessage[] = [],
  cartItems: CartItem[] = [],
): Promise<ChatAssistantResponse> {
  const payload = {
    message: userMessage,
    cart_items: mapCartItemsForBackend(cartItems),
    history: history
      .filter((item) => item.role === "user" || item.role === "assistant")
      .slice(-10)
      .map((item) => ({ role: item.role, content: item.content })),
  };

  const client = getToken() ? apiPrivate : apiPublic;

  try {
    const response = await client.post<ChatAssistantResponse>(
      "/api/v1/chat/message/",
      payload,
    );

    return enrichAssistantResponse({
      reply: response.data.reply ?? "",
      products: (response.data.products ?? []).slice(0, 3),
      links: response.data.links ?? [],
    }, userMessage);
  } catch (error) {
    if (getToken() && isAxiosError(error) && error.response?.status === 401) {
      try {
        const response = await apiPublic.post<ChatAssistantResponse>(
          "/api/v1/chat/message/",
          payload,
        );

        return enrichAssistantResponse({
          reply: response.data.reply ?? "",
          products: (response.data.products ?? []).slice(0, 3),
          links: response.data.links ?? [],
        }, userMessage);
      } catch {
        return buildFallbackAssistantResponse(userMessage);
      }
    }

    return buildFallbackAssistantResponse(userMessage);
  }
}

export async function searchProductsWithAI(query: string, products: ProductListItem[]) {
  if (!query.trim()) {
    return { answer: "", productIds: [] as string[] };
  }

  const prompt = [
    "Tu es un moteur de recherche e-commerce intelligent.",
    'Format attendu: {"answer":"...", "productIds":["id1","id2"]}',
    `Requete: ${query}`,
    `Catalogue: ${JSON.stringify(serializeProducts(products))}`,
  ].join("\n");

  try {
    const raw = await callGroq(prompt);
    const parsed = JSON.parse(raw) as { answer?: string; productIds?: string[] };
    return {
      answer: parsed.answer ?? "",
      productIds: Array.isArray(parsed.productIds) ? parsed.productIds : [],
    };
  } catch (error) {
    if (isQuotaError(error)) {
      return searchProductsFallback(query, products);
    }
    return searchProductsFallback(query, products);
  }
}

export async function getRecommendationsWithAI(
  products: ProductListItem[],
  context: { cartItems?: string[]; viewedCategories?: string[]; userIntent?: string } = {},
) {
  try {
    const raw = await callGroq(
      `Recommande des produits. JSON: [{"productId":"...","reason":"..."}]\nCatalogue: ${JSON.stringify(serializeProducts(products))}`,
    );
    const parsed = JSON.parse(raw) as AIProductSuggestion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (isQuotaError(error)) {
      return getRecommendationsFallback(products, context);
    }
    return getRecommendationsFallback(products, context);
  }
}
