import type { ProductListItem } from "@/modeles";

export type AIChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIProductSuggestion = {
  productId: string;
  reason: string;
};

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.1-8b-instant";

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
    currency: product.currency,
    category: product.category_name ?? "",
    labels: product.labels,
    stock_status: product.stock_status,
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
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate_limit_exceeded")
  );
}

function buildFallbackAssistantReply(userMessage: string) {
  const message = normalizeText(userMessage);

  if (message.includes("livraison") || message.includes("colis") || message.includes("expedition")) {
    return "Nous proposons une livraison locale et a distance. Les frais et delais dependent de votre adresse, du poids et du type de produit.";
  }

  if (message.includes("paiement") || message.includes("mobile money") || message.includes("carte") || message.includes("wallet") || message.includes("portefeuille")) {
    return "Le site peut integrer plusieurs moyens de paiement comme le mobile money, les cartes bancaires et le wallet. La disponibilite exacte depend de la configuration active.";
  }

  if (message.includes("commande") || message.includes("statut") || message.includes("suivi")) {
    return "Une commande suit generalement ces etapes : confirmation, traitement, expedition puis livraison. Ces statuts peuvent etre affiches clairement dans l'espace client.";
  }

  if (message.includes("bonjour") || message.includes("bjr") || message.includes("salut") || message.includes("hello")) {
    return "Bonjour, je suis l'assistant de L'Atelier du Terroir. Je peux vous aider sur les produits, la livraison, le paiement et vos commandes.";
  }

  if (message.includes("produit") || message.includes("recommande") || message.includes("suggestion") || message.includes("bio")) {
    return "Je peux vous guider par categorie ou par besoin. Dites-moi par exemple : epices, fruits, produits bio, produits transformes ou produits pour export.";
  }

  return "Le service IA externe est temporairement indisponible, mais je peux encore vous aider sur les produits, la livraison, le paiement et le parcours de commande si vous precisez votre besoin.";
}

function scoreProductMatch(query: string, product: ProductListItem) {
  const normalizedQuery = normalizeText(query);
  const haystack = normalizeText(
    [
      product.name,
      product.category_name ?? "",
      product.labels.join(" "),
      product.stock_status,
    ].join(" "),
  );

  let score = 0;

  normalizedQuery.split(/\s+/).filter(Boolean).forEach((token) => {
    if (haystack.includes(token)) {
      score += token.length > 4 ? 3 : 1;
    }
  });

  if (haystack.includes(normalizedQuery)) {
    score += 5;
  }

  return score;
}

function searchProductsFallback(query: string, products: ProductListItem[]) {
  const ranked = [...products]
    .map((product) => ({
      product,
      score: scoreProductMatch(query, product),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    answer: ranked.length
      ? `J'ai trouve ${ranked.length} produit(s) correspondant a votre recherche.`
      : "Je n'ai pas trouve de produit proche de cette recherche. Essayez avec une categorie ou un type de produit.",
    productIds: ranked.map((entry) => entry.product.id),
  };
}

function getRecommendationsFallback(
  products: ProductListItem[],
  context: {
    cartItems?: string[];
    viewedCategories?: string[];
    userIntent?: string;
  },
) {
  const preferredCategories = new Set((context.viewedCategories ?? []).map((value) => normalizeText(value)));
  const preferredIds = new Set(context.cartItems ?? []);

  return [...products]
    .map((product) => {
      let score = 0;

      if (product.is_featured) score += 3;
      if (product.is_boosted) score += 2;
      if (preferredIds.has(product.id)) score += 4;
      if (preferredCategories.has(normalizeText(product.category_name ?? ""))) score += 5;
      score += Math.round(product.avg_rating);

      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ product }) => ({
      productId: product.id,
      reason: `Recommande pour sa categorie ${product.category_name ?? "produit"} et sa popularite aupres des clients.`,
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
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function askCommerceAssistant(
  userMessage: string,
  history: AIChatMessage[] = [],
) {
  const prompt = [
    "Tu es l'assistant e-commerce de L'Atelier du Terroir.",
    "Reponds en francais, de facon concise, chaleureuse et utile.",
    "Tu aides sur les produits, la livraison, le paiement, les commandes et les recommandations.",
    "Si l'information exacte n'est pas connue, dis-le clairement et propose une alternative.",
    "",
    "Historique recent :",
    ...history.slice(-6).map((message) => `${message.role === "user" ? "Client" : "Assistant"}: ${message.content}`),
    "",
    `Nouvelle question: ${userMessage}`,
  ].join("\n");

  try {
    return await callGroq(prompt);
  } catch (error) {
    if (isQuotaError(error)) {
      return buildFallbackAssistantReply(userMessage);
    }

    throw error;
  }
}

export async function searchProductsWithAI(
  query: string,
  products: ProductListItem[],
) {
  if (!query.trim()) {
    return {
      answer: "",
      productIds: [] as string[],
    };
  }

  const prompt = [
    "Tu es un moteur de recherche e-commerce intelligent.",
    "A partir de la requete client et du catalogue, retourne un JSON strict.",
    'Format attendu: {"answer":"...", "productIds":["id1","id2","id3"]}',
    "Ne retourne rien d'autre que ce JSON.",
    "",
    `Requete client: ${query}`,
    `Catalogue: ${JSON.stringify(serializeProducts(products))}`,
  ].join("\n");

  let raw = "";

  try {
    raw = await callGroq(prompt);
  } catch (error) {
    if (isQuotaError(error)) {
      return searchProductsFallback(query, products);
    }

    throw error;
  }

  try {
    const parsed = JSON.parse(raw) as { answer?: string; productIds?: string[] };
    return {
      answer: parsed.answer ?? "",
      productIds: Array.isArray(parsed.productIds) ? parsed.productIds : [],
    };
  } catch {
    return {
      answer: raw,
      productIds: [],
    };
  }
}

export async function getRecommendationsWithAI(
  products: ProductListItem[],
  context: {
    cartItems?: string[];
    viewedCategories?: string[];
    userIntent?: string;
  } = {},
) {
  const prompt = [
    "Tu es un moteur de recommandation e-commerce.",
    "Retourne un JSON strict sous la forme:",
    '[{"productId":"...", "reason":"..."}]',
    "Ne retourne rien d'autre que ce JSON.",
    "",
    `Contexte utilisateur: ${JSON.stringify(context)}`,
    `Catalogue: ${JSON.stringify(serializeProducts(products))}`,
  ].join("\n");

  let raw = "";

  try {
    raw = await callGroq(prompt);
  } catch (error) {
    if (isQuotaError(error)) {
      return getRecommendationsFallback(products, context);
    }

    throw error;
  }

  try {
    const parsed = JSON.parse(raw) as AIProductSuggestion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
