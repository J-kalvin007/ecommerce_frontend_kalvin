


"use client";

import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

/* ─────────────────────────────────────────────────────────────────
   LoginPageView
   The LoginForm is now fully self-contained (it renders its own
   full-page layout with the left/right split), so this wrapper just
   provides the Suspense boundary and the page-level background.
───────────────────────────────────────────────────────────────── */
export function LoginPageView() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F0EDE6]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0F2D20]/20 border-t-[#0F2D20]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}