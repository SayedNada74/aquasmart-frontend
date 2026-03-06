"use client";

import { BarChart3, Download, Sparkles, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useApp } from "@/lib/AppContext";
import { useState } from "react";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { PageTransition } from "@/components/motion/PageTransition";

export default function ReportsPage() {
    const { t } = useApp();
    const [exporting, setExporting] = useState(false);
    const [exportDone, setExportDone] = useState(false);

    const fishGrowth = [
        { name: t("الأسبوع 1", "Week 1"), value: 65 },
        { name: t("الأسبوع 2", "Week 2"), value: 55 },
        { name: t("الأسبوع 3", "Week 3"), value: 48 },
        { name: t("الأسبوع 4", "Week 4"), value: 72 },
    ];

    const waterTrend = [
        { name: t("يناير", "Jan"), pH: 7.2, DO: 6.5 },
        { name: t("فبراير", "Feb"), pH: 7.4, DO: 6.8 },
        { name: t("مارس", "Mar"), pH: 7.1, DO: 5.9 },
        { name: t("أبريل", "Apr"), pH: 7.3, DO: 7.0 },
        { name: t("مايو", "May"), pH: 7.5, DO: 6.2 },
    ];

    const pondPerformance = [
        { id: t("حوض رقم 01", "Pond #01"), health: "98/100", feed: t("45 كجم/يوم", "45 kg/day"), growth: "1.2%", status: t("مستقر", "Stable"), statusType: "safe" },
        { id: t("حوض رقم 02", "Pond #02"), health: "85/100", feed: t("38 كجم/يوم", "38 kg/day"), growth: "0.9%", status: t("مراقبة", "Monitoring"), statusType: "warning" },
        { id: t("حوض رقم 03", "Pond #03"), health: "92/100", feed: t("52 كجم/يوم", "52 kg/day"), growth: "1.5%", status: t("نمو سريع", "Fast Growth"), statusType: "info" },
    ];

    const tooltipStyle = { backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text-primary)", borderRadius: "8px", fontSize: "12px" };

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const { generatePondPDF } = await import("@/lib/generatePDF");
            const snap = await get(ref(database, "ponds"));
            if (snap.exists()) {
                const data = snap.val();
                const ponds = Object.keys(data);
                for (const pondId of ponds) {
                    const p = data[pondId];
                    let hist: any[] = [];
                    if (p.history?.readings) {
                        hist = Object.values(p.history.readings)
                            .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())
                            .slice(-20) as any[];
                    }
                    generatePondPDF({
                        pondId,
                        pondName: pondId.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
                        current: p.current || { Temperature: 0, PH: 0, Ammonia: 0, DO: 0, timestamp: "" },
                        aiStatus: p.ai_result?.current?.Status || "Unknown",
                        aiReason: p.ai_result?.current?.Reason || "",
                        aiConfidence: p.ai_result?.current?.AI_Confidence || "",
                        history: hist,
                    });
                }
            }
            setExportDone(true);
            setTimeout(() => setExportDone(false), 3000);
        } catch (err) {
            console.error("PDF export error:", err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <PageTransition>
            <div className="space-y-6 pb-8">
                {exportDone && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#10b981] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                        ✅ {t("تم تصدير التقارير بنجاح!", "Reports exported successfully!")}
                    </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3">
                    <button onClick={handleExportPDF} disabled={exporting} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? t("جاري التصدير...", "Exporting...") : t("تصدير التقرير PDF", "Export PDF Report")}
                    </button>
                    <div className="flex gap-2">
                        <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] border border-[var(--color-cyan)]/30">{t("شهري", "Monthly")}</button>
                        <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">{t("أسبوعي", "Weekly")}</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: t("إجمالي الإنتاج", "Total Production"), val: "1,250", unit: t("كجم", "kg"), change: "↑ 12%" },
                        { label: t("كفاءة التغذية (FCR)", "Feed Efficiency (FCR)"), val: "1.2", unit: "", change: "↓ 5%" },
                        { label: t("جودة المياه", "Water Quality"), val: "92%", unit: "", change: t("● ممتاز", "● Excellent") },
                        { label: t("التنبيهات النشطة", "Active Alerts"), val: "14", unit: "", change: t("▲ تنبيه", "▲ Alert") },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="flex-1">
                                <p className="text-xs text-[var(--color-text-secondary)]">{s.label}</p>
                                <p className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">{s.val} <span className="text-sm text-[var(--color-text-muted)]">{s.unit}</span></p>
                                <p className="text-[10px] text-[#10b981]">{s.change}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Insight */}
                <div className="card bg-gradient-to-l from-[var(--color-cyan)]/10 to-transparent border border-[var(--color-cyan)]/20 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-cyan)]/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-[var(--color-cyan)]" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-[var(--color-cyan)] mb-1">{t("رؤى الذكاء الاصطناعي", "AI Insight")}</h4>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                {t(
                                    "أداء المزرعة هذا الشهر ممتاز. نلاحظ تحسّناً ملحوظاً في معدل التحويل الغذائي (FCR) بنسبة 5%. جودة المياه مستقرة.",
                                    "Farm performance this month is excellent. Notable 5% improvement in FCR. Water quality stable."
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">{t("معدل نمو الأسماك", "Fish Growth Rate")}</h4>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fishGrowth}>
                                    <XAxis dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card">
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">{t("اتجاهات جودة المياه", "Water Quality Trends")}</h4>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={waterTrend}>
                                    <XAxis dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="pH" stroke="#10b981" strokeWidth={2} dot={false} name={t("قوة الهيدروجين (PH)", "Power of hydrogen (PH)")} />
                                    <Line type="monotone" dataKey="DO" stroke="#3b82f6" strokeWidth={2} dot={false} name={t("الأكسجين المذاب (DO)", "Dissolved Oxygen (DO)")} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card overflow-x-auto">
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">{t("أداء الأحواض", "Pond Performance")}</h4>
                    <table className="w-full text-sm min-w-[500px]">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium">{t("الحالة", "Status")}</th>
                                <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium">{t("النمو", "Growth")}</th>
                                <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium">{t("الغذاء", "Feed")}</th>
                                <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium">{t("الصحة", "Health")}</th>
                                <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium">{t("الحوض", "Pond")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pondPerformance.map((p, i) => (
                                <tr key={i} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-card-hover)]">
                                    <td className="py-3 px-4"><span className={`badge-${p.statusType === "safe" ? "safe" : "warning"}`}>{p.status}</span></td>
                                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{p.growth}</td>
                                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{p.feed}</td>
                                    <td className="py-3 px-4 text-[var(--color-text-primary)] font-semibold">{p.health}</td>
                                    <td className="py-3 px-4 text-[var(--color-cyan)] font-semibold">{p.id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
}
