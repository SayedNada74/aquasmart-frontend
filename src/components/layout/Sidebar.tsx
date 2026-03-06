"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutGrid, Waves, Radio, Settings as SettingsIcon,
    BarChart3, Sparkles, Bell, Store, User, Home,
    Sun, Moon, Languages, X,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { PillNav, PillNavItem } from "@/components/pill-nav/PillNav";
import { SidebarBackground } from "@/components/sidebar/SidebarBackground";

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { t, lang, setLang, theme, setTheme, userName, userRole } = useApp();

    if (pathname === "/login" || pathname === "/landing") return null;

    const navItems: PillNavItem[] = [
        { id: "/", label: t("لوحة القيادة", "Dashboard"), href: "/", icon: <LayoutGrid className="w-5 h-5" /> },
        { id: "/ponds", label: t("الأحواض", "Ponds"), href: "/ponds", icon: <Waves className="w-5 h-5" /> },
        { id: "/sensors", label: t("المستشعرات", "Sensors"), href: "/sensors", icon: <Radio className="w-5 h-5" /> },
        { id: "/ai-center", label: t("مركز الذكاء الاصطناعي", "AI Center"), href: "/ai-center", icon: <Sparkles className="w-5 h-5" /> },
        { id: "/control", label: t("التحكم الذكي", "Smart Control"), href: "/control", icon: <SettingsIcon className="w-5 h-5" /> },
        { id: "/reports", label: t("التقارير", "Reports"), href: "/reports", icon: <BarChart3 className="w-5 h-5" /> },
        { id: "/alerts", label: t("التنبيهات", "Alerts"), href: "/alerts", icon: <Bell className="w-5 h-5" /> },
        { id: "/market", label: t("السوق", "Market"), href: "/market", icon: <Store className="w-5 h-5" /> },
        { id: "/settings", label: t("الإعدادات", "Settings"), href: "/settings", icon: <SettingsIcon className="w-5 h-5" /> },
    ];

    const handleNavChange = (id: string) => {
        if (onClose) onClose();
        router.push(id);
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <Link href="/" onClick={() => onClose?.()} className="h-16 md:h-20 flex items-center justify-center gap-3 border-b border-[var(--color-border)] px-4 hover:bg-[var(--color-bg-card-hover)] transition-colors">
                <img src="/logo.png" alt="AquaSmart" className="w-14 h-14 md:w-20 md:h-20 rounded-2xl shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div className={lang === "ar" ? "text-right" : "text-left"}>
                    <h1 className="text-sm md:text-base font-bold text-[var(--color-text-primary)] leading-tight">{t("أكوا سمارت", "AquaSmart")}</h1>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">AquaSmart AI</p>
                </div>
                {mobileOpen && (
                    <button onClick={onClose} className="md:hidden absolute left-3 top-5 text-[var(--color-text-muted)]">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </Link>

            {/* PillNav */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
                <PillNav
                    items={navItems}
                    value={pathname}
                    onValueChange={handleNavChange}
                    vertical
                    size="md"
                    variant="glass"
                    activeColor="0 212 170"
                    glowColor="0 212 170"
                    radiusClass="rounded-xl"
                    enableBreathing={true}
                    animateDurationMs={380}
                />

                {/* Landing Page Link */}
                <Link href="/landing" onClick={() => onClose?.()} className="sidebar-link mt-2 border-t border-[var(--color-border)] pt-3">
                    <Home className="w-5 h-5 text-[var(--color-text-muted)]" />
                    <span className="text-sm">{t("الصفحة التعريفية", "About Us")}</span>
                </Link>
            </div>

            {/* Controls */}
            <div className="px-3 py-2 border-t border-[var(--color-border)] space-y-1">
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="sidebar-link w-full">
                    {theme === "dark" ? <Sun className="w-5 h-5 text-[#f59e0b]" /> : <Moon className="w-5 h-5 text-[#3b82f6]" />}
                    <span>{theme === "dark" ? t("الوضع الفاتح", "Light Mode") : t("الوضع المظلم", "Dark Mode")}</span>
                </button>
                <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="sidebar-link w-full">
                    <Languages className="w-5 h-5 text-[var(--color-cyan)]" />
                    <span>{lang === "ar" ? "English" : "العربية"}</span>
                </button>
            </div>

            {/* User */}
            <Link href="/settings" onClick={() => onClose?.()} className="p-3 md:p-4 border-t border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors block">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div className={lang === "ar" ? "text-right" : "text-left"}>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{userName}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{userRole}</p>
                    </div>
                </div>
            </Link>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-[220px] h-screen border-l border-[var(--color-border)] flex-col flex-shrink-0 hidden md:flex relative overflow-hidden">
                <SidebarBackground />
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
                    <aside className="fixed top-0 right-0 w-[260px] h-screen border-l border-[var(--color-border)] flex flex-col z-50 md:hidden overflow-y-auto relative">
                        <SidebarBackground />
                        {sidebarContent}
                    </aside>
                </>
            )}
        </>
    );
}
