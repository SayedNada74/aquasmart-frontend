"use client";

import { X, Shield, Smartphone, Key, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ref, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuth } from "@/lib/auth/AuthProvider";

interface TwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStatus: boolean;
    onStatusChange: (status: boolean) => void;
}

export function TwoFactorModal({ isOpen, onClose, currentStatus, onStatusChange }: TwoFactorModalProps) {
    const { t, lang } = useApp();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");

    if (!isOpen) return null;

    const isRtl = lang === "ar";

    const handleEnable = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = ref(database, `users/${user.uid}/settings/security`);
            await update(userRef, { twoFactorEnabled: true, lastUpdated: new Date().toISOString() });
            onStatusChange(true);
            setStep(3);
        } catch (error) {
            console.error("2FA Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = ref(database, `users/${user.uid}/settings/security`);
            await update(userRef, { twoFactorEnabled: false, lastUpdated: new Date().toISOString() });
            onStatusChange(false);
            onClose();
        } catch (error) {
            console.error("2FA Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className={`relative w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isRtl ? 'font-arabic' : ''}`}>

                {/* Header */}
                <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-cyan)]/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-cyan)]/10 flex items-center justify-center text-[var(--color-cyan)] font-bold text-lg">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)]">
                            {t("المصادقة الثنائية (2FA)", "Two-Factor Authentication")}
                        </h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--color-bg-input)] flex items-center justify-center transition-colors">
                        <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                    </button>
                </div>

                {/* Steps */}
                <div className="p-8">
                    {currentStatus ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto text-[#10b981]">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-[var(--color-text-primary)]">{t("الميزة مفعلة حالياً", "2FA is currently enabled")}</h4>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                    {t("يتم تأمين حسابك الآن بطبقة أمان إضافية.", "Your account is secured with an extra layer of protection.")}
                                </p>
                            </div>
                            <button
                                onClick={handleDisable}
                                disabled={loading}
                                className="w-full py-3 rounded-xl border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/5 font-bold transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("تعطيل الميزة", "Disable Feature")}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex gap-4 p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                                        <Smartphone className="w-6 h-6 text-[var(--color-cyan)] shrink-0" />
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{t("التحقق عبر الهاتف", "Phone Verification")}</h4>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                {t("سنرسل رمز تحقق إلى رقم هاتفك المسجل عند كل عملية تسجيل دخول.", "We will send a code to your phone for every login attempt.")}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="btn-primary w-full py-3 font-bold"
                                    >
                                        {t("بدء الإعداد", "Start Setup")}
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <Key className="w-12 h-12 text-[var(--color-cyan)] mx-auto mb-4" />
                                        <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{t("أدخل رمز التحقق", "Enter Verification Code")}</h4>
                                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                            {t("أدخل الرمز المكون من 6 أرقام المرسل إلى هاتفك (محاكاة)", "Enter the 6-digit code sent to your phone (Simulated)")}
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="000000"
                                        className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-4 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-[var(--color-cyan)]"
                                    />
                                    <button
                                        onClick={handleEnable}
                                        disabled={loading || otp.length < 6}
                                        className="btn-primary w-full py-3 font-bold disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("تفعيل الآن", "Enable Now")}
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center space-y-6">
                                    <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto text-[#10b981]">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[var(--color-text-primary)]">{t("تم التفعيل بنجاح!", "Successfully Enabled!")}</h4>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                            {t("تم تفعيل المصادقة الثنائية لحسابك بنجاح.", "Two-factor authentication has been activated for your account.")}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="btn-primary w-full py-3 font-bold"
                                    >
                                        {t("إغلاق", "Close")}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
