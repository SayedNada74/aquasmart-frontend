"use client";

import { X, Check, Sparkles, Zap, Shield, BarChart3, MessageSquare } from "lucide-react";
import { useApp } from "@/lib/AppContext";

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
    const { t, lang } = useApp();

    if (!isOpen) return null;

    const isRtl = lang === "ar";

    const features = [
        { name: t("تحليلات ذكية متقدمة", "Advanced AI Analytics"), basic: true, pro: true },
        { name: t("تقارير أداء تفصيلية", "Detailed Performance Reports"), basic: true, pro: true },
        { name: t("دعم فني عبر البريد", "Email Support"), basic: true, pro: true },
        { name: t("استخدام غير محدود للذكاء الاصطناعي", "Unlimited AI Usage"), basic: false, pro: true },
        { name: t("توقعات إنتاج ذكية", "Smart Production Forecasting"), basic: false, pro: true },
        { name: t("إدارة متعددة الأحواض (بلا حدود)", "Unlimited Pond Management"), basic: false, pro: true },
        { name: t("تكامل مع أجهزة استشعار خارجية", "External Sensor Integration"), basic: false, pro: true },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className={`relative w-full max-w-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 ${isRtl ? 'font-arabic' : ''}`}>
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-[var(--color-cyan)]" />
                            <h3 className="text-2xl font-black text-[var(--color-text-primary)]">
                                {t("ترقية إلى أكوا برو", "Upgrade to Aqua Pro")}
                            </h3>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {t("افتح القوة الكاملة لإدارة مزرعتك بالذكاء الاصطناعي", "Unlock the full power of AI farm management")}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-[var(--color-bg-input)] flex items-center justify-center transition-colors">
                        <X className="w-6 h-6 text-[var(--color-text-muted)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Basic Plan Info */}
                        <div className="p-6 rounded-2xl bg-[var(--color-bg-input)]/50 border border-[var(--color-border)] opacity-60">
                            <h4 className="text-sm font-bold text-[var(--color-text-secondary)] mb-1">{t("الخطة الأساسية", "Basic Plan")}</h4>
                            <p className="text-2xl font-black text-[var(--color-text-primary)] mb-4">{t("مجاناً", "Free")}</p>
                            <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-muted)]">{t("خطة المبتدئين", "Starter Plan")}</span>
                        </div>

                        {/* Pro Plan Info */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-teal)]/10 border-2 border-[var(--color-cyan)]">
                            <h4 className="text-sm font-bold text-[var(--color-cyan)] mb-1">{t("خطة برو", "Pro Plan")}</h4>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-black text-[var(--color-text-primary)]">$10</span>
                                <span className="text-xs text-[var(--color-text-secondary)]">/ {t("شهرياً", "month")}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-cyan)] text-white font-bold">{t("الأكثر مبيعاً", "Popular")}</span>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-2 border-b border-[var(--color-border)] pb-2">
                            {t("ميزات الخطة", "Plan Features")}
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--color-text-primary)] font-medium">{f.name}</span>
                                    <div className="flex items-center gap-6">
                                        <div className="w-4 h-4 flex items-center justify-center text-[var(--color-text-muted)] opacity-30">
                                            {f.basic ? <Check className="w-4 h-4" /> : <X className="w-3 h-3" />}
                                        </div>
                                        <div className="w-5 h-5 rounded-full bg-[var(--color-cyan)]/20 flex items-center justify-center text-[var(--color-cyan)]">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 pt-4 bg-[var(--color-bg-input)]/30 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[var(--color-text-secondary)] max-w-[280px]">
                        {t("* يتم تجديد الاشتراك تلقائياً كل شهر. يمكنك الإلغاء في أي وقت.", "* Subscription renews automatically every month. Cancel anytime.")}
                    </p>
                    <button className="btn-primary px-10 py-3 text-sm font-bold shadow-xl shadow-[var(--color-cyan)]/20 w-full sm:w-auto">
                        {t("اشترك الآن", "Subscribe Now")}
                    </button>
                </div>
            </div>
        </div>
    );
}
