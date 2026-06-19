

// components/admin/produits/ProductFormSteps/StepImages.tsx
"use client";
import { useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import type { ProductImageAdmin } from "@/modeles/produits";
import type { UploadedProductImage } from "../../productsUtils";

interface StepImagesProps {
  uploadedImages: UploadedProductImage[];
  existingImages: ProductImageAdmin[];
  onAddImages: (files: File[]) => void;
  onRemoveUploaded: (id: string) => void;
  onSetPrimaryUploaded: (id: string) => void;
  altText: string;
  onAltTextChange: (value: string) => void;
}

export function StepImages({ uploadedImages, existingImages, onAddImages, onRemoveUploaded, onSetPrimaryUploaded, altText, onAltTextChange }: StepImagesProps) {
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onAddImages(files);
    if (ref.current) ref.current.value = "";
  };
  return (
    <div className="space-y-6">
      <div onClick={() => ref.current?.click()} className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border -alt transition-colors hover:border-primary hover:bg-primary/5">
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Cliquez ou glissez des images</p>
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
        <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
      </div>
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Nouvelles images ({uploadedImages.length})</h4>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {uploadedImages.map((img, idx) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-border ">
                <Image src={img.preview} alt="Preview" fill className="object-cover" />
                {img.is_primary && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm z-10">Principale</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                  <div className="flex justify-end w-full">
                    <button onClick={() => onRemoveUploaded(img.id)} className="rounded-full bg-red-500/90 hover:bg-red-500 p-1.5 text-white transition-colors"><X className="h-3 w-3" /></button>
                  </div>
                  {!img.is_primary && (
                    <button onClick={() => onSetPrimaryUploaded(img.id)} className="w-full rounded bg-white/20 backdrop-blur-sm py-1 text-[10px] font-semibold text-white hover:bg-primary transition-colors">Définir principale</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {existingImages.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Images existantes ({existingImages.length})</h4>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {existingImages.map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-2xl border border-border  shadow-sm">
                <Image
                  src={img.image.startsWith("http") ? img.image : `${process.env.NEXT_PUBLIC_API_URL || "https://disclose-blaspheme-pointed.ngrok-free.dev"}${img.image.startsWith("/") ? "" : "/"}${img.image}`}
                  alt={img.alt_text}
                  fill
                  className="object-cover"
                />
                {img.is_primary && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">Principale</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Texte alternatif (SEO)</label>
        <input value={altText} onChange={(e) => onAltTextChange(e.target.value)} className="h-11 w-full rounded-2xl border border-border  px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Description des images" />
      </div>
    </div>
  );
}
