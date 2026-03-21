"use client";

import { useApp } from "@/lib/AppContext";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { SiteBackground } from "@/components/backgrounds/SiteBackground";

export default function PrivacyPage() {
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
                        <Lock className="w-8 h-8 text-[var(--color-cyan-dark)]" />
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                            {t("سياسة الخصوصية", "Privacy Policy")}
                        </h1>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-8">
                        {t("آخر تحديث: مارس 2026", "Last updated: March 2026")}
                    </p>

                    <div className="space-y-8 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("1. البيانات التي نجمعها", "1. Data We Collect")}
                            </h2>
                            <ul className={`list-disc ${lang === "ar" ? "pr-6" : "pl-6"} space-y-2`}>
                                <li>{t("معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف", "Account info: name, email, phone number")}</li>
                                <li>{t("بيانات المزرعة: الموقع، عدد الأحواض، إعدادات المزرعة", "Farm data: location, pond count, farm settings")}</li>
                                <li>{t("بيانات المستشعرات: درجة الحرارة، الأكسجين، درجة الحموضة، وغيرها", "Sensor data: temperature, oxygen, pH, and other readings")}</li>
                                <li>{t("بيانات الاستخدام: سجل الدخول، تفاعلات المنصة", "Usage data: login history, platform interactions")}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("2. كيف نستخدم بياناتك", "2. How We Use Your Data")}
                            </h2>
                            <ul className={`list-disc ${lang === "ar" ? "pr-6" : "pl-6"} space-y-2`}>
                                <li>{t("تقديم خدمة المراقبة والتنبيهات الذكية", "Providing monitoring and smart alert services")}</li>
                                <li>{t("تحليل البيانات بالذكاء الاصطناعي لتحسين الإنتاجية", "AI data analysis to improve productivity")}</li>
                                <li>{t("إرسال إشعارات وتحديثات مهمة", "Sending important notifications and updates")}</li>
                                <li>{t("تحسين تجربة المستخدم وأداء المنصة", "Improving user experience and platform performance")}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("3. حماية البيانات", "3. Data Protection")}
                            </h2>
                            <p>{t(
                                "نستخدم تقنيات أمان متقدمة لحماية بياناتك بما في ذلك التشفير أثناء النقل والتخزين. نحن لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة لأغراض تسويقية.",
                                "We use advanced security technologies to protect your data, including encryption in transit and at rest. We do not sell or share your personal data with third parties for marketing purposes."
                            )}</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("4. حقوقك", "4. Your Rights")}
                            </h2>
                            <ul className={`list-disc ${lang === "ar" ? "pr-6" : "pl-6"} space-y-2`}>
                                <li>{t("الوصول إلى بياناتك الشخصية", "Access your personal data")}</li>
                                <li>{t("تعديل أو تحديث معلوماتك", "Modify or update your information")}</li>
                                <li>{t("حذف حسابك وبياناتك", "Delete your account and data")}</li>
                                <li>{t("الانسحاب من التواصل التسويقي", "Opt out of marketing communications")}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                                {t("5. التواصل", "5. Contact")}
                            </h2>
                            <p>{t(
                                "لأي استفسار حول سياسة الخصوصية، تواصل معنا على: aquasmartaisystem@gmail.com",
                                "For privacy-related inquiries, contact us at: aquasmartaisystem@gmail.com"
                            )}</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
