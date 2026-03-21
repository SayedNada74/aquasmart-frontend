"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useApp } from "@/lib/AppContext";
import { auth as firebaseAuth } from "@/lib/firebase";
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "firebase/auth";
import { Shield, Lock, CheckCircle2, AlertCircle, X, KeyRound, ArrowRight } from "lucide-react";

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpdatePasswordModal({ isOpen, onClose }: UpdatePasswordModalProps) {
    const { user, profile } = useAuth();
    const { t, dir } = useApp();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"current" | "new" | "success">(profile?.provider === "google" ? "success" : "current");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const isGoogle = profile?.provider === "google";

    const handleReauth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) return;
        setLoading(true);
        setError("");
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            setStep("new");
        } catch (err: any) {
            console.error(err);
            setError(t("كلمة المرور الحالية غير صحيحة", "Incorrect current password"));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t("كلمات المرور غير متطابقة", "Passwords do not match"));
            return;
        }
        if (newPassword.length < 6) {
            setError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters"));
            return;
        }
        setLoading(true);
        setError("");
        try {
            await updatePassword(user!, newPassword);
            setStep("success");
        } catch (err: any) {
            console.error(err);
            setError(t("فشل تحديث كلمة المرور. يرجى المحاولة لاحقاً.", "Failed to update password. Try again later."));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(isGoogle ? "success" : "current");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" dir={dir}>
            <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 relative">
                <button
                    onClick={handleClose}
                    className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} p-2 rounded-full hover:bg-[var(--color-bg-input)] transition-colors text-[var(--color-text-muted)]`}
                >
                    <X className="w-4 h-4" />
                </button>

                {isGoogle ? (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                            {t("حساب جوجل", "Google Account")}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                            {t("أنت مسجل دخول بواسطة جوجل. لا تحتاج لتغيير كلمة المرور هنا، يمكنك إدارتها عبر أمان حساب جوجل الخاص بك.", "You are signed in with Google. You don't need to change password here; you can manage it via your Google Account security.")}
                        </p>
                        <button onClick={handleClose} className="btn-primary w-full">
                            {t("حسناً", "Got it")}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                                {t("تحديث كلمة المرور", "Update Password")}
                            </h3>
                        </div>

                        {step === "current" && (
                            <form onSubmit={handleReauth} className="space-y-4">
                                <p className="text-sm text-[var(--color-text-secondary)] px-2">
                                    {t("للأمان، يرجى إدخال كلمة المرور الحالية أولاً.", "For security, please enter your current password first.")}
                                </p>
                                <div className="relative">
                                    <Lock className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]`} />
                                    <input
                                        type="password"
                                        placeholder={t("كلمة المرور الحالية", "Current Password")}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all`}
                                    />
                                </div>
                                {error && (
                                    <div className="flex items-center gap-2 text-xs text-red-500 px-2 animate-in slide-in-from-top-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {error}
                                    </div>
                                )}
                                <button disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t("التالي", "Next")}
                                </button>
                            </form>
                        )}

                        {step === "new" && (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <KeyRound className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]`} />
                                        <input
                                            type="password"
                                            placeholder={t("كلمة المرور الجديدة", "New Password")}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all`}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]`} />
                                        <input
                                            type="password"
                                            placeholder={t("تأكيد كلمة المرور", "Confirm Password")}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl py-3 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] transition-all`}
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <div className="flex items-center gap-2 text-xs text-red-500 px-2 animate-in slide-in-from-top-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {error}
                                    </div>
                                )}
                                <button disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : t("تحديث كلمة المرور", "Update Password")}
                                </button>
                            </form>
                        )}

                        {step === "success" && (
                            <div className="text-center py-6 space-y-4">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                                    {t("تم التحديث بنجاح", "Updated Successfully")}
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    {t("لقد تم تغيير كلمة المرور الخاصة بك بنجاح.", "Your password has been changed successfully.")}
                                </p>
                                <button onClick={handleClose} className="btn-primary w-full py-3">
                                    {t("إغلاق", "Close")}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
