"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useApp } from "@/lib/AppContext";
import { database } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { User, Phone, MapPin, Fish, Home, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
    const { profile, refreshUser } = useAuth();
    const { t } = useApp();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        farmName: "",
        location: "",
        pondCount: "1",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phone: profile.phone || "",
                farmName: profile.farmName || "مزرعتي",
                location: profile.location || "مصر",
                pondCount: profile.pondCount || "1",
            });

            // If already completed, redirect to landing
            if (profile.hasCompletedOnboarding) {
                router.push("/landing");
            }
        }
    }, [profile, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        try {
            const userRef = ref(database, `users/${profile.uid}`);
            await update(userRef, {
                ...formData,
                hasCompletedOnboarding: true,
            });
            await refreshUser();
            router.push("/landing");
        } catch (error) {
            console.error("Onboarding error:", error);
            alert("حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="space-y-6" dir="rtl">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                    {t("أهلاً بك في أكوا سمارت!", "Welcome to AquaSmart!")}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("لنبدأ بتجهيز ملف مزرعتك لتحصل على أفضل تجربة.", "Let's set up your farm profile for the best experience.")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Info */}
                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder={t("الاسم الكامل", "Full Name")}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 pr-10 pl-4 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="tel"
                            placeholder={t("رقم الهاتف", "Phone Number")}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 pr-10 pl-4 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all"
                        />
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent my-6" />

                {/* Farm Info */}
                <div className="space-y-4">
                    <div className="relative">
                        <Home className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder={t("اسم المزرعة", "Farm Name")}
                            value={formData.farmName}
                            onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                            required
                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 pr-10 pl-4 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder={t("موقع المزرعة (المدينة/المحافظة)", "Farm Location (City/State)")}
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 pr-10 pl-4 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Fish className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="number"
                            min="1"
                            placeholder={t("عدد الأحواض", "Number of Ponds")}
                            value={formData.pondCount}
                            onChange={(e) => setFormData({ ...formData, pondCount: e.target.value })}
                            required
                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 pr-10 pl-4 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[var(--color-cyan-dark)] to-[var(--color-teal-dark)] text-white py-3 rounded-xl font-bold shadow-lg shadow-[var(--color-cyan-dark)]/20 hover:shadow-[var(--color-cyan-dark)]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            {t("إكمال التسجيل والدخول", "Complete Setup & Enter")}
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
