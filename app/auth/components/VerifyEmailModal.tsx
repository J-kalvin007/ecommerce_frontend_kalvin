"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface VerifyEmailModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

export function VerifyEmailModal({ isOpen, email, onClose }: VerifyEmailModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#0F2D20]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl pointer-events-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[#8a9685] transition-colors hover:bg-black/10 hover:text-[#0F2D20]"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center px-8 pb-10 pt-12 text-center">
                {/* Icon */}
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[#C9963A]/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F2D20] to-[#1a4a30] shadow-lg">
                     <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Text */}
                <h3 className="mb-2 text-xl font-bold text-[#0F2D20]">
                  Vérification requise
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#6b7a65]">
                  Votre compte n'est pas encore activé. Veuillez vérifier la boîte de réception de l'adresse <strong className="text-[#0F2D20]">{email}</strong> pour finaliser votre inscription.
                </p>

                {/* Actions */}
                <div className="flex w-full flex-col gap-3">
                   <Link
                    href={`/auth/resend-email${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#dde5d8] bg-[#f8faf6] px-5 py-3 text-sm font-semibold text-[#0F2D20] transition hover:border-[#0F2D20] hover:bg-[#f0f5ef] hover:shadow-sm"
                    onClick={onClose}
                  >
                    <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                    Renvoyer l&rsquo;e-mail
                  </Link>

                  <button
                    onClick={() => {
                        onClose();
                        router.push(`/auth/acces-information?email=${encodeURIComponent(email)}`);
                    }}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2D20] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1a4a30]"
                  >
                    Aller à la page d'informations
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
