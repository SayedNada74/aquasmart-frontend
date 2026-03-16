"use client";

import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Home, Search, ArrowRight } from "lucide-react";
import { SiteBackground } from "@/components/backgrounds/SiteBackground";

export default function NotFound() {
    const { t, dir } = useApp();

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative" dir={dir}>
            <SiteBackground />
            <div className="card max-w-md w-full text-center p-10 animate-in zoom-in-95 duration-500 relative z-10">
                {/* 404 Number */}
                <div className="relative mb-6">
                    <h1 className="text-[120px] font-black leading-none bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] bg-clip-text text-transparent select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 text-[120px] font-black leading-none text-[var(--color-cyan)] opacity-10 blur-2xl select-none">
                        404
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
                    {t("الصفحة غير موجودة", "Page Not Found")}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                    {t(
                        "عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. تأكد من صحة الرابط أو عد للصفحة الرئيسية.",
                        "Sorry, the page you're looking for doesn't exist or has been moved. Check the URL or go back to the homepage."
                    )}
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link href="/dashboard" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" />
                        {t("لوحة القيادة", "Go to Dashboard")}
                    </Link>
                    <Link href="/" className="w-full py-3 bg-transparent border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] flex items-center justify-center gap-2 hover:border-[var(--color-cyan-dark)] transition-colors">
                        {t("الصفحة الرئيسية", "Homepage")}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <p className="text-[10px] text-[var(--color-text-muted)] mt-8">
                    {t("© AquaSmart 2024. جميع الحقوق محفوظة.", "© 2024 AquaSmart. All rights reserved.")}
                </p>
            </div>
        </div>
    );
}
