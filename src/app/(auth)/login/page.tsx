"use client";

import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getArabicAuthError } from "@/lib/auth/firebaseAuthErrors";
import { useApp } from "@/lib/AppContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { refreshUser } = useAuth();
    const router = useRouter();
    const { t, lang } = useApp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError(t("الرجاء إدخال البريد الإلكتروني وكلمة المرور", "Please enter email and password"));
            return;
        }

        setLoading(true);
        try {
            const userCred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
            await refreshUser();

            if (!userCred.user.emailVerified) {
                // Not authenticated yet, AuthGate usually handles this but since we just logged in,
                // sending directly to verify-email is faster UX.
                router.push("/verify-email");
                return;
            }

            // Let AuthGate or explicit push take them to protected landing
            router.push("/landing");
        } catch (err: any) {
            setError(getArabicAuthError(err?.code || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full card">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-2">
                {t("تسجيل الدخول", "Sign In")}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
                {t("أهلاً بك مجدداً! يرجى إدخال بياناتك.", "Welcome back! Please enter your details.")}
            </p>

            <div className="flex items-center justify-center gap-6 mb-8 border-b border-[var(--color-border)]">
                <div className="pb-3 text-sm font-medium transition-colors text-[var(--color-cyan-dark)] border-b-2 border-[var(--color-cyan-dark)]">
                    {t("دخول", "Login")}
                </div>
                <Link href="/register" className="pb-3 text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    {t("إنشاء حساب", "Sign Up")}
                </Link>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)] text-center">
                    ❌ {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className={`text-xs text-[var(--color-text-secondary)] block mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t("البريد الإلكتروني", "Email Address")}</label>
                    <div className="relative">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            placeholder="name@farm.com"
                            className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 ${lang === "ar" ? "pr-10 text-right" : "pl-10 text-left"} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)]`} dir="ltr" />
                        <Mail className={`absolute top-3.5 w-4 h-4 text-[var(--color-text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
                    </div>
                </div>

                <div>
                    <div className={`flex items-center justify-between mb-1 ${lang === "en" ? "flex-row-reverse" : ""}`}>
                        <Link href="/forgot-password" className="text-[10px] text-[var(--color-cyan-dark)] hover:underline">{t("نسيت كلمة المرور؟", "Forgot password?")}</Link>
                        <label className={`text-xs text-[var(--color-text-secondary)] ${lang === "ar" ? "text-right" : "text-left"}`}>{t("كلمة المرور", "Password")}</label>
                    </div>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                            placeholder="••••••••"
                            className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-10 py-3 text-sm text-[var(--color-text-primary)] ${lang === "ar" ? "text-right" : "text-left"} focus:outline-none focus:border-[var(--color-cyan-dark)]`} dir="ltr" />
                        <Lock className={`absolute top-3.5 w-4 h-4 text-[var(--color-text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-3.5 text-[var(--color-text-muted)] ${lang === "ar" ? "left-3" : "right-3"}`}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-[var(--color-text-primary)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <><LogIn className="w-5 h-5" />{t("تسجيل الدخول", "Sign In")}</>
                    )}
                </button>

                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">{t("أو عبر", "Or via")}</span>
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                </div>

                <GoogleLoginButton onError={setError} />

                <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
                    {t("ليس لديك حساب؟", "Don't have an account?")}
                    <Link href="/register" className={`text-[var(--color-cyan-dark)] hover:underline ${lang === "ar" ? "mr-1" : "ml-1"}`}>
                        {t("سجل الآن مجاناً", "Sign up now")}
                    </Link>
                </p>
            </div>
        </form>
    );
}
