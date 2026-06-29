"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, Star, X } from "lucide-react";
import {
  askCommerceAssistant,
  type AIChatMessage,
} from "@/services/ai.service";

const QUICK_PROMPTS = [
  "Quels produits bio recommandez-vous ?",
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
        "Bonjour, je suis l'assistant IA de L'Atelier du Terroir. Je peux vous aider pour les produits, la livraison, le paiement et vos commandes.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  async function sendMessage(messageText: string) {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const nextMessages: AIChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const reply = await askCommerceAssistant(trimmed, nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply || "Je n'ai pas pu formuler de reponse pour le moment." }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le chatbot IA est momentanement indisponible.");
    } finally {
      setIsLoading(false);
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
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Assistant IA</h3>
                  <p className="text-sm text-muted">Produits, commandes, livraison, paiement</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
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

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[85%] rounded-[1.2rem] rounded-br-sm bg-primary px-4 py-3 text-sm text-white"
                        : "max-w-[85%] rounded-[1.2rem] rounded-bl-sm bg-background px-4 py-3 text-sm text-foreground"
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-[1.2rem] rounded-bl-sm bg-background px-4 py-3 text-sm text-muted">
                    L&apos;assistant reflechit...
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-border p-4">
              <div className="flex items-end gap-3 rounded-[1.4rem] border border-border bg-background p-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Posez votre question..."
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
