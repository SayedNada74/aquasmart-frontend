"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useApp } from "@/lib/AppContext";
import { SiteBackground } from "@/components/backgrounds/SiteBackground";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, profile, loading, isVerified } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { dir } = useApp();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/login");
            } else if (!isVerified) {
                router.replace("/verify-email");
            }
        }
    }, [user, profile, loading, isVerified, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center p-4" dir={dir}>
                <SiteBackground />
                <div className="w-12 h-12 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Prevents flashing of protected content before redirect actually occurs
    const isRedirecting = !user || (!isVerified && pathname !== "/verify-email");

    if (isRedirecting) {
        return (
            <div className="flex h-screen items-center justify-center p-4" dir={dir}>
                <SiteBackground />
                <div className="w-12 h-12 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
