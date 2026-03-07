"use client";

import { Mail, Lock, Eye, EyeOff, UserPlus, Phone } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { getArabicAuthError } from "@/lib/auth/firebaseAuthErrors";
import { createOrUpdateUserProfile } from "@/lib/auth/createUserProfile";
import { useApp } from "@/lib/AppContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { t, lang } = useApp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError(t("الرجاء إكمال جميع الحقول المطلوبة", "Please complete all required fields"));
            return;
        }

        if (password.length < 6) {
            setError(t("كلمة المرور يجب أن تتكون من 6 أحرف على الأقل", "Password must be at least 6 characters"));
            return;
        }

        setLoading(true);
        try {
            // 1) Create auth user
            const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());

            // 2) Update Firebase Display Name
            await updateProfile(userCred.user, { displayName: name.trim() });

            // 3) Create user profile in Realtime Database manually
            await createOrUpdateUserProfile(userCred.user, "password", name.trim(), phone.trim());

            // 4) Send Verification Email
            await sendEmailVerification(userCred.user);

            // 5) Push to Verify Email screen
            router.push("/verify-email");
        } catch (err: any) {
            setError(getArabicAuthError(err?.code || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full card">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-2">
                {t("إنشاء حساب جديد", "Create Account")}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
                {t("أنشئ حسابك واستمتع بإدارة مزرعتك.", "Create an account and manage your farm.")}
            </p>

            <div className="flex items-center justify-center gap-6 mb-8 border-b border-[var(--color-border)]">
                <Link href="/login" className="pb-3 text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    {t("دخول", "Login")}
                </Link>
                <div className="pb-3 text-sm font-medium transition-colors text-[var(--color-cyan-dark)] border-b-2 border-[var(--color-cyan-dark)]">
                    {t("إنشاء حساب", "Sign Up")}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)] text-center">
                    ❌ {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className={`text-xs text-[var(--color-text-secondary)] block mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t("الاسم الكامل *", "Full Name *")}</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                        placeholder={t("أدخل اسمك الكامل", "Enter your full name")}
                        className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] ${lang === "ar" ? "text-right" : "text-left"} focus:outline-none focus:border-[var(--color-cyan-dark)]`} dir={lang === "ar" ? "rtl" : "ltr"} />
                </div>

                <div>
                    <label className={`text-xs text-[var(--color-text-secondary)] block mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t("رقم التليفون", "Phone Number")}</label>
                    <div className="relative">
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                            placeholder="+20 1XX XXX XXXX"
                            className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 ${lang === "ar" ? "pr-10 text-right" : "pl-10 text-left"} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)]`} dir="ltr" />
                        <Phone className={`absolute top-3.5 w-4 h-4 text-[var(--color-text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
                    </div>
                </div>

                <div>
                    <label className={`text-xs text-[var(--color-text-secondary)] block mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t("البريد الإلكتروني *", "Email Address *")}</label>
                    <div className="relative">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            placeholder="name@farm.com"
                            className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 ${lang === "ar" ? "pr-10 text-right" : "pl-10 text-left"} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)]`} dir="ltr" />
                        <Mail className={`absolute top-3.5 w-4 h-4 text-[var(--color-text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
                    </div>
                </div>

                <div>
                    <label className={`text-xs text-[var(--color-text-secondary)] ${lang === "ar" ? "text-right block mb-1" : "text-left block mb-1"}`}>{t("كلمة المرور *", "Password *")}</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
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
                        <><UserPlus className="w-5 h-5" />{t("إنشاء حساب", "Sign Up")}</>
                    )}
                </button>

                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">{t("أو عبر", "Or via")}</span>
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                </div>

                <GoogleLoginButton onError={setError} />

                <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
                    {t("لديك حساب بالفعل؟", "Already have an account?")}
                    <Link href="/login" className={`text-[var(--color-cyan-dark)] hover:underline ${lang === "ar" ? "mr-1" : "ml-1"}`}>
                        {t("تسجيل الدخول", "Sign In")}
                    </Link>
                </p>
            </div>
        </form>
    );
}
