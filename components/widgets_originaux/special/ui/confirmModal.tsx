'use client';

import * as React from 'react';
import { AlertTriangle, Info, CheckCircle, HelpCircle, Trash2 } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/widgets_originaux/special/ui/Dialog';
import LoadingSpinner from '@/components/widgets_originaux/special/ui/LoadingSpinner';
import LoadingKalvin from '@/components/widgets_originaux/special/loadingKalvin';

// --- Types ------------------------------------------------------------------

export interface ConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info' | 'success' | 'question';
    isLoading?: boolean;
    children?: React.ReactNode;
}

// --- Type config -------------------------------------------------------------

const typeConfigs = {
    warning: {
        icon: AlertTriangle,
        iconBgDark: 'bg-amber-500/20 text-amber-400',
        iconBgLight: 'bg-amber-100 text-amber-600',
        accentDark: 'from-amber-500 to-orange-600',
        accentLight: 'from-amber-400 to-orange-500',
        btnClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-500/25',
        borderDark: 'border-amber-500/30',
        borderLight: 'border-amber-200',
    },
    danger: {
        icon: Trash2,
        iconBgDark: 'bg-red-500/20 text-red-400',
        iconBgLight: 'bg-red-100 text-red-600',
        accentDark: 'from-red-500 to-rose-600',
        accentLight: 'from-red-500 to-rose-600',
        btnClass: 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-500/25',
        borderDark: 'border-red-500/30',
        borderLight: 'border-red-200',
    },
    info: {
        icon: Info,
        iconBgDark: 'bg-blue-500/20 text-blue-400',
        iconBgLight: 'bg-blue-100 text-blue-600',
        accentDark: 'from-blue-500 to-indigo-600',
        accentLight: 'from-blue-400 to-indigo-500',
        btnClass: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/25',
        borderDark: 'border-blue-500/30',
        borderLight: 'border-blue-200',
    },
    success: {
        icon: CheckCircle,
        iconBgDark: 'bg-[#23BE31]/20 text-[#23BE31]',
        iconBgLight: 'bg-[#23BE31]/10 text-[#1a8f26]',
        accentDark: 'from-[#23BE31] to-[#1fa92c]',
        accentLight: 'from-[#23BE31] to-[#1fa92c]',
        btnClass: 'bg-gradient-to-r from-[#23BE31] to-[#1fa92c] hover:shadow-[#23BE31]/25',
        borderDark: 'border-[#23BE31]/30',
        borderLight: 'border-green-200',
    },
    question: {
        icon: HelpCircle,
        iconBgDark: 'bg-purple-500/20 text-purple-400',
        iconBgLight: 'bg-purple-100 text-purple-600',
        accentDark: 'from-purple-500 to-violet-600',
        accentLight: 'from-purple-400 to-violet-500',
        btnClass: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:shadow-purple-500/25',
        borderDark: 'border-purple-500/30',
        borderLight: 'border-purple-200',
    },
};

// --- Component ---------------------------------------------------------------

export default function ConfirmModal({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Confirmation',
    message = 'Êtes-vous sûr de vouloir continuer ?',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'warning',
    isLoading = false,
    children,
}: ConfirmModalProps) {
    const { resolvedTheme: theme } = useThemeStore();
    const isDark = theme === 'dark';

    const cfg = typeConfigs[type] ?? typeConfigs.warning;
    const Icon = cfg.icon;

    const accent = isDark ? cfg.accentDark : cfg.accentLight;
    const iconBg = isDark ? cfg.iconBgDark : cfg.iconBgLight;
    const border = isDark ? cfg.borderDark : cfg.borderLight;

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open && !isLoading) onCancel(); }}>
            <DialogContent
                className={`
                    max-w-md overflow-hidden rounded-[clamp(1.5rem,2.5vw,2rem)] border-none p-0
                    ${isDark ? 'bg-[#0F171C] text-white' : 'bg-white text-gray-900 shadow-2xl'}
                    border ${border}
                `}
            >
                {/* Top accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />

                {/* Ambient halo */}
                <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl bg-gradient-to-br ${accent} opacity-[0.08] pointer-events-none`} />

                {/* Body */}
                <div className="relative flex flex-col items-center text-center p-[clamp(1.5rem,3vw,2.5rem)] pb-0">
                    {/* Animated icon */}
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-[clamp(1rem,1.5vw,1.25rem)] shadow-lg ${iconBg}`}>
                        <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping" />
                        <Icon className="w-8 h-8 relative z-10" />
                    </div>

                    {/* Title – wrapped in DialogTitle for a11y */}
                    <DialogTitle
                        className={`text-[clamp(1.1rem,1.5vw,1.5rem)] font-black mb-[clamp(0.5rem,0.75vw,0.75rem)] ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                        {title}
                    </DialogTitle>

                    {/* Message – wrapped in DialogDescription for a11y */}
                    <DialogDescription
                        className={`text-[clamp(0.8rem,1vw,0.95rem)] leading-relaxed max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        {message}
                    </DialogDescription>

                    {children && (
                        <div className="mt-4 w-full text-left">
                            {children}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center items-center p-[clamp(1.5rem,3vw,2rem)]">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className={`
                            w-full sm:w-auto min-w-[130px] py-[clamp(0.625rem,1vw,0.875rem)] px-[clamp(1rem,1.5vw,1.5rem)]
                            rounded-[clamp(0.75rem,1vw,1rem)] font-bold text-[clamp(0.8rem,0.9vw,0.9rem)]
                            transition-all duration-200
                            ${isDark
                                ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            w-full sm:w-auto min-w-[130px] py-[clamp(0.625rem,1vw,0.875rem)] px-[clamp(1rem,1.5vw,1.5rem)]
                            rounded-[clamp(0.75rem,1vw,1rem)] font-black text-[clamp(0.8rem,0.9vw,0.9rem)]
                            text-white shadow-lg flex items-center justify-center gap-2
                            ${cfg.btnClass}
                            hover:scale-[1.02] hover:shadow-xl
                            transition-all duration-200
                            disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed
                        `}
                    >
                        {isLoading ? (
                            <>
                                <LoadingKalvin />
                                <span>Traitement...</span>
                            </>
                        ) : (
                            <>
                                <span>{confirmText}</span>
                                <Icon className="w-4 h-4 opacity-70" />
                            </>
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
