"use client";

import { PageTransition } from "@/components/motion/PageTransition";
import { useApp } from "@/lib/AppContext";
import { Sun, Moon, Languages } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { t, lang, setLang, theme, setTheme } = useApp();

    return (
        <PageTransition>
            <div className="min-h-screen flex" dir="rtl">
                {/* Right: Hero */}
                <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent opacity-80" />
                    <div className="relative z-10 text-center px-12">
                        <img src="/logo.png" alt="AquaSmart" className="w-32 h-32 mx-auto mb-6 rounded-2xl shadow-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">AquaSmart</h1>
                        <p className="text-xl text-[var(--color-text-primary)] font-semibold mb-4 leading-relaxed">
                            {t("مستقبل تربية الأحياء المائية بين يديك", "The future of aquaculture in your hands")}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                            {t("انضم إلى آلاف المزارع التي تستخدم AquaSmart لتحسين الإنتاجية، وتقليل الهدر، ومراقبة جودة المياه لحظة بلحظة.", "Join thousands of farms using AquaSmart to improve productivity, reduce waste, and monitor water quality in real time.")}
                        </p>
                        <div className="flex items-center justify-center gap-8 mt-8">
                            <div className="text-center"><p className="text-lg font-bold text-[var(--color-cyan-dark)]">🔔</p><p className="text-xs text-[var(--color-text-muted)]">{t("تنبيهات فورية", "Instant Alerts")}</p></div>
                            <div className="text-center"><p className="text-lg font-bold text-[var(--color-cyan-dark)]">📊</p><p className="text-xs text-[var(--color-text-muted)]">{t("تحليلات ذكية", "Smart Analytics")}</p></div>
                            <div className="text-center"><p className="text-lg font-bold text-[var(--color-cyan-dark)]">🤖</p><p className="text-xs text-[var(--color-text-muted)]">{t("ذكاء اصطناعي", "AI Assistant")}</p></div>
                        </div>
                    </div>
                </div>

                {/* Left: Form Container */}
                <div className="w-full lg:w-[480px] bg-[var(--color-bg-primary)] sm:bg-transparent sm:backdrop-blur-xl sm:border-r sm:border-[var(--color-border)] flex flex-col items-center justify-center p-8 z-10 relative">

                    {/* Controls */}
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                        <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-cyan-dark)] transition-colors bg-[var(--color-bg-input)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                            <Languages className="w-4 h-4" />
                            {lang === "ar" ? "English" : "العربية"}
                        </button>
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-cyan-dark)] transition-colors">
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Dynamic Page Content */}
                    <div className="w-full max-w-sm mt-10">
                        {children}
                        <p className="text-center w-full text-[10px] text-[var(--color-text-muted)] mt-8">{t("© AquaSmart 2024. جميع الحقوق محفوظة.", "© 2024 AquaSmart. All rights reserved.")}</p>
                    </div>

                </div>
            </div>
        </PageTransition>
    );
}
