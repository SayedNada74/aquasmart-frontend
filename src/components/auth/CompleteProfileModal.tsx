"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useApp } from "@/lib/AppContext";
import { database } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { User, Phone, MapPin, Fish, Home, ArrowRight, Sparkles, Mail } from "lucide-react";

export function CompleteProfileModal() {
    const { profile, refreshUser, user: firebaseUser } = useAuth();
    const { t, dir } = useApp();
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        farmName: "",
        location: "",
        pondCount: 1,
    });

    useEffect(() => {
        if (profile && !profile.profileCompleted) {
            setFormData({
                fullName: profile.fullName || "",
                phoneNumber: profile.phoneNumber || "",
                farmName: profile.farm?.name || "",
                location: profile.farm?.location || "",
                pondCount: profile.farm?.pondCount || 1,
            });
            setShow(true);
        } else {
            setShow(false);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) return;

        setLoading(true);
        try {
            const userRef = ref(database, `users/${firebaseUser.uid}`);
            const updateData = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                profileCompleted: true,
                farm: {
                    name: formData.farmName,
                    location: formData.location,
                    pondCount: Number(formData.pondCount),
                }
            };
            await update(userRef, updateData);
            await refreshUser();
            setShow(false);
        } catch (error) {
            console.error("Profile complete error:", error);
            alert(t("حدث خطأ أثناء حفظ البيانات", "Error saving data"));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" dir={dir}>
            <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-cyan-dark)] to-[var(--color-teal-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--color-cyan-dark)]/20">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                        {t("لنكمل ملفك الشخصي", "Complete Your Profile")}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {t("خطوة واحدة أخيرة لنخصص تجربة أكوا سمارت لمزرعتك.", "One last step to personalize your AquaSmart experience.")}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-[var(--color-cyan-dark)] uppercase tracking-wider">
                            {t("المعلومات الشخصية", "Personal Information")}
                        </p>

                        <div className="relative">
                            <User className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]`} />
                            <input
                                type="text"
                                placeholder={t("الاسم الكامل", "Full Name")}
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all`}
                            />
                        </div>

                        <div className="relative">
                            <Phone className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]`} />
                            <input
                                type="tel"
                                placeholder={t("رقم الهاتف", "Phone Number")}
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                                className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all`}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent my-1" />

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-[var(--color-teal-dark)] uppercase tracking-wider">
                            {t("إعدادات المزرعة", "Farm Settings")}
                        </p>

                        <div className="relative">
                            <Home className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]`} />
                            <input
                                type="text"
                                placeholder={t("اسم المزرعة", "Farm Name")}
                                value={formData.farmName}
                                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                                required
                                className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all`}
                            />
                        </div>

                        <div className="relative">
                            <MapPin className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]`} />
                            <input
                                type="text"
                                placeholder={t("موقع المزرعة", "Farm Location")}
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                                className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all`}
                            />
                        </div>

                        <div className="relative">
                            <Fish className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]`} />
                            <input
                                type="number"
                                min="1"
                                placeholder={t("عدد الأحواض", "Number of Ponds")}
                                value={formData.pondCount}
                                onChange={(e) => setFormData({ ...formData, pondCount: Number(e.target.value) })}
                                required
                                className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all`}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[var(--color-cyan-dark)] to-[var(--color-teal-dark)] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[var(--color-cyan-dark)]/20 hover:shadow-[var(--color-cyan-dark)]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {t("حفظ والبدء", "Save & Get Started")}
                                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-2 px-4">
                        {t("سيتم استخدام هذه البيانات لتخصيص تقاريرك وتحليلاتك.", "This data will be used to customize your reports and analytics.")}
                    </p>
                </form>
            </div>
        </div>
    );
}
