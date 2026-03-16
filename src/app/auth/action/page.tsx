"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { applyActionCode, confirmPasswordReset } from "firebase/auth";
import { useApp } from "@/lib/AppContext";
import { Mail, CheckCircle, XCircle, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function AuthActionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t, lang } = useApp();

    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    const [status, setStatus] = useState<"loading" | "success" | "error" | "reset-form">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    // Password reset states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        if (!oobCode) {
            setStatus("error");
            setErrorMsg(t("رابط غير صالح أو منتهي الصلاحية.", "Invalid or expired link."));
            return;
        }

        if (mode === "verifyEmail") {
            applyActionCode(auth, oobCode)
                .then(() => {
                    setStatus("success");
                    // Auto-redirect to login after 3 seconds
                    setTimeout(() => router.push("/login"), 3000);
                })
                .catch(() => {
                    setStatus("error");
                    setErrorMsg(t(
                        "رابط التأكيد غير صالح أو تم استخدامه بالفعل.",
                        "Verification link is invalid or already used."
                    ));
                });
        } else if (mode === "resetPassword") {
            setStatus("reset-form");
        } else {
            setStatus("error");
            setErrorMsg(t("إجراء غير معروف.", "Unknown action."));
        }
    }, [mode, oobCode]);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode) return;

        if (newPassword.length < 6) {
            setErrorMsg(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters"));
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg(t("كلمتا المرور غير متطابقتين", "Passwords don't match"));
            return;
        }

        setResetLoading(true);
        setErrorMsg("");
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setStatus("success");
            setTimeout(() => router.push("/login"), 3000);
        } catch {
            setStatus("error");
            setErrorMsg(t(
                "فشل في تغيير كلمة المرور. الرابط قد يكون منتهي الصلاحية.",
                "Failed to reset password. The link may have expired."
            ));
        } finally {
            setResetLoading(false);
        }
    };

    // --- LOADING ---
    if (status === "loading") {
        return (
            <div className="w-full card text-center p-8 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                    {t("جاري التحقق...", "Verifying...")}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("يرجى الانتظار لحظة", "Please wait a moment")}
                </p>
            </div>
        );
    }

    // --- SUCCESS (verification or password reset) ---
    if (status === "success") {
        const isVerify = mode === "verifyEmail";
        return (
            <div className="w-full card text-center p-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                    {isVerify
                        ? t("تم تأكيد حسابك بنجاح! 🎉", "Account verified successfully! 🎉")
                        : t("تم تغيير كلمة المرور بنجاح! 🔐", "Password changed successfully! 🔐")
                    }
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-8">
                    {t("سيتم تحويلك لصفحة تسجيل الدخول خلال ثوانٍ...", "Redirecting to login in a few seconds...")}
                </p>
                <Link href="/login" className="btn-primary w-full py-3 inline-block">
                    {t("تسجيل الدخول الآن", "Login Now")}
                </Link>
            </div>
        );
    }

    // --- PASSWORD RESET FORM ---
    if (status === "reset-form") {
        return (
            <form onSubmit={handlePasswordReset} className="w-full card p-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-[var(--color-cyan)]/10 text-[var(--color-cyan-dark)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-2">
                    {t("إعادة تعيين كلمة المرور", "Reset Password")}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
                    {t("أدخل كلمة المرور الجديدة", "Enter your new password")}
                </p>

                {errorMsg && (
                    <div className="mb-6 p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)] text-center">
                        ❌ {errorMsg}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className={`text-xs text-[var(--color-text-secondary)] block mb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>
                            {t("كلمة المرور الجديدة", "New Password")}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-10 py-3 text-sm text-[var(--color-text-primary)] ${lang === "ar" ? "text-right" : "text-left"} focus:outline-none focus:border-[var(--color-cyan-dark)]`}
                                dir="ltr"
                            />
                            <Lock className={`absolute top-3.5 w-4 h-4 text-[var(--color-text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-3.5 text-[var(--color-text-muted)] ${lang === "ar" ? "left-3" : "right-3"}`}>
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={`text-xs text-[var(--color-text-secondary)] block mb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>
                            {t("تأكيد كلمة المرور", "Confirm Password")}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-10 py-3 text-sm text-[var(--color-text-primary)] ${lang === "ar" ? "text-right" : "text-left"} focus:outline-none focus:border-[var(--color-cyan-dark)]`}
                                dir="ltr"
                            />
                            <Lock className={`absolute top-3.5 w-4 h-4 text-[var(--color-text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
                        </div>
                    </div>

                    <button type="submit" disabled={resetLoading}
                        className="btn-primary w-full py-3 text-base flex items-center justify-center disabled:opacity-60 mt-4">
                        {resetLoading ? (
                            <div className="w-5 h-5 border-2 border-[var(--color-text-primary)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t("تغيير كلمة المرور", "Change Password")
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-sm text-[var(--color-cyan-dark)] hover:underline">
                            {t("العودة لتسجيل الدخول", "Back to Login")}
                        </Link>
                    </div>
                </div>
            </form>
        );
    }

    // --- ERROR ---
    return (
        <div className="w-full card text-center p-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                {t("حدث خطأ", "An error occurred")}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-8">
                {errorMsg}
            </p>
            <Link href="/login" className="btn-primary w-full py-3 inline-block">
                {t("العودة لتسجيل الدخول", "Back to Login")}
            </Link>
        </div>
    );
}

export default function AuthActionPage() {
    return (
        <Suspense fallback={
            <div className="w-full card flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <AuthActionContent />
        </Suspense>
    );
}
