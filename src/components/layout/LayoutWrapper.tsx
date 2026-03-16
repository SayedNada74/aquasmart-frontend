"use client";

import { useState } from "react";
import { AppProvider, useApp } from "@/lib/AppContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { usePathname } from "next/navigation";
import { SiteBackground } from "@/components/backgrounds/SiteBackground";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { AuthGate } from "@/components/auth/AuthGate";
import { CompleteProfileModal } from "@/components/auth/CompleteProfileModal";

import { UniversalNotifications } from "@/components/notifications/UniversalNotifications";

function InnerLayout({ children }: { children: React.ReactNode }) {
    const { dir } = useApp();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Landing page (root) and other full-page auth routes
    const isFullPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/verify-email" || pathname === "/forgot-password" || pathname === "/terms" || pathname === "/privacy" || pathname.startsWith("/auth/");

    if (isFullPage) {
        return (
            <div dir={dir} className="relative min-h-screen overflow-x-hidden">
                <SiteBackground />
                {children}
            </div>
        );
    }

    return (
        <AuthGate>
            <div className="flex h-screen overflow-hidden relative" dir={dir}>
                <SiteBackground />
                <UniversalNotifications />
                <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
                <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                    <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
                </div>
            </div>
            <CompleteProfileModal />
        </AuthGate>
    );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AppProvider>
                <InnerLayout>{children}</InnerLayout>
            </AppProvider>
        </AuthProvider>
    );
}
