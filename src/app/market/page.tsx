"use client";

import { Store, RefreshCw, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMarketData } from "@/hooks/useMarketData";
import { generateSimulationReport, SimulationReport } from "@/lib/market/marketDataService";
import { MarketSimulationModal } from "@/components/market/MarketSimulationModal";
import { useSectionSearchFocus } from "@/hooks/useSectionSearchFocus";

export default function MarketPage() {
    const { t, lang } = useApp();
    const searchParams = useSearchParams();
    const { loading, data, refreshMarketData } = useMarketData();
    const [simModalOpen, setSimModalOpen] = useState(false);
    const [activeReport, setActiveReport] = useState<SimulationReport | null>(null);
    const { highlightedSection, registerSectionRef, getSectionHighlightClass } = useSectionSearchFocus(searchParams, ["prices", "refresh", "guide", "harvest"]);

    const isRtl = lang === "ar";

    const relativeUpdateTime = useMemo(() => {
        if (!data?.timestamp) return "";
        const diff = Math.floor((new Date().getTime() - new Date(data.timestamp).getTime()) / 60000);
        if (diff < 1) return t("الآن", "Just now");
        return t(`منذ ${diff} دقيقة`, `${diff} min ago`);
    }, [data?.timestamp, t]);

    const handleViewReport = (pond: any) => {
        if (!data) return;
        // Find tilapia price for pond 4 simulation as an example
        const tilapiaPrice = data.prices.find(p => p.id === "tilapia")?.price || 85;
        const report = generateSimulationReport(pond, tilapiaPrice);
        setActiveReport(report);
        setSimModalOpen(true);
    };

    const tooltipStyle = { backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text-primary)", borderRadius: "8px", fontSize: "12px" };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-[var(--color-cyan)] animate-spin" />
                <p className="text-sm text-[var(--color-text-secondary)]">{t("جاري تحميل بيانات السوق...", "Loading market data...")}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <PageTransition>
            <div className="space-y-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            label: t("القيمة الإجمالية للمزرعة", "Total Farm Value"),
                            val: Math.round(data.summary.totalFarmValue).toLocaleString(),
                            unit: t("ج.م", "EGP"),
                            change: t(`↑ ${data.summary.totalFarmValueChange.toFixed(2)}٪ منذ الشهر الماضي`, `↑ ${data.summary.totalFarmValueChange.toFixed(2)}% since last month`),
                            accent: true
                        },
                        {
                            label: t("العائد على الاستثمار المتوقع", "Expected ROI"),
                            val: data.summary.expectedROI.toFixed(1),
                            unit: "%",
                            change: t(`↑ +${data.summary.roiImprovement.toFixed(1)}٪ تحسن في الكفاءة`, `↑ +${data.summary.roiImprovement.toFixed(1)}% efficiency improvement`)
                        },
                        {
                            label: t("هامش الربح الحالي", "Current Profit Margin"),
                            val: data.summary.profitMargin.toFixed(1),
                            unit: "%",
                            change: t(`↓ ${data.summary.profitMarginReduction.toFixed(1)}٪ خفض في تكاليف العلف`, `↓ ${data.summary.profitMarginReduction.toFixed(1)}% feed cost reduction`)
                        },
                    ].map((s, i) => (
                        <div key={i} className={`stat-card ${s.accent ? "border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5" : ""}`}>
                            <div className="flex-1">
                                <p className="text-xs text-[var(--color-text-secondary)]">{s.label}</p>
                                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{s.val} <span className="text-sm text-[var(--color-text-muted)]">{s.unit}</span></p>
                                <p className="text-[10px] text-[#10b981]">{s.change}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Market Prices */}
                <div ref={registerSectionRef("prices")} className={getSectionHighlightClass("prices")}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] text-[var(--color-text-muted)]">{t(`آخر تحديث: ${relativeUpdateTime}`, `Last update: ${relativeUpdateTime}`)}</p>
                        <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Store className="w-5 h-5 text-[var(--color-cyan)]" />
                            {t("أسعار السوق المباشرة", "Live Market Prices")}
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.prices.map((f, i) => (
                            <div key={i} className="card group hover:border-[var(--color-cyan)]/40 transition-all duration-300">
                                <div className="h-28 bg-[var(--color-bg-input)] rounded-lg mb-3 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">{f.image}</div>
                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{isRtl ? f.nameAr : f.nameEn}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-[10px] font-bold ${f.change >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                                        {f.change >= 0 ? '+' : ''}{f.change.toFixed(1)}%
                                    </span>
                                    <p className="text-lg font-bold text-[var(--color-cyan)]">
                                        {Math.round(f.price)} <span className="text-xs text-[var(--color-text-muted)]">{t("ج.م / كجم", "EGP/kg")}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div ref={registerSectionRef("harvest")} className={`card ${highlightedSection === "guide" ? getSectionHighlightClass("guide") : getSectionHighlightClass("harvest")}`}>
                        <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">{t("تخطيط الحصاد الذكي", "Smart Harvest Planning")}</h4>
                        <div className="space-y-4">
                            {data.harvestPlan.map((h, i) => (
                                <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] hover:border-[var(--color-cyan)]/20 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${h.statusColor} font-bold`}>
                                            {isRtl ? h.statusAr : h.statusEn}
                                        </span>
                                        <h5 className="text-sm font-bold text-[var(--color-text-primary)]">{isRtl ? h.pondNameAr : h.pondNameEn} - {isRtl ? h.fishTypeAr : h.fishTypeEn}</h5>
                                    </div>
                                    <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                                        <p>{isRtl ? h.pondNameAr === "حوض رقم ٤" ? `٩٣ ج.م / كجم (خلال ١٠ أيام)` : "سبتمبر ٢٠٢٤" : h.pondNameEn === "Pond #4" ? "93 EGP/kg (in 10 days)" : "September 2024"}</p>
                                        <p>{t("الوزن الحالي", "Current Weight")}: <span className="text-[var(--color-text-primary)] font-medium">{h.currentWeight}</span></p>
                                    </div>
                                    {i === 0 && (
                                        <button
                                            onClick={() => handleViewReport(h)}
                                            className="btn-primary w-full mt-3 text-xs py-2 shadow-lg shadow-[var(--color-cyan)]/10"
                                        >
                                            {t("عرض تقرير المحاكاة", "View Simulation Report")}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">{t("تحليل الربحية", "Profitability Analysis")}</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.profitHistory}>
                                    <XAxis dataKey={isRtl ? "monthAr" : "monthEn"} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-cyan)', opacity: 0.05 }} />
                                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                                    <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} name={t("الإيرادات", "Revenue")} barSize={20} />
                                    <Bar dataKey="cost" fill="var(--color-text-muted)" radius={[4, 4, 0, 0]} name={t("التكاليف", "Costs")} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div ref={registerSectionRef("refresh")} className={`flex justify-start ${getSectionHighlightClass("refresh")} rounded-xl`}>
                    <button
                        onClick={refreshMarketData}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-xl shadow-[var(--color-cyan)]/10 active:scale-95 transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {loading ? t("جاري التحديث...", "Updating...") : t("تحديث البيانات", "Refresh Data")}
                    </button>
                </div>
            </div>

            <MarketSimulationModal
                isOpen={simModalOpen}
                onClose={() => setSimModalOpen(false)}
                report={activeReport}
            />
        </PageTransition>
    );
}
