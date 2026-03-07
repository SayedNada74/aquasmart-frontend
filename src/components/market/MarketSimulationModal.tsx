"use client";

import { X, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { SimulationReport } from "@/lib/market/marketDataService";

interface MarketSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: SimulationReport | null;
}

export function MarketSimulationModal({ isOpen, onClose, report }: MarketSimulationModalProps) {
    const { t, lang } = useApp();

    if (!isOpen || !report) return null;

    const isRtl = lang === "ar";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 ${isRtl ? 'font-arabic' : ''}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-cyan)]/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-cyan)]/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-[var(--color-cyan)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[var(--color-text-primary)]">
                                {t("تقرير محاكاة السوق", "Market Simulation Report")}
                            </h3>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                {isRtl ? report.pondNameAr : report.pondNameEn}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-[var(--color-bg-input)] flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* Main Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-[var(--color-cyan)]" />
                                <span className="text-xs text-[var(--color-text-secondary)]">{t("القيمة المتوقعة", "Expected Value")}</span>
                            </div>
                            <p className="text-xl font-bold text-[var(--color-text-primary)]">
                                {report.expectedHarvestValue.toLocaleString()} <span className="text-xs text-[var(--color-text-muted)]">{t("ج.م", "EGP")}</span>
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-[#10b981]" />
                                <span className="text-xs text-[var(--color-text-secondary)]">{t("الربح الصافي", "Net Profit")}</span>
                            </div>
                            <p className="text-xl font-bold text-[#10b981]">
                                {report.expectedProfit.toLocaleString()} <span className="text-xs text-[var(--color-text-muted)]">{t("ج.م", "EGP")}</span>
                            </p>
                        </div>
                    </div>

                    {/* ROI & Timing */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-cyan)]/5 border border-[var(--color-cyan)]/20">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[var(--color-cyan)]" />
                                <span className="text-sm font-bold text-[var(--color-text-primary)]">{t("العائد المتوقع (ROI)", "Expected ROI")}</span>
                            </div>
                            <span className="text-lg font-black text-[var(--color-cyan)]">{report.roi.toFixed(1)}%</span>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-[var(--color-text-muted)]" />
                                <span className="text-sm font-bold text-[var(--color-text-primary)]">{t("أفضل توقيت للبيع", "Best Selling Time")}</span>
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                                {isRtl ? report.bestSellingTimingAr : report.bestSellingTimingEn}
                            </span>
                        </div>
                    </div>

                    {/* Recommendations & Risks */}
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5">
                            <h4 className="text-xs font-black text-[var(--color-cyan)] uppercase tracking-wider mb-2">{t("التوصية الذكية", "Smart Recommendation")}</h4>
                            <p className="text-sm text-[var(--color-text-primary)] font-medium leading-relaxed">
                                {isRtl ? report.recommendationAr : report.recommendationEn}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                <h4 className="text-xs font-black text-yellow-500 uppercase tracking-wider">{t("ملاحظات المخاطر", "Risk Notes")}</h4>
                            </div>
                            <p className="text-sm text-[var(--color-text-primary)] font-medium leading-relaxed">
                                {isRtl ? report.riskNotesAr : report.riskNotesEn}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--color-border)] flex justify-end">
                    <button
                        onClick={onClose}
                        className="btn-primary px-8 py-2.5 text-sm font-bold"
                    >
                        {t("حسنًا", "Close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
