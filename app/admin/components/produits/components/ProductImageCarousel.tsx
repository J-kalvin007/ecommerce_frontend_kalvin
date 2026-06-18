

// components/admin/produits/ProductImageCarousel.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/modeles/produits";

interface ProductImageCarouselProps {
  images: ProductImage[];
  altText?: string;
}

export function ProductImageCarousel({ images, altText = "" }: ProductImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState(false);

  if (!images.length) return null;

  const currentImageSrc = images[current]?.image;
  const resolvedSrc = currentImageSrc 
    ? (currentImageSrc.startsWith("http") 
        ? currentImageSrc 
        : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${currentImageSrc.startsWith("/") ? "" : "/"}${currentImageSrc}`) 
    : null;

  return (
    <div className="relative group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 shadow-inner">
        {resolvedSrc && !error ? (
          <Image
            src={resolvedSrc}
            alt={images[current].alt_text || altText}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 600px"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-primary opacity-50">Aucune image valide</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((p) => (p - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-md backdrop-blur-sm hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent((p) => (p + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-md backdrop-blur-sm hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={cn("h-1.5 w-1.5 rounded-full transition-all", idx === current ? "w-4 bg-primary" : "bg-white/60")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}