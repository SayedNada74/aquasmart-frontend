"use client";

import { useState, useEffect } from "react";
import { AppProvider, useApp } from "@/lib/AppContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SiteBackground } from "@/components/backgrounds/SiteBackground";

function InnerLayout({ children }: { children: React.ReactNode }) {
    const { dir } = useApp();
    const pathname = usePathname();
    const router = useRouter();
    const isFullPage = pathname === "/login" || pathname === "/landing";
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
            setAuthChecked(true);
            if (!user && !isFullPage) {
                router.replace("/login");
            } else if (user && pathname === "/login") {
                router.replace("/landing");
            }
        });
        return () => unsub();
    }, [isFullPage, router]);

    if (isFullPage) {
        return (
            <div dir={dir} className="relative min-h-screen">
                <SiteBackground />
                {children}
            </div>
        );
    }

    // Show loading while checking auth or during redirect for unauthenticated users
    if (!authChecked || (!isLoggedIn && !isFullPage)) {
        return (
            <div className="flex h-screen items-center justify-center" dir={dir}>
                <SiteBackground />
                <div className="w-12 h-12 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden relative" dir={dir}>
            <SiteBackground />
            <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <InnerLayout>{children}</InnerLayout>
        </AppProvider>
    );
}
