"use client";

import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { ContainerFormAuth } from "@/app/auth/components/ContainerFormAuth";

/* -----------------------------------------------------------------
   LoginPageView
   The LoginForm is self-contained (own left/right layout).
   ContainerFormAuth adds the full-screen atmosphere layer:
   floating leaves, produce images and gradient background.
----------------------------------------------------------------- */
export function LoginPageView() {
  return (
    <ContainerFormAuth>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#F0EDE6]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0F2D20]/20 border-t-[#0F2D20]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </ContainerFormAuth>
  );
}