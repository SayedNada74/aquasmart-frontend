"use client";

import { User, Bell, Shield, Sparkles, LogOut, Save, X, Settings as Cog } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageTransition } from "@/components/motion/PageTransition";

const defaultProfile = {
    name: "أحمد محمد",
    email: "ahmed@aquasmart.io",
    phone: "+20 123 456 7890",
    farmName: "AquaSmart Delta",
    location: "كفر الشيخ، مصر",
    pondCount: "12",
};

const defaultNotifs = { system: true, daily: true, marketing: false };

export default function SettingsPage() {
    const { t, lang, setUserName, lowPowerMode, setLowPowerMode } = useApp();
    const router = useRouter();
    const { profile: authProfile } = useAuth();

    const [notifications, setNotifications] = useState(defaultNotifs);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Initialize with authProfile if available, otherwise fallback
    const [profile, setProfile] = useState({
        name: authProfile?.name || defaultProfile.name,
        email: authProfile?.email || defaultProfile.email,
        phone: authProfile?.phone || defaultProfile.phone,
        farmName: authProfile?.farmName || defaultProfile.farmName,
        location: authProfile?.location || defaultProfile.location,
        pondCount: authProfile?.pondCount || defaultProfile.pondCount,
    });

    // Update profile state when authenticaton profile loads
    useEffect(() => {
        if (authProfile) {
            setProfile(prev => ({
                ...prev,
                name: authProfile.name || prev.name,
                email: authProfile.email || prev.email,
                phone: authProfile.phone || prev.phone,
                farmName: authProfile.farmName || prev.farmName,
                location: authProfile.location || prev.location,
                pondCount: authProfile.pondCount || prev.pondCount,
            }));
        }
    }, [authProfile]);

    // Load saved data from localStorage on mount
    useEffect(() => {
        try {
            const savedNotifs = localStorage.getItem("aquasmart_notifs");
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
        } catch { }
    }, []);

    // Translate defaults on lang change
    useEffect(() => {
        setProfile((prev) => {
            const updated = { ...prev };
            if (prev.location === "كفر الشيخ، مصر" || prev.location === "Kafr El-Sheikh, Egypt") {
                updated.location = t("كفر الشيخ، مصر", "Kafr El-Sheikh, Egypt");
            }
            if (!authProfile?.name && (prev.name === "أحمد محمد" || prev.name === "Ahmed Mohamed")) {
                updated.name = t("أحمد محمد", "Ahmed Mohamed");
            }
            return updated;
        });
    }, [lang, t, authProfile]);

    const handleSave = async () => {
        setSaving(true);
        // Simulate save - In a real app we would update Firebase Realtime Database here
        await new Promise((r) => setTimeout(r, 1200));

        localStorage.setItem("aquasmart_notifs", JSON.stringify(notifications));
        // Update global context so name changes everywhere
        setUserName(profile.name);

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleLogout = async () => {
        const { signOut } = await import("firebase/auth");
        const { auth } = await import("@/lib/firebase");
        await signOut(auth);
        localStorage.removeItem("aquasmart_notifs");
        router.push("/login");
    };

    return (
        <PageTransition>
            <div className="max-w-5xl mx-auto space-y-6 pb-8">
                {/* Toast */}
                {saved && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#10b981] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#10b981]/20 flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
                        <Save className="w-4 h-4" />
                        {t("تم حفظ التغييرات بنجاح!", "Changes saved successfully!")}
                    </div>
                )}

                {/* Profile Header */}
                <div className="card flex items-center justify-between">
                    <button className="btn-primary text-sm flex items-center gap-2" onClick={() => document.getElementById("nameInput")?.focus()}>
                        <User className="w-4 h-4" />
                        {t("تعديل الملف الشخصي", "Edit Profile")}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className={lang === "ar" ? "text-right" : "text-left"}>
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{profile.name}</h2>
                            <p className="text-sm text-[var(--color-text-secondary)]">{t("مدير المزرعة", "Farm Manager")}</p>
                            <div className="flex items-center gap-2 mt-1" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981]">{t("نشط", "Active")}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6]">{t("مسؤول النظام", "Admin")}</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel */}
                    <div className="space-y-4">
                        {/* Notifications */}
                        <div className="card">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                {t("إدارة الإشعارات", "Notification Settings")}
                                <Bell className="w-4 h-4 text-[var(--color-cyan)]" />
                            </h3>
                            <div className="space-y-3">
                                {([
                                    { label: t("تنبيهات النظام", "System Alerts"), key: "system" as const },
                                    { label: t("التقارير اليومية", "Daily Reports"), key: "daily" as const },
                                    { label: t("رسائل البريد التسويقية", "Marketing Emails"), key: "marketing" as const },
                                ]).map((n) => (
                                    <div key={n.key} className="flex items-center justify-between">
                                        <button onClick={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key] }))}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${notifications[n.key] ? "bg-[var(--color-cyan)]" : "bg-[var(--color-border)]"}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${notifications[n.key] ? (lang === "ar" ? "right-0.5" : "left-5.5") : (lang === "ar" ? "left-0.5" : "left-0.5")}`} />
                                        </button>
                                        <span className="text-xs text-[var(--color-text-secondary)]">{n.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Settings */}
                        <div className="card">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                {t("أداء النظام", "System Performance")}
                                <Sparkles className="w-4 h-4 text-[var(--color-cyan)]" />
                            </h3>
                            <div className="flex items-center justify-between">
                                <button onClick={() => setLowPowerMode(!lowPowerMode)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${lowPowerMode ? "bg-[var(--color-cyan)]" : "bg-[var(--color-border)]"}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${lowPowerMode ? (lang === "ar" ? "right-5.5" : "left-5.5") : (lang === "ar" ? "right-0.5" : "left-0.5")}`} />
                                </button>
                                <div className={lang === "ar" ? "text-right" : "text-left"}>
                                    <span className="block text-xs font-semibold text-[var(--color-text-primary)]">{t("وضع توفير الطاقة", "Low Power Mode")}</span>
                                    <span className="text-[10px] text-[var(--color-text-secondary)]">{t("إيقاف التأثيرات للحفاظ على البطارية", "Disable animations to save battery")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Integration */}
                        <div className="card">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                {t("إعدادات التكامل", "Integration Settings")}
                                <Cog className="w-4 h-4 text-[var(--color-cyan)]" />
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-input)]">
                                    <span className="badge-safe">{t("متصل", "Connected")}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--color-text-primary)]">Firebase</span>
                                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-input)]">
                                    <span className="badge-safe">{t("جاهز", "Ready")}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--color-text-primary)]">AI Model</span>
                                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Plan */}
                        <div className="card bg-gradient-to-t from-[var(--color-cyan)]/5 to-transparent">
                            <p className="text-[10px] text-[var(--color-text-secondary)]" style={{ textAlign: lang === "ar" ? "right" : "left" }}>{t("الباقة الحالية", "Current Plan")}</p>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)]" style={{ textAlign: lang === "ar" ? "right" : "left" }}>{t("أكوا برو (Pro)", "Aqua Pro")}</h3>
                            <button className="btn-secondary w-full mt-3 text-xs">{t("ترقية الباقة", "Upgrade Plan")}</button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <div className="card">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                {t("المعلومات الشخصية", "Personal Information")}
                                <User className="w-4 h-4 text-[#3b82f6]" />
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">{t("الاسم الكامل", "Full Name")}</label>
                                    <input id="nameInput" type="text" value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">{t("البريد الإلكتروني", "Email")}</label>
                                    <input type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">{t("رقم الهاتف", "Phone Number")}</label>
                                    <input type="tel" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]" />
                                </div>
                            </div>
                        </div>

                        {/* Farm Settings */}
                        <div className="card">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                {t("إعدادات المزرعة", "Farm Settings")}
                                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">{t("اسم المزرعة", "Farm Name")}</label>
                                    <input type="text" value={profile.farmName} onChange={(e) => setProfile(p => ({ ...p, farmName: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">{t("الموقع", "Location")}</label>
                                    <input type="text" value={profile.location} onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">{t("عدد الأحواض", "Total Ponds")}</label>
                                    <input type="number" value={profile.pondCount} onChange={(e) => setProfile(p => ({ ...p, pondCount: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--color-text-secondary)] block mb-1">{t("الأنواع الرئيسية", "Main Species")}</label>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="px-3 py-1 rounded-full bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] text-xs border border-[var(--color-cyan)]/30">Tilapia ×</span>
                                        <span className="px-3 py-1 rounded-full bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] text-xs border border-[var(--color-cyan)]/30">Mullet ×</span>
                                        <span className="px-3 py-1 rounded-full bg-[var(--color-bg-input)] text-[var(--color-text-muted)] text-xs border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-cyan)]">+</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="card">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                {t("الأمان والحساب", "Security & Account")}
                                <Shield className="w-4 h-4 text-[#10b981]" />
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-input)]">
                                    <button className="btn-secondary text-xs px-3 py-1">{t("تحديث", "Update")}</button>
                                    <div>
                                        <p className="text-sm text-[var(--color-text-primary)] font-medium">{t("كلمة المرور", "Password")}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{t("آخر تغيير: منذ 3 أيام", "Last changed: 3 days ago")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-input)]">
                                    <button className="w-10 h-5 rounded-full relative bg-[var(--color-cyan)]">
                                        <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 right-0.5" />
                                    </button>
                                    <div>
                                        <p className="text-sm text-[var(--color-text-primary)] font-medium">{t("المصادقة الثنائية (2FA)", "Two-Factor Auth (2FA)")}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{t("طبقة أمان إضافية", "Extra security layer")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 flex-wrap">
                            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? t("جاري الحفظ...", "Saving...") : t("حفظ التغييرات", "Save Changes")}
                            </button>
                            <button className="btn-secondary flex items-center gap-2">
                                <X className="w-4 h-4" />
                                {t("إلغاء التعديلات", "Cancel")}
                            </button>
                            <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 text-sm font-medium flex items-center gap-2 hover:bg-[#ef4444]/20 transition-colors" style={{ marginInlineStart: "auto" }}>
                                <LogOut className="w-4 h-4" />
                                {t("تسجيل الخروج", "Sign Out")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
