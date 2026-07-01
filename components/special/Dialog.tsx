'use client';

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { useThemeStore } from '@/store/theme.store';

// Inline class merger — no external dependency needed
function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

// -- Overlay (backdrop) ------------------------------------------------------
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, style, ...props }, ref) => {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cx(
        "fixed inset-0 z-50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "duration-300 ease-out",
        className
      )}
      style={{
        background: isDark
          ? 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(35,190,49,0.08), transparent), rgba(5,15,7,0.78)'
          : 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(35,190,49,0.04), transparent), rgba(255,255,255,0.72)',
        backdropFilter: 'blur(18px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        ...style,
      }}
      {...props}
    />
  );
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// -- Content panel -----------------------------------------------------------
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, ...props }, ref) => {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
        <DialogPrimitive.Content
          ref={ref}
          className={cx(
            // Positioning (handled by flex parent now)
            "relative w-full max-w-lg max-h-[90vh] overflow-y-auto",
            // Rounded & layout
            "rounded-[2rem] grid gap-5 p-7 md:w-full",
            // Radix animation — spring-like zoom + fade + slide
            "duration-200 ease-out",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
          style={{
            background: isDark
              ? 'linear-gradient(160deg, rgba(14,26,17,0.97) 0%, rgba(8,15,11,0.99) 100%)'
              : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: isDark
              ? '0 40px 80px -20px rgba(0,0,0,0.75), 0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.08) inset'
              : '0 16px 48px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
            ...style,
          }}
          {...props}
        >
          {/* Ambient top-edge green shimmer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[2rem]"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent 5%, rgba(35,190,49,0.5) 35%, rgba(35,190,49,0.7) 50%, rgba(35,190,49,0.5) 65%, transparent 95%)'
                : 'linear-gradient(90deg, transparent 5%, rgba(35,190,49,0.35) 35%, rgba(35,190,49,0.55) 50%, rgba(35,190,49,0.35) 65%, transparent 95%)',
            }}
          />
          {children}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

// -- Header ------------------------------------------------------------------
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

// -- Footer ------------------------------------------------------------------
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

// -- Title -------------------------------------------------------------------
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, style, ...props }, ref) => {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cx("text-lg font-bold leading-tight tracking-tight", className)}
      style={{ color: isDark ? 'rgba(255,255,255,0.92)' : '#1a1f1b', ...style }}
      {...props}
    />
  );
})
DialogTitle.displayName = DialogPrimitive.Title.displayName

// -- Description -------------------------------------------------------------
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, style, ...props }, ref) => {
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cx("text-sm leading-relaxed", className)}
      style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)', ...style }}
      {...props}
    />
  );
})
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}