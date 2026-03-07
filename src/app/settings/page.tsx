"use client";

import { User, Bell, Shield, Sparkles, LogOut, Save, X, Settings as Cog, Plus, Zap, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { database } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { UpdatePasswordModal } from "@/components/auth/UpdatePasswordModal";
import { UpgradePlanModal } from "@/components/settings/UpgradePlanModal";
import { TwoFactorModal } from "@/components/settings/TwoFactorModal";

export default function SettingsPage() {
    const { t, lang, setUserName, lowPowerMode, setLowPowerMode, dir } = useApp();
    const router = useRouter();
    const { profile: authProfile, refreshUser, user: firebaseUser, loading: authLoading } = useAuth();

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Modals Control
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);

    // Dynamic State
    const [profile, setProfile] = useState({
        displayName: "",
        email: "",
        phoneNumber: "",
        farmName: "",
        location: "",
        pondCount: 0,
        fishTypes: [] as string[],
    });

    const [notifications, setNotifications] = useState({
        system: true,
        daily: true,
        marketing: false
    });

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [newFishType, setNewFishType] = useState("");

    // Update state when auth profile loads
    useEffect(() => {
        if (authProfile) {
            setProfile({
                displayName: authProfile.fullName || "",
                email: authProfile.email || "",
                phoneNumber: authProfile.phoneNumber || "",
                farmName: authProfile.farm?.name || "",
                location: authProfile.farm?.location || "",
                pondCount: authProfile.farm?.pondCount || 0,
                fishTypes: authProfile.settings?.farm?.fishTypes || ["Tilapia", "Mullet"],
            });

            if (authProfile.settings?.notifications) {
                setNotifications(authProfile.settings.notifications);
            }

            if (authProfile.settings?.security) {
                setTwoFactorEnabled(!!authProfile.settings.security.twoFactorEnabled);
            }

            setUserName(authProfile.fullName);
        }
    }, [authProfile, setUserName]);

    const handleSave = async () => {
        if (!firebaseUser) return;
        setSaving(true);

        try {
            const userRef = ref(database, `users/${firebaseUser.uid}`);
            await update(userRef, {
                fullName: profile.displayName,
                phoneNumber: profile.phoneNumber,
                farm: {
                    name: profile.farmName,
                    location: profile.location,
                    pondCount: Number(profile.pondCount),
                },
                settings: {
                    notifications: notifications,
                    farm: {
                        fishTypes: profile.fishTypes,
                    },
                    performance: {
                        lowPowerMode: lowPowerMode
                    },
                    security: {
                        twoFactorEnabled: twoFactorEnabled
                    }
                },
                profileCompleted: true
            });

            setUserName(profile.displayName);
            await refreshUser();

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert(t("حدث خطأ أثناء حفظ البيانات", "Error saving data"));
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        const { signOut } = await import("firebase/auth");
        const { auth } = await import("@/lib/firebase");
        await signOut(auth);
        router.push("/login");
    };

    const addFishType = () => {
        if (newFishType.trim() && !profile.fishTypes.includes(newFishType.trim())) {
            setProfile(p => ({ ...p, fishTypes: [...p.fishTypes, newFishType.trim()] }));
            setNewFishType("");
        }
    };

    const removeFishType = (type: string) => {
        setProfile(p => ({ ...p, fishTypes: p.fishTypes.filter(t => t !== type) }));
    };

    return (
        <PageTransition>
            <div className={`max-w-5xl mx-auto space-y-6 pb-8 ${dir === 'rtl' ? 'font-arabic' : ''}`} dir={dir}>
                <UpdatePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                />
                <UpgradePlanModal
                    isOpen={isUpgradeModalOpen}
                    onClose={() => setIsUpgradeModalOpen(false)}
                />
                <TwoFactorModal
                    isOpen={isTwoFactorModalOpen}
                    onClose={() => setIsTwoFactorModalOpen(false)}
                    currentStatus={twoFactorEnabled}
                    onStatusChange={setTwoFactorEnabled}
                />

                {/* Loader overlay */}
                {authLoading && !authProfile && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                        <div className="w-10 h-10 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Toast */}
                {saved && (
                    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#10b981] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#10b981]/20 flex items-center gap-2 animate-in slide-in-from-top-4 duration-300`}>
                        <Save className="w-4 h-4" />
                        {t("تم حفظ التغييرات بنجاح!", "Changes saved successfully!")}
                    </div>
                )}

                {/* Profile Header */}
                <div className="card flex items-center justify-between gap-4">
                    <button className="btn-primary text-sm flex items-center gap-2" onClick={() => document.getElementById("nameInput")?.focus()}>
                        <User className="w-4 h-4" />
                        {t("تعديل الملف الشخصي", "Edit Profile")}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className={lang === "ar" ? "text-right" : "text-left"}>
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{profile.displayName || t("تحميل...", "Loading...")}</h2>
                            <p className="text-sm text-[var(--color-text-secondary)]">{t("مدير المزرعة", "Farm Manager")}</p>
                            <div className="flex items-center gap-2 mt-1" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] font-bold">{t("نشط", "Active")}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] font-bold">{t("مسؤول النظام", "Admin")}</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] flex items-center justify-center overflow-hidden border-2 border-[var(--color-border)]">
                            {firebaseUser?.photoURL ? (
                                <img src={firebaseUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-white" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel */}
                    <div className="space-y-4">
                        {/* Notifications */}
                        <div className="card">
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] flex items-center gap-2 mb-4" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
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
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${notifications[n.key] ? (lang === "ar" ? "right-5.5" : "left-5.5") : (lang === "ar" ? "right-0.5" : "left-0.5")}`} />
                                        </button>
                                        <span className="text-xs text-[var(--color-text-secondary)] font-medium">{n.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Settings */}
                        <div className="card">
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] flex items-center gap-2 mb-4" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
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

                        {/* Plan */}
                        <div className="card border-2 border-[var(--color-cyan)]/20 bg-gradient-to-t from-[var(--color-cyan)]/5 to-transparent relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                                <Sparkles className="w-20 h-20 text-[var(--color-cyan)]" />
                            </div>
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest mb-1" style={{ textAlign: lang === "ar" ? "right" : "left" }}>{t("الباقة الحالية", "Current Plan")}</p>
                            <h3 className="text-lg font-black text-[var(--color-text-primary)] flex items-center gap-2" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                                {t("أكوا برو (Pro)", "Aqua Pro")}
                                <Zap className="w-4 h-4 text-[var(--color-cyan)] fill-[var(--color-cyan)]" />
                            </h3>
                            <button
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className="btn-primary w-full mt-4 text-xs font-black py-2.5 shadow-lg shadow-[var(--color-cyan)]/10"
                            >
                                {t("ترقية الباقة", "Upgrade Plan")}
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#3b82f6]" />
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)]">{t("المعلومات الشخصية", "Personal Information")}</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-[var(--color-text-secondary)] font-bold px-1">{t("الاسم الكامل", "Full Name")}</label>
                                    <input id="nameInput" type="text" value={profile.displayName} onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)] transition-all font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-[var(--color-text-secondary)] font-bold px-1">{t("البريد الإلكتروني", "Email")}</label>
                                    <input type="email" value={profile.email} disabled
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-muted)] opacity-60 cursor-not-allowed font-medium" />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-xs text-[var(--color-text-secondary)] font-bold px-1">{t("رقم الهاتف", "Phone Number")}</label>
                                    <input type="tel" value={profile.phoneNumber} onChange={(e) => setProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)] transition-all font-medium" />
                                </div>
                            </div>
                        </div>

                        {/* Farm Settings */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)]">{t("إعدادات المزرعة", "Farm Settings")}</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-[var(--color-text-secondary)] font-bold px-1">{t("اسم المزرعة", "Farm Name")}</label>
                                    <input type="text" value={profile.farmName} onChange={(e) => setProfile(p => ({ ...p, farmName: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)] transition-all font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-[var(--color-text-secondary)] font-bold px-1">{t("الموقع", "Location")}</label>
                                    <input type="text" value={profile.location} onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)] transition-all font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-[var(--color-text-secondary)] font-bold px-1">{t("عدد الأحواض", "Total Ponds")}</label>
                                    <input type="number" value={profile.pondCount} onChange={(e) => setProfile(p => ({ ...p, pondCount: Number(e.target.value) }))}
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)] transition-all font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-[var(--color-text-secondary)] font-bold px-1">{t("الأنواع الرئيسية", "Main Species")}</label>
                                    <div className="flex gap-2 flex-wrap items-center">
                                        {profile.fishTypes.map((type) => (
                                            <span key={type} className="px-3 py-1 rounded-full bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] text-xs border border-[var(--color-cyan)]/20 font-bold flex items-center gap-1 group">
                                                {type}
                                                <button onClick={() => removeFishType(type)} className="hover:text-red-500 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        <div className="flex items-center gap-1 ml-1">
                                            <input
                                                type="text"
                                                value={newFishType}
                                                onChange={(e) => setNewFishType(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addFishType()}
                                                placeholder={t("إضافة...", "Add...")}
                                                className="w-20 bg-transparent border-b border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                                            />
                                            <button onClick={addFishType} className="p-1 rounded-full hover:bg-[var(--color-bg-input)] text-[var(--color-cyan)]">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#10b981]" />
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)]">{t("الأمان والحساب", "Security & Account")}</h3>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] hover:border-[var(--color-cyan)]/20 transition-all group">
                                    <button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="btn-secondary text-xs px-4 py-2 font-black"
                                    >
                                        {t("تحديث", "Update")}
                                    </button>
                                    <div className={lang === "ar" ? "text-right" : "text-left"}>
                                        <p className="text-sm text-[var(--color-text-primary)] font-black">{t("كلمة المرور", "Password")}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">{t("آخر تغيير: نشط", "Last changed: Active")}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] hover:border-[var(--color-cyan)]/20 transition-all">
                                    <button
                                        onClick={() => setIsTwoFactorModalOpen(true)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${twoFactorEnabled ? "bg-[var(--color-cyan)]" : "bg-[var(--color-border)]"}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${twoFactorEnabled ? (lang === "ar" ? "right-5.5" : "left-5.5") : (lang === "ar" ? "right-0.5" : "left-0.5")}`} />
                                    </button>
                                    <div className={lang === "ar" ? "text-right" : "text-left"}>
                                        <p className="text-sm text-[var(--color-text-primary)] font-black">{t("المصادقة الثنائية (2FA)", "Two-Factor Auth (2FA)")}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                                            {twoFactorEnabled ? t("مفعلة للحماية القصوى", "Enabled for maximum protection") : t("طبقة أمان إضافية", "Extra security layer")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 flex-wrap pt-4">
                            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3 font-black shadow-xl shadow-[var(--color-cyan)]/20 disabled:opacity-60 transition-all hover:-translate-y-0.5">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? t("جاري الحفظ...", "Saving...") : t("حفظ التغييرات", "Save Changes")}
                            </button>
                            <button
                                onClick={() => router.refresh()}
                                className="btn-secondary flex items-center gap-2 px-6 py-3 font-black hover:bg-[var(--color-border)] transition-all"
                            >
                                <X className="w-4 h-4" />
                                {t("إلغاء التعديلات", "Cancel")}
                            </button>
                            <button onClick={handleLogout} className="px-6 py-3 rounded-xl bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 text-sm font-black flex items-center gap-2 hover:bg-[#ef4444] hover:text-white transition-all ml-auto" style={{ marginInlineStart: lang === "ar" ? "0" : "auto", marginInlineEnd: lang === "ar" ? "auto" : "0" }}>
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
