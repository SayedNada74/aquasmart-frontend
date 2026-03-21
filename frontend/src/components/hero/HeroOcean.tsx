"use client";

import { OceanEtherBackground } from "./OceanEtherBackground";
import Link from "next/link";
import { ChevronLeft, Play } from "lucide-react";
import { useApp } from "@/lib/AppContext";

interface HeroOceanProps {
    onStartClick?: (e: React.MouseEvent) => void;
    onDashboardClick?: (e: React.MouseEvent) => void;
    onPresentationClick?: (e: React.MouseEvent) => void;
}

export function HeroOcean({ onStartClick, onDashboardClick, onPresentationClick }: HeroOceanProps) {
    const { t, lang } = useApp();
    return (
        <section className="relative min-h-[92vh] overflow-hidden rounded-b-3xl mb-12">
            {/* Background Wrapper */}
            <OceanEtherBackground
                className="absolute inset-0 -z-10"
                intensity={0.9}
                speed={0.35}
                causticsIntensity={0.35}
                fishCount={28}
                netOverlay={true}
                vignette={0.55}
                dprCap={1.5}
            />

            {/* Hero Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 pt-16 md:pt-32 pb-20">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--color-bg-primary)] to-transparent opacity-80 pointer-events-none" />

                <div className="relative text-center max-w-3xl mx-auto pt-8">
                    <div className="inline-flex items-center gap-2 bg-[var(--color-cyan-glow)] border border-[var(--color-cyan)]/30 rounded-full px-4 py-1.5 text-sm text-[var(--color-cyan-dark)] mb-6 shadow-sm backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                        {t("نظام ذكاء اصطناعي للمزارع السمكية في مصر", " AI system for fish farms in Egypt")}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-[var(--color-text-primary)] drop-shadow-md">
                        {t("الثورة القادمة في إدارة", "The next revolution in managing")}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--color-cyan)] to-[var(--color-teal)] drop-shadow-lg">{t("المزارع السمكية", "fish farms")}</span>
                    </h1>

                    <div className="bg-[var(--color-bg-primary)]/40 backdrop-blur-md border border-[var(--color-border)]/50 rounded-2xl p-5 mb-10 max-w-2xl mx-auto shadow-sm">
                        <p className="text-base md:text-lg text-[var(--color-text-primary)] font-medium leading-relaxed">
                            {t("نظام ذكي يتابع حالة الأحواض ويحلل البيانات ويرسل تنبيهات فورية.", "A smart system that monitors ponds, analyzes data, and sends instant alerts.")}
                            <br className="hidden md:block" />
                            {t("راقب مزرعتك من أي مكان، وحسّن إنتاجيتك، وقلّل الخسائر باستخدام الذكاء الاصطناعي المتطور.", "Monitor your farm from anywhere, improve productivity, and reduce losses using advanced AI.")}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <button onClick={onStartClick} className="btn-primary px-8 py-3.5 text-base flex items-center gap-2 shadow-lg shadow-[var(--color-cyan-glow)] focus:ring-2 focus:ring-[var(--color-cyan-dark)]">
                            {t("ابدأ تجربتك الآن", "Start your experience now")}
                            <ChevronLeft className={`w-5 h-5 ${lang === "en" ? "rotate-180" : ""}`} />
                        </button>
                        <button onClick={onPresentationClick} className="btn-secondary bg-[var(--color-bg-primary)]/50 backdrop-blur-sm px-8 py-3.5 text-base flex items-center gap-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-primary)]/80 focus:ring-2 focus:ring-[var(--color-cyan-dark)]">
                            <Play className="w-5 h-5 text-[var(--color-cyan-dark)]" />
                            {t("عرض تقديمي للنظام", "System Presentation")}
                        </button>
                    </div>
                </div>

                {/* Dashboard Preview Cards */}
                <div className="relative z-10 mt-16 max-w-4xl mx-auto hidden md:block">
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { val: "7.3", label: t("قوة الهيدروجين (PH)", "Power of hydrogen (PH)"), color: "#3b82f6" },
                            { val: "28", label: t("درجة الحرارة (°)", "Temperature (°)"), color: "#f59e0b" },
                            { val: "6.9", label: t("الأكسجين المذاب (DO)", "Dissolved Oxygen (DO)"), color: "#14b8a6" },
                            { val: "0.12", label: t("الأمونيا (NH3)", "Ammonia (NH3)"), color: "#ef4444" },
                        ].map((s, i) => (
                            <div key={i} className="card p-4 text-center bg-[var(--color-bg-primary)]/60 backdrop-blur-xl border border-[var(--color-border)]/50">
                                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
