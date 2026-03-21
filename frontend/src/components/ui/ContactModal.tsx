"use client";

import { X, Copy, Mail, Check } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const { t, lang } = useApp();
    const [copied, setCopied] = useState(false);
    const email = "AquaSmartAiSystem@gmail.com";

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <h3 className="font-bold text-[var(--color-text-primary)]">{t("تواصل معنا", "Contact Us")}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-[var(--color-bg-input)] rounded-lg transition-colors">
                        <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-cyan)]/10 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-[var(--color-cyan)]" />
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                        {t("يمكنك التواصل مع فريق الدعم الفني عبر البريد الإلكتروني الرسمي:", "You can contact our technical support team via our official email:")}
                    </p>
                    <div className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl p-3 flex items-center justify-between gap-3 mb-4 group">
                        <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{email}</span>
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-[var(--color-cyan)]/10 rounded-lg transition-colors flex-shrink-0"
                            title={t("نسخ", "Copy")}
                        >
                            {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[var(--color-cyan)]" />}
                        </button>
                    </div>
                    <a
                        href={`mailto:${email}`}
                        className="btn-primary w-full py-2.5 text-sm font-bold shadow-lg shadow-[var(--color-cyan)]/20"
                    >
                        {t("إرسال بريد إلكتروني", "Send Email")}
                    </a>
                </div>
            </div>
        </div>
    );
}
