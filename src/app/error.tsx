"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { SiteBackground } from "@/components/backgrounds/SiteBackground";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t, dir } = useApp();

    useEffect(() => {
        console.error("Global error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative" dir={dir}>
            <SiteBackground />
            <div className="card max-w-md w-full text-center p-10 animate-in zoom-in-95 duration-500 relative z-10">
                {/* Error Icon */}
                <div className="w-24 h-24 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12" />
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
                    {t("حدث خطأ غير متوقع", "Something went wrong")}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                    {t(
                        "نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.",
                        "We apologize for this error. You can try again or go back to the homepage."
                    )}
                </p>

                {error.digest && (
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-6 font-mono bg-[var(--color-bg-input)] rounded-lg p-2">
                        Error ID: {error.digest}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button onClick={reset} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        {t("حاول مرة أخرى", "Try Again")}
                    </button>
                    <Link href="/dashboard" className="w-full py-3 bg-transparent border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] flex items-center justify-center gap-2 hover:border-[var(--color-cyan-dark)] transition-colors">
                        <Home className="w-4 h-4" />
                        {t("لوحة القيادة", "Go to Dashboard")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
