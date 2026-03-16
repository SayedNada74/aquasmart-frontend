import { SiteBackground } from "@/components/backgrounds/SiteBackground";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center relative">
            <SiteBackground />
            <div className="flex flex-col items-center gap-6 z-10">
                {/* Logo */}
                <img src="/logo.png" alt="AquaSmart" className="w-20 h-20 rounded-2xl shadow-lg animate-pulse" />

                {/* Spinner */}
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-[var(--color-border)] rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-[var(--color-cyan)] rounded-full animate-spin" />
                </div>

                {/* Text */}
                <p className="text-sm text-[var(--color-text-secondary)] animate-pulse">
                    جاري التحميل...
                </p>
            </div>
        </div>
    );
}
