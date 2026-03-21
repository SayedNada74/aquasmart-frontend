"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";
import { useApp } from "@/lib/AppContext";
import { Bell, AlertTriangle, CheckCircle2, Info, XCircle, Trash2, Clock } from "lucide-react";
import { PageTransition } from "@/components/motion/PageTransition";
import { getAlertRecoveryGuidance } from "@/lib/alertRecovery";

interface Alert {
    id: string;
    type: "danger" | "warning" | "info" | "success";
    title_ar: string;
    title_en: string;
    desc_ar: string;
    desc_en: string;
    pondId?: string;
    pond: string;
    timestamp: number;
    read: boolean;
    severity: number;
    metrics?: {
        temp: number;
        ph: number;
        do: number;
        nh3: number;
    };
}

const colorMap = {
    danger: { bg: "bg-[#ef4444]/10", border: "border-[#ef4444]/20", dot: "bg-[#ef4444]" },
    warning: { bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/20", dot: "bg-[#f59e0b]" },
    info: { bg: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/20", dot: "bg-[#3b82f6]" },
    success: { bg: "bg-[#10b981]/10", border: "border-[#10b981]/20", dot: "bg-[#10b981]" },
};

export default function AlertsPage() {
    const { t, lang } = useApp();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState<"all" | "danger" | "warning" | "info">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const historyRef = ref(database, "alerts_history");
        const unsub = onValue(historyRef, (snap) => {
            const data = snap.val();
            if (data) {
                const arr = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    pond: data[key].pondId?.replace('pond_', t('حوض ', 'Pond ')) || t('النظام', 'System')
                })) as Alert[];
                // Order by newest first
                setAlerts(arr.sort((a, b) => b.timestamp - a.timestamp));
            } else {
                setAlerts([]);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [t]);

    const formatTime = (ts: number) => {
        const diff = Math.floor((Date.now() - ts) / 60000);
        if (diff < 1) return t("الآن", "Just now");
        if (diff < 60) return t(`منذ ${diff} دقيقة`, `${diff} min ago`);
        const hours = Math.floor(diff / 60);
        if (hours < 24) return t(`منذ ${hours} ساعة`, `${hours} hours ago`);
        return new Date(ts).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    };

    const markAllRead = async () => {
        const updates: any = {};
        alerts.forEach(a => {
            if (!a.read) updates[`alerts_history/${a.id}/read`] = true;
        });
        if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
        }
    };

    const clearHistory = async () => {
        if (confirm(t("هل أنت متأكد من مسح سجل التنبيهات؟", "Are you sure you want to clear alert history?"))) {
            await remove(ref(database, "alerts_history"));
        }
    };

    const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <div className="w-14 h-14 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6 pb-8 max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Bell className="w-6 h-6 text-[var(--color-cyan)]" />
                        {t("سجل التنبيهات", "Alerts History")}
                        {alerts.filter((a) => !a.read).length > 0 && (
                            <span className="bg-[#ef4444] text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                                {alerts.filter((a) => !a.read).length}
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={markAllRead} className="btn-secondary text-xs py-2 px-4 shadow-sm">
                            {t("تحديد الكل كمقروء", "Mark all read")}
                        </button>
                        <button onClick={clearHistory} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 p-2 rounded-lg transition-colors border border-red-500/20">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 justify-end overflow-x-auto pb-1">
                    {(["all", "danger", "warning", "info"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${filter === f
                                ? "bg-[var(--color-cyan)] text-white shadow-lg shadow-[var(--color-cyan)]/20"
                                : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-cyan)]/30"
                                }`}
                        >
                            {f === "all" ? t("الكل", "All") : f === "danger" ? t("حرج", "Critical") : f === "warning" ? t("تحذير", "Warning") : t("معلومات", "Info")}
                        </button>
                    ))}
                </div>

                {/* Alerts List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                    {filtered.length === 0 ? (
                        <div className="card lg:col-span-1 text-center py-16 bg-gradient-to-b from-[var(--color-bg-card)] to-transparent border-dashed">
                            <CheckCircle2 className="w-16 h-16 text-[#10b981] mx-auto mb-4 opacity-20" />
                            <p className="text-[var(--color-text-secondary)] font-medium">{t("لا توجد تنبيهات حالياً", "No alerts found")}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{t("سيتم عرض التنبيهات هنا فور حدوثها", "Alerts will appear here as they happen")}</p>
                        </div>
                    ) : (
                        filtered.map((alert) => {
                            const isDanger = alert.type === "danger";
                            const recovery = getAlertRecoveryGuidance(alert.metrics, alert.desc_ar, alert.desc_en);

                            return (
                                <div
                                    key={alert.id}
                                    className={`card group relative overflow-hidden p-0 transition-all duration-300 border-l-[6px] shadow-sm hover:shadow-xl ${!alert.read
                                            ? `bg-[var(--color-bg-card)] scale-[1.01] ${isDanger ? 'border-l-[#ef4444]' : 'border-l-[#f59e0b]'}`
                                            : `bg-[var(--color-bg-card)]/60 border-l-transparent opacity-90`
                                        }`}
                                >
                                    <div className="p-5 flex flex-col gap-4">
                                        {/* Top Line: Status Dot + Title */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3.5 h-3.5 rounded-full ${isDanger ? 'bg-[#ef4444] animate-pulse' : 'bg-[#f59e0b]'}`} />
                                                <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-tight flex items-center gap-1">
                                                    <span>{isDanger ? t("تنبيه حرج:", "CRITICAL ALERT:") : t("تحذير:", "WARNING:")}</span>
                                                    <span className="text-[var(--color-cyan)]">{alert.pond}</span>
                                                </h4>
                                            </div>
                                            <button
                                                onClick={async () => await remove(ref(database, `alerts_history/${alert.id}`))}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="h-[1px] bg-[var(--color-border)] w-full opacity-50" />

                                        {/* Metrics Section */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-lg">🌡️</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase">{t("درجة الحرارة", "Temp")}</span>
                                                    <span className="font-black text-[var(--color-text-primary)]">{alert.metrics?.temp.toFixed(1) || "--"}°C</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-lg">🧪</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase">{t("حموضة المية (pH)", "pH Level")}</span>
                                                    <span className="font-black text-[var(--color-text-primary)]">{alert.metrics?.ph.toFixed(1) || "--"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-lg">💧</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase">{t("الأكسجين (DO)", "Oxygen")}</span>
                                                    <span className="font-black text-[var(--color-text-primary)]">{alert.metrics?.do.toFixed(1) || "--"} mg/L</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-lg">⚠️</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase">{t("الأمونيا (NH3)", "Ammonia")}</span>
                                                    <span className="font-black text-[var(--color-text-primary)]">{alert.metrics?.nh3.toFixed(2) || "--"} mg/L</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-[1px] bg-[var(--color-border)] w-full opacity-50" />

                                        {/* Reason & Time Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 text-sm">
                                                <span className="text-lg">🚫</span>
                                                <div className="flex-1 bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)]">
                                                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase block mb-1">{t("السبب والتحليل", "Reason & Analysis")}</span>
                                                    <span className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">{t(alert.desc_ar, alert.desc_en)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 text-sm">
                                                <span className="text-lg">🎯</span>
                                                <div className="flex-1 bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)]">
                                                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase block mb-1">{t("هدف الاستعادة", "Recovery Target")}</span>
                                                    <span className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium block">
                                                        {t("النطاق الآمن الموصى به:", "Recommended Safe Range:")} {t(recovery.metricLabelAr, recovery.metricLabelEn)} {t(recovery.safeRangeAr, recovery.safeRangeEn)}
                                                    </span>
                                                    <span className="text-xs text-[var(--color-cyan)] leading-relaxed font-medium block mt-2">
                                                        {t("الإجراء المقترح:", "Suggested Action:")} {t(recovery.actionAr, recovery.actionEn)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                                                    <span className="text-lg">⏰</span>
                                                    <span className="font-bold uppercase">{t("وقت التنبيه:", "Registered at:")}</span>
                                                    <span className="font-black text-[var(--color-text-primary)]">
                                                        {new Date(alert.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-[var(--color-cyan)] font-black italic uppercase tracking-widest">
                                                    {formatTime(alert.timestamp)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* New Badge */}
                                        {!alert.read && (
                                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-[var(--color-cyan)]/10 px-2 py-0.5 rounded-full border border-[var(--color-cyan)]/20">
                                                <span className="text-[8px] font-black text-[var(--color-cyan)] uppercase tracking-tighter">{t("جديد", "NEW")}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
