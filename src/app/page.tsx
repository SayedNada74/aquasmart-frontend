"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Waves, Shield, BarChart3, Sparkles, ChevronLeft, CheckCircle2, Play, Cpu, Bell, TrendingUp, Store, FlaskConical, Thermometer, Droplets, Wind } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PageTransition } from "@/components/motion/PageTransition";
import { HeroOcean } from "@/components/hero/HeroOcean";
import { AnimatedContent } from "@/components/animations/AnimatedContent";
import { WhyEgyptSection } from "@/components/landing/WhyEgyptSection";
import { useApp } from "@/lib/AppContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ContactModal } from "@/components/ui/ContactModal";

export default function LandingPage() {
    const { t, lang } = useApp();
    const { user } = useAuth();
    const router = useRouter();
    const [isContactOpen, setIsContactOpen] = useState(false);

    const handleDashboardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (user) {
            router.push("/dashboard");
        } else {
            router.push("/login?redirect=/dashboard");
        }
    };

    const handleStartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push("/login?redirect=/dashboard");
    };

    const handlePresentationClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const featuresSection = document.getElementById("features");
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    const revenueData = [
        { m: t("يناير", "Jan"), val: 45 },
        { m: t("فبراير", "Feb"), val: 52 },
        { m: t("مارس", "Mar"), val: 48 },
        { m: t("أبريل", "Apr"), val: 60 },
        { m: t("مايو", "May"), val: 55 },
    ];

    return (
        <PageTransition>
            <div className="min-h-screen text-[var(--color-text-primary)] bg-[var(--color-bg-base)]" dir={lang === "ar" ? "rtl" : "ltr"}>
                {/* ===== NAV ===== */}
                <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="AquaSmart" className="w-16 h-16 rounded-2xl shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        <span className="text-2xl font-bold shadow-sm">AquaSmart</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm text-[var(--color-text-secondary)]">
                        <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">{t("المميزات", "Features")}</a>
                        <a href="#ai" className="hover:text-[var(--color-text-primary)] transition-colors">{t("الذكاء الاصطناعي", "AI")}</a>
                        <a href="#market" className="hover:text-[var(--color-text-primary)] transition-colors">{t("السوق", "Market")}</a>
                        <button onClick={() => setIsContactOpen(true)} className="hover:text-[var(--color-text-primary)] transition-colors">{t("تواصل", "Contact")}</button>
                    </div>
                    <button onClick={handleDashboardClick} className="btn-primary px-5 py-2 text-sm">{t("لوحة التحكم", "Dashboard")}</button>
                </nav>

                {/* ===== HERO ===== */}
                <HeroOcean
                    onStartClick={handleStartClick}
                    onDashboardClick={handleDashboardClick}
                    onPresentationClick={handlePresentationClick}
                />

                {/* ===== STATS ===== */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
                        {[
                            { icon: <FlaskConical className="w-8 h-8 mx-auto mb-3 text-[#3b82f6]" />, label: t("قوة الهيدروجين (PH)", "Power of hydrogen (PH)") },
                            { icon: <Thermometer className="w-8 h-8 mx-auto mb-3 text-[#f59e0b]" />, label: t("درجة الحرارة (°)", "Temperature (°)") },
                            { icon: <Droplets className="w-8 h-8 mx-auto mb-3 text-[#14b8a6]" />, label: t("الأكسجين المذاب (DO)", "Dissolved Oxygen (DO)") },
                            { icon: <Wind className="w-8 h-8 mx-auto mb-3 text-[#ef4444]" />, label: t("الأمونيا (NH3)", "Ammonia (NH3)") },
                        ].map((s, i) => (
                            <AnimatedContent key={i} delayMs={i * 120} className="h-full">
                                <div className="p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-cyan)]/30 transition-colors h-full flex flex-col justify-center items-center">
                                    {s.icon}
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-1">{s.label}</p>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </section>

                {/* ===== FEATURES (المميزات) ===== */}
                <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                    <div className="text-center mb-14">
                        <AnimatedContent delayMs={120}>
                            <p className="text-sm text-[var(--color-cyan-dark)] font-semibold mb-2">{t("المميزات", "Features")}</p>
                        </AnimatedContent>
                        <AnimatedContent delayMs={220}>
                            <h2 className="text-3xl font-bold">{t("تحكم كامل، ذكاء مطلق", "Total Control, Absolute Intelligence")}</h2>
                        </AnimatedContent>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <Waves className="w-7 h-7" />, title: t("مراقبة لحظية من بعيد", "Real-time Remote Monitoring"), desc: t("تابع حالة جميع أحواضك في الوقت الحقيقي عبر مستشعرات متقدمة، مع إمكانية التحكم عن بُعد.", "Track all your ponds in real-time via advanced sensors, with remote control capabilities.") },
                            { icon: <Cpu className="w-7 h-7" />, title: t("ذكاء اصطناعي متطور", "Advanced AI"), desc: t("نماذج AI مدرّبة على بيانات الاستزراع السمكي لتحليل القراءات وتشخيص الأمراض وتوقع المشكلات.", "AI models trained on aquaculture data to analyze readings, diagnose diseases, and predict issues.") },
                            { icon: <Bell className="w-7 h-7" />, title: t("تنبيهات فورية ذكية", "Smart Instant Alerts"), desc: t("إشعارات ذكية فورية عند حدوث أي خلل في معايير المياه، قبل أن تتفاقم المشكلة.", "Instant smart notifications upon any anomaly in water parameters, before problems escalate.") },
                            { icon: <BarChart3 className="w-7 h-7" />, title: t("تقارير وتحليلات شاملة", "Comprehensive Reports & Analytics"), desc: t("رسوم بيانية وتقارير PDF مفصلة لتتبع أداء مزرعتك، مع توصيات AI لتحسين الإنتاج.", "Detailed charts and PDF reports to track your farm's performance, with AI recommendations.") },
                        ].map((f, i) => (
                            <AnimatedContent key={i} delayMs={i * 140} className="h-full">
                                <div className="card p-6 text-center group h-full">
                                    <div className="w-14 h-14 rounded-xl bg-[var(--color-cyan-glow)] text-[var(--color-cyan-dark)] flex items-center justify-center mx-auto mb-4 transition-colors">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-base font-bold mb-2">{f.title}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </section>

                {/* ===== AI SECTION (AquaAI) ===== */}
                <section id="ai" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Chat Preview */}
                        <div className="order-2 lg:order-1">
                            <div className="card p-6 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] flex items-center justify-center shadow-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{t("AquaAI مساعدك الذكي", "AquaAI Your Smart Assistant")}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{t("متاح 24/7", "Available 24/7")}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-[var(--color-cyan)] text-white font-medium rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] mr-auto shadow-sm">{t("كيف حال الحوض رقم ٣؟", "How is Pond 3 doing?")}</div>
                                    <div className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[var(--color-text-primary)] max-w-[85%]">
                                        {t("الحوض رقم 3 في حالة جيدة ✅", "Pond 3 is in good condition ✅")}
                                        <br />{t("الأكسجين المذاب (DO) 6.5 mg/L (مثالي)، درجة الحرارة (°) 28، قوة الهيدروجين (PH) 7.2.", "Dissolved Oxygen (DO) 6.5 mg/L (Ideal), Temperature (°) 28, Power of hydrogen (PH) 7.2.")}
                                        <br /><span className="text-[var(--color-warning)] font-semibold">{t("💡 أنصح", "💡 I recommend")}</span> {t("بتشغيل البدالة خلال ساعات الظهيرة.", "running the aerator during noon hours.")}
                                    </div>
                                    <div className="bg-[var(--color-cyan)] text-white font-medium rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%] mr-auto shadow-sm">{t("السمكة دي عندها مشكلة؟ 📸", "Does this fish have a problem? 📸")}</div>
                                    <div className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[var(--color-text-primary)] max-w-[85%]">
                                        {t("بعد تحليل الصورة:", "After analyzing the image:")} <span className="text-[var(--color-danger)] font-bold">{t("⚠️ مرض البقع البيضاء (Ich)", "⚠️ White Spot Disease (Ich)")}</span>
                                        <br />{t("العلاج: رفع درجة الحرارة (°) + ملح 3 جم/لتر.", "Treatment: Raise Temperature (°) + 3g/L salt.")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="order-1 lg:order-2 text-start">
                            <p className="text-sm text-[var(--color-cyan-dark)] font-semibold mb-2">{t("الذكاء الاصطناعي", "Artificial Intelligence")}</p>
                            <h2 className="text-3xl font-bold mb-4">
                                {t("مساعدك الذكي", "Your Smart Assistant")} <span className="text-[var(--color-cyan-dark)]">AquaAI</span>
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                                {t("مدعوم بنموذج", "Powered by")} <span className="text-[var(--color-text-primary)] font-semibold">Google Gemini</span> {t("المتقدم. اسأله عن حالة أي حوض، أرسل له صورة لسمكة مريضة للتشخيص الفوري، أو اطلب منه توصيات لتحسين الإنتاج وتقليل الخسائر.", "Advanced model. Ask about any pond's status, send an image for fast diagnosis, or get recommendations.")}
                            </p>
                            <ul className="space-y-3">
                                {[
                                    t("مراقبة ذكية بالبيانات الحية من المستشعرات", "Smart monitoring with live sensor data"),
                                    t("تشخيص أمراض الأسماك بالصور فوراً", "Instant fish disease diagnosis via images"),
                                    t("حلول عملية فورية مبنية على بيانات حقيقية", "Instant practical solutions based on real data"),
                                    t("تقارير AI تلقائية عن حالة المزرعة", "Automated AI reports on farm status"),
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] justify-start">
                                        <CheckCircle2 className="w-4 h-4 text-[var(--color-cyan-dark)] flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ===== MARKET / VALUE ===== */}
                <section id="market" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                    <div className="text-center mb-14">
                        <p className="text-sm text-[var(--color-cyan-dark)] font-semibold mb-2">{t("القيمة", "Value")}</p>
                        <h2 className="text-3xl font-bold">{t("قيمة مضافة لاستثمارك", "Added Value for Your Investment")}</h2>
                        <p className="text-[var(--color-text-secondary)] mt-3 max-w-xl mx-auto">{t("زد من أرباحك وقلّل الخسائر مع تقارير الكفاءة الاقتصادية والمحاكاة المالية.", "Increase your profits and reduce losses with economic efficiency reports and financial simulations.")}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                        {/* Chart */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex gap-3">
                                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-center shadow-sm">
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{t("هذا الأسبوع", "This Week")}</p>
                                        <p className="text-xs font-bold text-[var(--color-warning)]">↓ 12%</p>
                                    </div>
                                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-center shadow-sm">
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{t("هذا الشهر", "This Month")}</p>
                                        <p className="text-xs font-bold text-[var(--color-success)]">↑ 24%</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[var(--color-text-secondary)]">{t("القيمة الإجمالية", "Total Value")}</p>
                                    <p className="text-2xl font-bold">1,250,000 <span className="text-sm text-[var(--color-text-muted)]">{t("ج.م", "EGP")}</span></p>
                                </div>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <XAxis dataKey="m" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text-primary)", borderRadius: "8px", fontSize: "12px" }} />
                                        <Bar dataKey="val" fill="var(--color-teal)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Market Cards */}
                        <div className="space-y-4">
                            <div className="card p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <Store className="w-6 h-6 text-[var(--color-cyan-dark)]" />
                                    <h3 className="text-base font-bold">{t("متابعة سوق السمك", "Fish Market Tracking")}</h3>
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {t("تابع أسعار السوق لحظة بلحظة واحصل على تنبيهات ذكية لأفضل وقت للبيع. محاكاة مالية لتقدير الأرباح قبل الحصاد.", "Track market prices live and get smart alerts for the best time to sell. Financial simulation to estimate profits before harvest.")}
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: "92%", label: t("معدل النجاح", "Success Rate") },
                                    { value: "3x", label: t("عائد الاستثمار", "ROI") },
                                    { value: "40%", label: t("تقليل الخسائر", "Loss Reduction") },
                                ].map((v, i) => (
                                    <div key={i} className="card p-4 text-center">
                                        <p className="text-2xl font-bold text-[var(--color-cyan-dark)]">{v.value}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{v.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== WHO WE ARE ===== */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                    <div className="card p-8 md:p-12 border-[var(--color-cyan)]/20 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[var(--color-cyan-glow)] to-transparent opacity-20 pointer-events-none" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
                            <div className="text-start">
                                <p className="text-sm text-[var(--color-cyan-dark)] font-semibold mb-2">{t("من نحن؟", "Who Are We?")}</p>
                                <h2 className="text-2xl font-bold mb-4">{t("نعالج مشكلة حقيقية", "We Solve a Real Problem")}</h2>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                                    {t("الثروة السمكية في مصر تواجه تحديات كبيرة بسبب", "Fish farming faces huge challenges due to")} <span className="text-[var(--color-text-primary)] font-semibold">{t("غياب الرقابة والمتابعة", "lack of monitoring and oversight")}</span>. {t("آلاف الأطنان تُفقد سنوياً بسبب مشاكل في جودة المياه وأمراض الأسماك التي يتم اكتشافها متأخراً.", "Thousands of tons are lost annually due to poor water quality and delayed disease detection.")}
                                </p>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    <span className="text-[var(--color-cyan-dark)] font-semibold">AquaSmart AI</span> {t("يحل هذه المشكلة بتوفير نظام مراقبة ذكي شامل يتيح لأصحاب المزارع متابعة أحواض السمك لحظة بلحظة عبر الموبايل أو الويبسايت، مع تنبيهات فورية وتحليلات بالذكاء الاصطناعي.", "solves this by providing a comprehensive smart monitoring system allowing farm owners to track ponds in real-time via mobile or web, with instant alerts and AI analytics.")}
                                </p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { emoji: "📡", text: t("مستشعرات حية ترسل البيانات كل ثانية", "Live sensors transmitting data every second") },
                                    { emoji: "🧠", text: t("نموذج AI يحلل ويتوقع المشاكل قبل حدوثها", "AI model predicting problems before they occur") },
                                    { emoji: "📱", text: t("لوحة تحكم متكاملة عبر الويب والموبايل", "Comprehensive web and mobile dashboard") },
                                    { emoji: "💰", text: t("محاكاة مالية وبورصة أسعار السمك", "Financial simulation and fish market prices") },
                                    { emoji: "🔔", text: t("تنبيهات فورية عند أي خطر", "Instant alerts for any risk") },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg p-3 shadow-sm">
                                        <span className="text-xl">{item.emoji}</span>
                                        <p className="text-sm text-[var(--color-text-primary)] font-medium">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <WhyEgyptSection />

                {/* ===== CTA ===== */}
                <section id="contact" className="max-w-4xl mx-auto px-6 md:px-12 py-20">
                    <div className="card p-10 text-center border-[var(--color-cyan)]/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[var(--color-cyan-glow)] to-transparent opacity-30 pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("جاهز لمضاعفة إنتاجك؟", "Ready to double your production?")}</h2>
                            <p className="text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto">{t("ابدأ الآن واكتشف كيف يمكن لـ AquaSmart AI تحويل مزرعتك إلى مزرعة ذكية بالكامل.", "Start now and discover how AquaSmart AI can transform your farm into a fully smart farm.")}</p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <button onClick={handleStartClick} className="btn-primary px-10 py-3.5 text-base inline-flex items-center gap-2 shadow-lg shadow-[var(--color-cyan-glow)]">
                                    {t("ابدأ تجربتك", "Start your experience")}
                                    <ChevronLeft className={`w-5 h-5 ${lang === "en" ? "rotate-180" : ""}`} />
                                </button>
                                <button onClick={handleDashboardClick} className="btn-secondary px-8 py-3.5 text-base shadow-sm">
                                    {t("تصفح لوحة التحكم", "Browse Dashboard")}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== FOOTER ===== */}
                <footer className="border-t border-[var(--color-border)] py-8 mt-10">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between text-sm text-[var(--color-text-muted)] flex-row-reverse md:flex-row gap-6">
                        <div className="flex gap-6">
                            <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">{t("المميزات", "Features")}</a>
                            <a href="#ai" className="hover:text-[var(--color-text-primary)] transition-colors">{t("الذكاء الاصطناعي", "AI")}</a>
                            <button onClick={() => setIsContactOpen(true)} className="hover:text-[var(--color-text-primary)] transition-colors">{t("تواصل", "Contact")}</button>
                        </div>
                        <p className="whitespace-nowrap">
                            {t("© 2024-2025 نظام AquaSmart AI. جميع الحقوق محفوظة.", "© 2024-2025 AquaSmart AI System. All rights reserved.")}
                        </p>
                    </div>
                </footer>

                <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
            </div>
        </PageTransition>
    );
}
