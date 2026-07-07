"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import {
  askCommerceAssistant,
  getProductPageUrl,
  type AIChatMessage,
} from "@/services/ai.service";
import { useCartStore } from "@/store/pannierStore";

const QUICK_PROMPTS = [
  "Voir les promotions",
  "Proposez des produits cultivés",
  "Comment se passe la livraison ?",
  "Quels moyens de paiement sont disponibles ?",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis l'assistant de L'Atelier du Terroir. Posez-moi vos questions sur les produits, la livraison, le paiement ou vos commandes.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  async function sendMessage(messageText: string) {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const nextMessages: AIChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { reply, products, links } = await askCommerceAssistant(trimmed, nextMessages, cartItems);

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: reply || "Je n'ai pas trouvé de réponse précise. Reformulez votre question ou ouvrez la boutique.",
          products: products.length > 0 ? products.slice(0, 3) : undefined,
          links: links && links.length > 0 ? links : undefined,
        },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Je n'ai pas pu traiter votre demande pour le moment. Reformulez votre question ou ouvrez la boutique pour parcourir nos produits.",
          links: [{ label: "Voir la boutique", href: "/products" }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) void sendMessage(input);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_18px_45px_rgba(255,107,53,0.34)] transition-transform hover:scale-105"
        aria-label="Ouvrir le chatbot IA"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-5 z-[80] flex h-[38rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.8rem] border border-border bg-surface-elevated shadow-[0_24px_70px_rgba(17,24,39,0.18)]"
          >
            <div className="border-b border-border bg-background px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Chatbot IA</h3>
                  <p className="text-sm text-muted">Produits, commandes, livraison, paiement</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              <div className="flex flex-wrap gap-2 pb-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className="space-y-2">
                  <div className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={
                        message.role === "user"
                          ? "max-w-[85%] rounded-[1.2rem] rounded-br-sm bg-primary px-4 py-3 text-sm text-white whitespace-pre-wrap"
                          : "max-w-[85%] rounded-[1.2rem] rounded-bl-sm bg-background px-4 py-3 text-sm text-foreground whitespace-pre-wrap"
                      }
                    >
                      {message.content}
                    </div>
                  </div>

                  {message.role === "assistant" && message.products && message.products.length > 0 && (
                    <div className="space-y-2 pl-1">
                      {message.products.map((product) => {
                        const href = getProductPageUrl(product.slug);
                        if (!href) return null;
                        return (
                          <Link
                            key={`${product.slug}-${product.name}`}
                            href={href}
                            className="block rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                          >
                            <p className="text-sm font-semibold text-foreground">{product.name}</p>
                            <p className="text-xs text-muted">{product.price} FCFA</p>
                            <p className="mt-1 text-xs font-medium text-primary">Voir le produit →</p>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {message.role === "assistant" && message.links && message.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-1">
                      {message.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-[1.2rem] rounded-bl-sm bg-background px-4 py-3 text-sm text-muted">
                    L&apos;assistant réfléchit...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-border p-4">
              <div className="flex items-end gap-3 rounded-[1.4rem] border border-border bg-background p-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Posez votre question... (Entrée pour envoyer)"
                  rows={1}
                  className="max-h-28 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Envoyer au chatbot"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
