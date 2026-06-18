
// components/admin/produits/ProductFormModal.tsx
"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/special/ui/Dialog";
import { StepIndicator, type Step } from "./StepIndicator";
import { StepGeneralInfo } from "./ProductFormSteps/StepGeneralInfo";
import { StepImages } from "./ProductFormSteps/StepImages";
import { StepVariants } from "./ProductFormSteps/StepVariants";
import { StepReview } from "./ProductFormSteps/StepReview";
import type { ProductVariantAdmin } from "@/modeles/produits";
import type { ProductFormErrors, ProductFormState, UploadedProductImage } from "../productsUtils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, Sparkles, X } from "lucide-react";

const steps: Step[] = [
  { id: "general", label: "Général" },
  { id: "images", label: "Images" },
  { id: "variants", label: "Variantes" },
  { id: "review", label: "Récapitulatif" },
];

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  initialForm: ProductFormState;
  selectedCategoryId: string;
  categories: { id: string; name: string }[];
  existingImages?: any[];
  existingVariants?: ProductVariantAdmin[];
  onSave: (payload: any, uploadedImages: UploadedProductImage[], variants: any[]) => Promise<void>;
  onAddVariant: (variant: any) => Promise<void>;
  onUpdateVariant: (id: string, variant: any) => Promise<void>;
  onDeleteVariant: (id: string) => void;
  isSaving?: boolean;
}

export function ProductFormModal({
  open, onClose, initialForm, selectedCategoryId, categories, existingImages = [], existingVariants = [],
  onSave, onAddVariant, onUpdateVariant, onDeleteVariant, isSaving = false,
}: ProductFormModalProps) {
  const isEditing = Boolean(initialForm.name);

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [uploadedImages, setUploadedImages] = useState<UploadedProductImage[]>([]);
  const [altText, setAltText] = useState(initialForm.alt_text || "");
  const [selectedCatId, setSelectedCatId] = useState(selectedCategoryId);
  const [variants, setVariants] = useState(existingVariants);

  // ─── Fix critique : re-synchroniser le state quand la modale s'ouvre ─────────
  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setSelectedCatId(selectedCategoryId);
      setAltText(initialForm.alt_text || "");
      setVariants(existingVariants);
      setUploadedImages([]);
      setCurrentStep(0);
      setCompletedSteps([]);
      setFormErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Sync variants when existingVariants changes (après ajout/modif)
  useEffect(() => {
    setVariants(existingVariants);
  }, [existingVariants]);

  const handleChange = (field: keyof ProductFormState, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
    if (field === "alt_text") setAltText(value as string);
  };

  const handleAddLocalVariant = async (variant: any) => {
    if (isEditing) {
      await onAddVariant(variant);
    } else {
      setVariants(prev => [...prev, { ...variant, id: `temp-${Date.now()}` }]);
    }
  };

  const handleUpdateLocalVariant = async (id: string, variant: any) => {
    if (isEditing && !id.startsWith("temp-")) {
      await onUpdateVariant(id, variant);
    } else {
      setVariants(prev => prev.map(v => v.id === id ? { ...v, ...variant } : v));
    }
  };

  const handleDeleteLocalVariant = async (id: string) => {
    if (isEditing && !id.startsWith("temp-")) {
      onDeleteVariant(id);
    } else {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleSetPrimaryUploaded = (id: string) => {
    setUploadedImages(prev => prev.map(img => ({ ...img, is_primary: img.id === id })));
  };

  const validateGeneralStep = () => {
    const errors: ProductFormErrors = {};
    if (!form.name.trim()) errors.name = "Le nom est requis";
    if (!form.sku.trim()) errors.sku = "Le SKU est requis";
    if (!form.price.trim()) errors.price = "Le prix est requis";
    if (!selectedCatId) errors.category = "La catégorie est requise";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToStep = (idx: number) => {
    // Si on essaie d'avancer depuis step 0, valider d'abord
    if (currentStep === 0 && idx > 0 && !validateGeneralStep()) return;
    // Marquer les steps intermédiaires comme complétés si on saute en avant
    if (idx > currentStep) {
      const newCompleted = new Set(completedSteps);
      for (let i = currentStep; i < idx; i++) newCompleted.add(i);
      setCompletedSteps([...newCompleted]);
    }
    setCurrentStep(idx);
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => { if (currentStep > 0) setCurrentStep(prev => prev - 1); };

  const handleFinalSave = async () => {
    if (!validateGeneralStep()) { setCurrentStep(0); return; }
    await onSave({ ...form, category: selectedCatId, alt_text: altText }, uploadedImages, variants);
    onClose();
  };

  const handleAddImages = (files: File[]) => {
    const newImages = files.map((file, idx) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      preview: URL.createObjectURL(file),
      alt_text: altText,
      is_primary: uploadedImages.length === 0 && idx === 0,
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };
  const removeUploadedImage = (id: string) => setUploadedImages(prev => prev.filter(img => img.id !== id));

  const stepContent = [
    <StepGeneralInfo
      key="general"
      form={form}
      errors={formErrors}
      onChange={handleChange}
      categories={categories}
      selectedCategoryId={selectedCatId}
      onCategoryChange={setSelectedCatId}
    />,
    <StepImages
      key="images"
      uploadedImages={uploadedImages}
      existingImages={existingImages}
      onAddImages={handleAddImages}
      onRemoveUploaded={removeUploadedImage}
      onSetPrimaryUploaded={handleSetPrimaryUploaded}
      altText={altText}
      onAltTextChange={setAltText}
    />,
    <StepVariants
      key="variants"
      variants={variants}
      onAddVariant={handleAddLocalVariant}
      onUpdateVariant={handleUpdateLocalVariant}
      onDeleteVariant={handleDeleteLocalVariant}
      isSaving={isSaving}
    />,
    <StepReview
      key="review"
      form={form}
      selectedCategoryName={categories.find(c => c.id === selectedCatId)?.name || ""}
      uploadedImages={uploadedImages}
      existingImages={existingImages}
      variants={variants}
    />,
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] sm:max-w-3xl p-0 rounded-2xl md:rounded-[2rem] border border-border/30 shadow-2xl bg-surface overflow-hidden max-h-[95vh] flex flex-col">
        <DialogTitle className="sr-only">
          {isEditing ? "Modifier le produit" : "Nouveau produit"}
        </DialogTitle>

        {/* Header fixe */}
        <div className="relative shrink-0 border-b border-border/50 bg-gradient-to-r from-primary/8 via-transparent to-transparent px-5 py-4 md:px-6 md:py-5">
          {/* Déco */}
          <div className="absolute right-8 top-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground leading-tight">
                  {isEditing ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Étape {currentStep + 1} sur {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-alt hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {stepContent[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer fixe */}
        <div className="shrink-0 flex items-center justify-between gap-3 border-t border-border/50 bg-surface-alt/30 px-5 py-4 md:px-6">
          {/* Bouton précédent */}
          <motion.button
            onClick={prevStep}
            disabled={currentStep === 0}
            whileHover={currentStep > 0 ? { scale: 1.02 } : {}}
            whileTap={currentStep > 0 ? { scale: 0.97 } : {}}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </motion.button>

          {/* Indicateur central */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-6 bg-primary" : completedSteps.includes(idx) ? "w-3 bg-primary/40" : "w-3 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Bouton suivant / Enregistrer */}
          {currentStep < steps.length - 1 ? (
            <motion.button
              onClick={nextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleFinalSave}
              disabled={isSaving}
              whileHover={!isSaving ? { scale: 1.02 } : {}}
              whileTap={!isSaving ? { scale: 0.97 } : {}}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </motion.button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}