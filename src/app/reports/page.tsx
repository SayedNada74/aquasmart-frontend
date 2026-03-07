"use client";

import { BarChart3, Download, Sparkles, Loader2, AlertTriangle, TrendingUp, Droplets, Waves } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useApp } from "@/lib/AppContext";
import { useState } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { useReportsData, ReportPeriod } from "@/hooks/useReportsData";
import { generateFarmPDF } from "@/lib/generateFarmPDF";

export default function ReportsPage() {
    const { t, lang } = useApp();
    const [period, setPeriod] = useState<ReportPeriod>("monthly");
    const [exporting, setExporting] = useState(false);
    const [exportDone, setExportDone] = useState(false);

    const data = useReportsData(period);

    const tooltipStyle = {
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-primary)",
        borderRadius: "12px",
        fontSize: "12px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    };

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const { database } = await import("@/lib/firebase");
            const { ref, get } = await import("firebase/database");
            const { generatePondPDF } = await import("@/lib/generatePDF");

            const snap = await get(ref(database, "ponds"));
            if (snap.exists()) {
                const pondsData = snap.val();
                const pondIds = Object.keys(pondsData);

                for (const id of pondIds) {
                    const p = pondsData[id];
                    const hist = p.history?.readings ? Object.values(p.history.readings).sort((a: any, b: any) =>
                        new Date(a.time).getTime() - new Date(b.time).getTime()
                    ).slice(-12) as any[] : [];

                    generatePondPDF({
                        pondId: id,
                        pondName: id.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
                        current: p.current || { Temperature: 0, PH: 0, Ammonia: 0, DO: 0, timestamp: "" },
                        aiStatus: p.ai_result?.current?.Status || "Unknown",
                        aiReason: p.ai_result?.current?.Reason || "",
                        aiConfidence: p.ai_result?.current?.AI_Confidence || "",
                        history: hist
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

    if (data.loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-[var(--color-cyan)] animate-spin" />
                <p className="text-sm text-[var(--color-text-secondary)]">{t("جاري تحميل التقارير...", "Loading reports...")}</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6 pb-8">
                {exportDone && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#10b981] text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
                        <span className="text-lg">✅</span>
                        <span className="font-medium">{t("تم تصدير تقرير المزرعة بنجاح!", "Farm report exported successfully!")}</span>
                    </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex gap-2 bg-[var(--color-bg-card)] p-1 rounded-xl border border-[var(--color-border)] shadow-sm">
                        <button
                            onClick={() => setPeriod("monthly")}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${period === "monthly"
                                ? "bg-[var(--color-cyan-dark)] text-white shadow-md scale-[1.02]"
                                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                }`}
                        >
                            {t("شهري", "Monthly")}
                        </button>
                        <button
                            onClick={() => setPeriod("weekly")}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${period === "weekly"
                                ? "bg-[var(--color-cyan-dark)] text-white shadow-md scale-[1.02]"
                                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                }`}
                        >
                            {t("أسبوعي", "Weekly")}
                        </button>
                    </div>

                    <button
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-lg shadow-[var(--color-cyan-dark)]/10 disabled:opacity-60 transition-transform active:scale-95"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? t("جاري التصدير...", "Exporting...") : t("تصدير التقرير PDF", "Export PDF Report")}
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: t("إجمالي الإنتاج", "Total Production"), val: data.summaryStats.totalProduction, unit: t("كجم", "kg"), change: data.summaryStats.productionChange, icon: <Waves className="w-4 h-4" />, color: "text-[var(--color-cyan)]", bg: "bg-[var(--color-cyan)]/10" },
                        { label: t("كفاءة التغذية (FCR)", "Feed Efficiency (FCR)"), val: data.summaryStats.fcr, unit: "", change: data.summaryStats.fcrChange, icon: <TrendingUp className="w-4 h-4" />, color: "text-[var(--color-teal)]", bg: "bg-[var(--color-teal)]/10" },
                        { label: t("جودة المياه", "Water Quality"), val: data.summaryStats.waterQuality, unit: "", change: t("● ممتاز", "● Excellent"), icon: <Droplets className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: t("التنبيهات النشطة", "Active Alerts"), val: data.summaryStats.activeAlerts, unit: "", change: t("▲ تنبيه", "▲ Alert"), icon: <AlertTriangle className="w-4 h-4" />, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
                    ].map((s, i) => (
                        <div key={i} className="stat-card group hover:border-[var(--color-cyan)]/30 transition-all duration-300">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`p-1.5 rounded-lg ${s.bg} ${s.color}`}>{s.icon}</div>
                                    <p className="text-[10px] md:text-xs text-[var(--color-text-secondary)] font-medium">{s.label}</p>
                                </div>
                                <p className="text-xl md:text-2xl font-black text-[var(--color-text-primary)]">
                                    {s.val} <span className="text-xs text-[var(--color-text-muted)] font-normal">{s.unit}</span>
                                </p>
                                <p className={`text-[10px] font-bold mt-1 ${s.label === t("التنبيهات النشطة", "Active Alerts") ? "text-[#ef4444]" : "text-[#10b981]"}`}>
                                    {s.change}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Insight */}
                <div className="card relative overflow-hidden bg-gradient-to-l from-[var(--color-cyan)]/10 to-transparent border border-[var(--color-cyan)]/20 rounded-2xl p-6 shadow-sm group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-cyan)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-[var(--color-cyan)]/10 transition-all duration-700" />
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-cyan)]/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <Sparkles className="w-6 h-6 text-[var(--color-cyan)]" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-black text-[var(--color-cyan)] uppercase tracking-wider">{t("رؤى الذكاء الاصطناعي", "AI Insight")}</h4>
                                <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-cyan)]/30 to-transparent" />
                            </div>
                            <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed font-medium">
                                {data.aiInsight}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-[var(--color-cyan)]" />
                                {t("معدل نمو الأسماك", "Fish Growth Rate")}
                            </h4>
                        </div>
                        <div className="h-60 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.fishGrowth}>
                                    <XAxis dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-cyan)", opacity: 0.05 }} />
                                    <Bar dataKey="value" fill="url(#colorGrowth)" radius={[6, 6, 0, 0]} barSize={32} />
                                    <defs>
                                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-cyan)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-teal)" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-blue-500" />
                                {t("اتجاها جودة المياه", "Water Quality Trends")}
                            </h4>
                        </div>
                        <div className="h-60 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.waterTrend}>
                                    <XAxis dataKey="name" tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="pH" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "var(--color-bg-card)" }} name={t("قوة الهيدروجين (PH)", "Power of hydrogen (PH)")} />
                                    <Line type="monotone" dataKey="DO" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "var(--color-bg-card)" }} name={t("الأكسجين المذاب (DO)", "Dissolved Oxygen (DO)")} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between p-2 mb-2">
                        <h4 className="text-sm font-black text-[var(--color-text-primary)] flex items-center gap-2">
                            <Waves className="w-4 h-4 text-[var(--color-teal)]" />
                            {t("أداء الأحواض الفردي", "Individual Pond Performance")}
                        </h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-input)]/30">
                                    <th className={`py-4 px-6 text-[var(--color-text-secondary)] font-bold uppercase tracking-wider text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("الحالة", "Status")}</th>
                                    <th className={`py-4 px-6 text-[var(--color-text-secondary)] font-bold uppercase tracking-wider text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("النمو", "Growth")}</th>
                                    <th className={`py-4 px-6 text-[var(--color-text-secondary)] font-bold uppercase tracking-wider text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("الغذاء", "Feed")}</th>
                                    <th className={`py-4 px-6 text-[var(--color-text-secondary)] font-bold uppercase tracking-wider text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("الصحة", "Health")}</th>
                                    <th className={`py-4 px-6 text-[var(--color-text-secondary)] font-bold uppercase tracking-wider text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t("الحوض", "Pond")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]/50">
                                {data.pondPerformance.map((p, i) => (
                                    <tr key={i} className="hover:bg-[var(--color-bg-input)]/20 transition-colors group">
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.statusType === "safe"
                                                ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20"
                                                : "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20"
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-[var(--color-text-secondary)] font-medium group-hover:text-[var(--color-text-primary)] transition-colors">{p.growth}</td>
                                        <td className="py-4 px-6 text-[var(--color-text-secondary)] font-medium group-hover:text-[var(--color-text-primary)] transition-colors">{p.feed}</td>
                                        <td className="py-4 px-6 text-[var(--color-text-primary)] font-black text-base">{p.health}</td>
                                        <td className="py-4 px-6 text-[var(--color-cyan-dark)] font-black text-base drop-shadow-sm">{p.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
