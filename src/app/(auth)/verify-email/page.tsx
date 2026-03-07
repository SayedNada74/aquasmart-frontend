"use client";

import { Mail, RefreshCw, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { auth } from "@/lib/firebase";
import { sendEmailVerification, signOut } from "firebase/auth";
import { getArabicAuthError } from "@/lib/auth/firebaseAuthErrors";
import { useApp } from "@/lib/AppContext";
import Link from "next/link";

export default function VerifyEmailPage() {
    const { user, isVerified, refreshUser, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { t } = useApp();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
        if (!authLoading && isVerified) {
            router.replace("/landing");
        }
    }, [user, isVerified, authLoading, router]);

    const handleResend = async () => {
        if (!user) return;
        setLoading(true);
        setError("");
        setMessage("");
        try {
            await sendEmailVerification(user);
            setMessage(t("تم إرسال رابط التفعيل مرة أخرى بنجاح. يرجى مراجعة بريدك.", "Verification link sent again successfully. Please check your email."));
        } catch (err: any) {
            setError(getArabicAuthError(err?.code || ""));
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await refreshUser();
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (authLoading || !user) return null;

    return (
        <div className="w-full card text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-[var(--color-cyan)]/10 text-[var(--color-cyan-dark)] rounded-full flex items-center justify-center mb-6">
                <Mail className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                {t("تأكيد البريد الإلكتروني", "Verify your email")}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                {t("لقد أرسلنا رابط تفعيل الحساب إلى:", "We sent an account verification link to:")}
                <br />
                <span className="font-bold text-[var(--color-text-primary)] block mt-2 text-base" dir="ltr">{user?.email}</span>
            </p>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)] text-center w-full">
                    ❌ {error}
                </div>
            )}
            {message && (
                <div className="mb-4 p-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-sm text-[var(--color-success)] text-center w-full">
                    ✅ {message}
                </div>
            )}

            <div className="p-4 rounded-xl bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 mb-8 w-full text-right">
                <p className="text-sm text-[var(--color-warning)] font-medium">
                    {t("يرجى النقر على الرابط لتفعيل حسابك قبل الاستمرار. إذا قمت بالتفعيل، انقر على تحديث الحالة.", "Please click the link to verify your account before continuing. If you verified, click Refresh Status.")}
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <button type="button" onClick={handleRefresh} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    {t("لقد قمت بالتأكيد / تحديث الحالة", "I verified / Refresh Status")}
                </button>
                <button type="button" onClick={handleResend} disabled={loading} className="w-full py-3 bg-transparent border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] flex items-center justify-center gap-2 hover:border-[var(--color-cyan-dark)] transition-colors">
                    {t("إرسال الرابط مرة أخرى", "Resend Link")}
                </button>
                <button type="button" onClick={handleLogout} disabled={loading} className="w-full py-3 text-sm text-[var(--color-danger)] flex items-center justify-center gap-2 hover:bg-[var(--color-danger)]/10 rounded-xl transition-colors mt-2">
                    <LogOut className="w-4 h-4" />
                    {t("تسجيل الخروج", "Sign Out")}
                </button>
            </div>
        </div>
    );
}
