"use client";

import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Phone, Sun, Moon, Languages } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { PageTransition } from "@/components/motion/PageTransition";
import { useApp } from "@/lib/AppContext";
import { database } from "@/lib/firebase";
import { ref, set, get } from "firebase/database";

const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل",
    "auth/invalid-email": "البريد الإلكتروني غير صالح",
    "auth/weak-password": "كلمة المرور ضعيفة (6 أحرف على الأقل)",
    "auth/user-not-found": "لا يوجد حساب بهذا البريد الإلكتروني",
    "auth/wrong-password": "كلمة المرور غير صحيحة",
    "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "auth/too-many-requests": "محاولات كثيرة. حاول بعد دقائق",
    "auth/network-request-failed": "خطأ في الاتصال بالإنترنت",
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول",
    "auth/operation-not-allowed": "تسجيل الدخول بالبريد الإلكتروني غير مفعّل. يجب تفعيله من Firebase Console",
    "auth/configuration-not-found": "إعدادات Firebase غير مكتملة. تأكد من App ID و Messaging Sender ID",
    "auth/invalid-api-key": "مفتاح Firebase API غير صالح",
};

function getErrorMsg(code: string): string {
    return errorMessages[code] || `خطأ: ${code || "غير معروف"}`;
}

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [nameError, setNameError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const { t, lang, setLang, theme, setTheme } = useApp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setEmailError("");
        setPasswordError("");
        setNameError("");
        setSuccess("");

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        let hasError = false;

        if (!isLogin && !name.trim()) {
            setNameError(t("الاسم الكامل مطلوب", "Full name is required"));
            hasError = true;
        }

        if (!trimmedEmail) {
            setEmailError(t("البريد الإلكتروني مطلوب", "Email is required"));
            hasError = true;
        } else if (!isLogin) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                setEmailError(t("بريد إلكتروني غير صالح", "Invalid email address"));
                hasError = true;
            }
        }

        if (!trimmedPassword) {
            setPasswordError(t("كلمة المرور مطلوبة", "Password is required"));
            hasError = true;
        } else if (!isLogin) {
            const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
            if (!passwordRegex.test(trimmedPassword)) {
                setPasswordError(t("يجب أن تتكون من 8 أحرف وحرف كبير (Capital)", "At least 8 chars and 1 capital letter"));
                hasError = true;
            }
        } else {
            if (trimmedPassword.length < 6) {
                setPasswordError(t("يجب أن تكون 6 أحرف على الأقل", "At least 6 characters"));
                hasError = true;
            }
        }

        if (hasError) return;

        setLoading(true);
        try {
            if (isLogin) {
                // LOGIN
                await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
                router.push("/landing");
            } else {
                // SIGNUP
                const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
                await updateProfile(userCred.user, { displayName: name.trim() });

                // Save profile to Firebase RTDB
                await set(ref(database, `users/${userCred.user.uid}`), {
                    name: name.trim(),
                    email: trimmedEmail,
                    phone: phone.trim() || "",
                    farmName: "AquaSmart Delta",
                    location: "مصر",
                    pondCount: "3",
                    createdAt: new Date().toISOString()
                });

                setSuccess("تم إنشاء الحساب بنجاح! ✅ جاري التحويل...");
                setTimeout(() => router.push("/landing"), 1500);
            }
        } catch (err: any) {
            const code = err?.code || "";
            if (code.includes("email") || code.includes("user-not-found")) {
                setEmailError(getErrorMsg(code));
            } else if (code.includes("password") || code.includes("credential")) {
                setPasswordError(getErrorMsg(code));
            } else {
                setError(getErrorMsg(code));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Check if user profile already exists
            const userRef = ref(database, `users/${result.user.uid}`);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                // Create profile if new Google User
                await set(userRef, {
                    name: result.user.displayName || "مستخدم جديد",
                    email: result.user.email || "",
                    phone: result.user.phoneNumber || "",
                    farmName: "AquaSmart Delta",
                    location: "مصر",
                    pondCount: "3",
                    createdAt: new Date().toISOString()
                });
            }

            router.push("/landing");
        } catch (err: any) {
            setError(getErrorMsg(err?.code || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex" dir="rtl">
                {/* Right: Hero */}
                <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent opacity-80" />
                    <div className="relative z-10 text-center px-12">
                        <img src="/logo.png" alt="AquaSmart" className="w-32 h-32 mx-auto mb-6 rounded-2xl shadow-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-3">AquaSmart</h1>
                        <p className="text-xl text-[var(--color-text-primary)] font-semibold mb-4 leading-relaxed">
                            {t("مستقبل تربية الأحياء المائية بين يديك", "The future of aquaculture in your hands")}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                            {t("انضم إلى آلاف المزارع التي تستخدم AquaSmart لتحسين الإنتاجية، وتقليل الهدر، ومراقبة جودة المياه لحظة بلحظة.", "Join thousands of farms using AquaSmart to improve productivity, reduce waste, and monitor water quality in real time.")}
                        </p>
                        <div className="flex items-center justify-center gap-8 mt-8">
                            <div className="text-center"><p className="text-lg font-bold text-[var(--color-cyan-dark)]">🔔</p><p className="text-xs text-[var(--color-text-muted)]">{t("تنبيهات فورية", "Instant Alerts")}</p></div>
                            <div className="text-center"><p className="text-lg font-bold text-[var(--color-cyan-dark)]">📊</p><p className="text-xs text-[var(--color-text-muted)]">{t("تحليلات ذكية", "Smart Analytics")}</p></div>
                            <div className="text-center"><p className="text-lg font-bold text-[var(--color-cyan-dark)]">🤖</p><p className="text-xs text-[var(--color-text-muted)]">{t("ذكاء اصطناعي", "AI Assistant")}</p></div>
                        </div>
                    </div>
                </div>

                {/* Left: Form */}
                <div className="w-full lg:w-[480px] bg-[var(--color-bg-primary)] sm:bg-transparent sm:backdrop-blur-xl sm:border-r sm:border-[var(--color-border)] flex flex-col items-center justify-center p-8 z-10 relative">

                    {/* Controls */}
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                        <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-cyan-dark)] transition-colors bg-[var(--color-bg-input)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                            <Languages className="w-4 h-4" />
                            {lang === "ar" ? "English" : "العربية"}
                        </button>
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-cyan-dark)] transition-colors">
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full max-w-sm card mt-10">
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-2">
                            {isLogin ? t("تسجيل الدخول", "Sign In") : t("إنشاء حساب جديد", "Create Account")}
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
                            {isLogin ? t("أهلاً بك مجدداً! يرجى إدخال بياناتك.", "Welcome back! Please enter your details.") : t("أنشئ حسابك واستمتع بإدارة مزرعتك.", "Create an account and manage your farm.")}
                        </p>

                        <div className="flex items-center justify-center gap-6 mb-8 border-b border-[var(--color-border)]">
                            <button type="button" onClick={() => { setIsLogin(true); setError(""); setEmailError(""); setPasswordError(""); setNameError(""); setSuccess(""); }}
                                className={`pb-3 text-sm font-medium transition-colors ${isLogin ? "text-[var(--color-cyan-dark)] border-b-2 border-[var(--color-cyan-dark)]" : "text-[var(--color-text-muted)]"}`}>
                                {t("دخول", "Login")}
                            </button>
                            <button type="button" onClick={() => { setIsLogin(false); setError(""); setEmailError(""); setPasswordError(""); setNameError(""); setSuccess(""); }}
                                className={`pb-3 text-sm font-medium transition-colors ${!isLogin ? "text-[var(--color-cyan-dark)] border-b-2 border-[var(--color-cyan-dark)]" : "text-[var(--color-text-muted)]"}`}>
                                {t("إنشاء حساب", "Sign Up")}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)] text-center">
                                ❌ {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-sm text-[var(--color-success)] text-center">
                                {success}
                            </div>
                        )}

                        <div className="space-y-4">
                            {!isLogin && (
                                <>
                                    <div>
                                        <label className={`text-xs text-[var(--color-text-secondary)] block mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t("الاسم الكامل *", "Full Name *")}</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                            placeholder={t("أدخل اسمك الكامل", "Enter your full name")}
                                            className={`w-full bg-[var(--color-bg-input)] border ${nameError ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"} rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] ${lang === "ar" ? "text-right" : "text-left"} focus:outline-none focus:border-[var(--color-cyan-dark)] placeholder:text-[var(--color-text-muted)]`} dir={lang === "ar" ? "rtl" : "ltr"} />
                                        {nameError && <span className="text-[10px] text-[var(--color-danger)] mt-1 block">{nameError}</span>}
                                    </div>
                                    <div>
                                        <label className={`text-xs text-[var(--color-text-secondary)] block mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t("رقم التليفون", "Phone Number")}</label>
                                        <div className="relative">
                                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+20 1XX XXX XXXX"
                                                className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 ${lang === "ar" ? "pr-10 text-right" : "pl-10 text-left"} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] placeholder:text-[var(--color-text-muted)]`} dir="ltr" />
                                            <Phone className={`absolute top-3.5 w-4 h-4 text-[var(--color-text-muted)] ${lang === "ar" ? "right-3" : "left-3"}`} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className={`text-xs text-[var(--color-text-secondary)] block mb-1 ${lang === "ar" ? "text-right" : "text-left"}`}>{t("البريد الإلكتروني *", "Email Address *")}</label>
                                <div className="relative">
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@farm.com"
                                        className={`w-full bg-[var(--color-bg-input)] border ${emailError ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"} rounded-xl px-4 py-3 ${lang === "ar" ? "pr-10 text-right" : "pl-10 text-left"} text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan-dark)] placeholder:text-[var(--color-text-muted)]`} dir="ltr" />
                                    <Mail className={`absolute top-3.5 w-4 h-4 ${emailError ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"} ${lang === "ar" ? "right-3" : "left-3"}`} />
                                </div>
                                {emailError && <span className="text-[10px] text-[var(--color-danger)] mt-1 block">{emailError}</span>}
                            </div>

                            <div>
                                <div className={`flex items-center justify-between mb-1 ${lang === "en" ? "flex-row-reverse" : ""}`}>
                                    {isLogin && <button type="button" className="text-[10px] text-[var(--color-cyan-dark)] hover:underline">{t("نسيت كلمة المرور؟", "Forgot password?")}</button>}
                                    <label className={`text-xs text-[var(--color-text-secondary)] ${lang === "ar" ? "text-right" : "text-left"}`}>{t("كلمة المرور *", "Password *")}</label>
                                </div>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full bg-[var(--color-bg-input)] border ${passwordError ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"} rounded-xl px-10 py-3 text-sm text-[var(--color-text-primary)] ${lang === "ar" ? "text-right" : "text-left"} focus:outline-none focus:border-[var(--color-cyan-dark)] placeholder:text-[var(--color-text-muted)]`} dir="ltr" />
                                    <Lock className={`absolute top-3.5 w-4 h-4 ${passwordError ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"} ${lang === "ar" ? "right-3" : "left-3"}`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-3.5 text-[var(--color-text-muted)] ${lang === "ar" ? "left-3" : "right-3"}`}>
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordError && <span className="text-[10px] text-[var(--color-danger)] mt-1 block">{passwordError}</span>}
                            </div>

                            <button type="submit" disabled={loading}
                                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-[var(--color-text-primary)] border-t-transparent rounded-full animate-spin" />
                                ) : isLogin ? (
                                    <><LogIn className="w-5 h-5" />{t("تسجيل الدخول", "Sign In")}</>
                                ) : (
                                    <><UserPlus className="w-5 h-5" />{t("إنشاء حساب", "Sign Up")}</>
                                )}
                            </button>

                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-[var(--color-border)]" />
                                <span className="text-xs text-[var(--color-text-muted)]">{t("أو عبر", "Or via")}</span>
                                <div className="flex-1 h-px bg-[var(--color-border)]" />
                            </div>

                            <button type="button" onClick={handleGoogleLogin} disabled={loading}
                                className="w-full py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] flex items-center justify-center gap-2 hover:border-[var(--color-cyan-dark)] transition-colors disabled:opacity-60">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {t("المتابعة باستخدام Google", "Continue with Google")}
                            </button>

                            <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
                                {isLogin ? t("ليس لديك حساب؟", "Don't have an account?") : t("لديك حساب بالفعل؟", "Already have an account?")}
                                <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); setEmailError(""); setPasswordError(""); setNameError(""); setSuccess(""); }}
                                    className={`text-[var(--color-cyan-dark)] hover:underline ${lang === "ar" ? "mr-1" : "ml-1"}`}>
                                    {isLogin ? t("سجل الآن مجاناً", "Sign up now") : t("تسجيل الدخول", "Sign In")}
                                </button>
                            </p>
                        </div>

                        <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-8">{t("© AquaSmart 2024. جميع الحقوق محفوظة.", "© 2024 AquaSmart. All rights reserved.")}</p>
                    </form>
                </div>
            </div>
        </PageTransition>
    );
}
