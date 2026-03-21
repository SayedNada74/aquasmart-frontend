"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { getArabicAuthError } from "@/lib/auth/firebaseAuthErrors";
import { useApp } from "@/lib/AppContext";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const { t, lang } = useApp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError(t("الرجاء إدخال البريد الإلكتروني", "Please enter an email address"));
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            setSuccess(true);
        } catch (err: any) {
            setError(getArabicAuthError(err?.code || ""));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full card text-center p-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                    {t("تم الإرسال!", "Sent!")}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-8">
                    {t("لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى:", "We sent a password reset link to:")}
                    <br />
                    <span className="font-bold text-[var(--color-text-primary)] mt-2 block" dir="ltr">{email}</span>
                </p>
                <Link href="/login" className="btn-primary w-full py-3 inline-block">
                    {t("العودة لتسجيل الدخول", "Back to Login")}
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full card p-8">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-2">
                {t("نسيت كلمة المرور؟", "Forgot Password?")}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
                {t("أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.", "Enter your email and we'll send you a link to reset your password.")}
            </p>

            {error && (
                <div className="mb-6 p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)] text-center">
                    ❌ {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className={`text-xs text-[var(--color-text-secondary)] block mb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>{t("البريد الإلكتروني", "Email Address")}</label>
                    <div className="relative">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            placeholder="name@farm.com"
                            className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 ${lang === "ar" ? "pr-10 text-right" : "pl-10 text-left"} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)]`} dir="ltr" />
                        <Mail className={`absolute top-3.5 w-4 h-4 text-[var(--color-text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
                    </div>
                </div>

                <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 text-base flex items-center justify-center disabled:opacity-60">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-[var(--color-text-primary)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                        t("إرسال رابط الإعادة", "Send Reset Link")
                    )}
                </button>

                <div className="text-center mt-6">
                    <Link href="/login" className="text-sm text-[var(--color-cyan-dark)] hover:underline">
                        {t("العودة لتسجيل الدخول", "Back to Login")}
                    </Link>
                </div>
            </div>
        </form>
    );
}
