"use client";

import { useApp } from "@/lib/AppContext";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { SiteBackground } from "@/components/backgrounds/SiteBackground";

export default function TermsPage() {
    const { t, dir, lang } = useApp();

    return (
        <div className="min-h-screen relative" dir={dir}>
            <SiteBackground />
            <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-cyan-dark)] hover:underline mb-8">
                    <ArrowRight className={`w-4 h-4 ${lang === "en" ? "rotate-180" : ""}`} />
                    {t("العودة للرئيسية", "Back to Home")}
                </Link>

                <div className="card p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-8 h-8 text-[var(--color-cyan-dark)]" />
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                            {t("شروط الاستخدام", "Terms of Service")}
                        </h1>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-8">
                        {t("آخر تحديث: مارس 2026", "Last updated: March 2026")}
                    </p>

                    <div className="space-y-8 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("1. مقدمة", "1. Introduction")}
                            </h2>
                            <p>{t(
                                "مرحبًا بك في منصة AquaSmart AI. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بهذه الشروط. AquaSmart AI هي منصة ذكية لإدارة ومراقبة مزارع الأحياء المائية باستخدام تقنيات الذكاء الاصطناعي وإنترنت الأشياء.",
                                "Welcome to AquaSmart AI. By using this platform, you agree to comply with these terms. AquaSmart AI is a smart platform for managing and monitoring aquaculture farms using AI and IoT technologies."
                            )}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("2. استخدام الخدمة", "2. Use of Service")}
                            </h2>
                            <p>{t(
                                "يجب أن تكون الحد الأدنى للعمر 18 عامًا لاستخدام هذه الخدمة. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور. يُحظر استخدام الخدمة لأي غرض غير مشروع أو ضار.",
                                "You must be at least 18 years old to use this service. You are responsible for maintaining the confidentiality of your account and password. Using the service for any unlawful or harmful purpose is prohibited."
                            )}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("3. البيانات والخصوصية", "3. Data & Privacy")}
                            </h2>
                            <p>{t(
                                "نحن نجمع البيانات اللازمة لتشغيل الخدمة بما في ذلك بيانات المستشعرات وبيانات الحساب. لمزيد من التفاصيل، يرجى مراجعة سياسة الخصوصية الخاصة بنا.",
                                "We collect data necessary to operate the service, including sensor data and account information. For more details, please review our Privacy Policy."
                            )}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("4. حدود المسؤولية", "4. Limitation of Liability")}
                            </h2>
                            <p>{t(
                                "يتم توفير الخدمة \"كما هي\" بدون ضمانات من أي نوع. لا تتحمل AquaSmart AI المسؤولية عن أي خسائر ناتجة عن استخدام البيانات أو التوصيات المقدمة من النظام. القرارات النهائية المتعلقة بالمزرعة هي مسؤولية المستخدم.",
                                "The service is provided \"as is\" without warranties of any kind. AquaSmart AI is not liable for any losses resulting from the use of data or recommendations provided by the system. Final farm-related decisions are the user's responsibility."
                            )}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("5. التواصل", "5. Contact")}
                            </h2>
                            <p>{t(
                                "للاستفسارات أو الشكاوى، يمكنك التواصل معنا عبر البريد الإلكتروني: aquasmartaisystem@gmail.com",
                                "For inquiries or complaints, contact us at: aquasmartaisystem@gmail.com"
                            )}</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
