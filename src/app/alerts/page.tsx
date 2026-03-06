"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useApp } from "@/lib/AppContext";
import { Bell, AlertTriangle, CheckCircle2, Info, XCircle, Filter } from "lucide-react";
import { PageTransition } from "@/components/motion/PageTransition";

interface Alert {
    id: string;
    type: "danger" | "warning" | "info" | "success";
    title_ar: string;
    title_en: string;
    desc_ar: string;
    desc_en: string;
    pond: string;
    time: string;
    read: boolean;
    readings?: {
        temp: number | "--";
        ph: number | "--";
        do: number | "--";
        nh3: number | "--";
    };
    reason_ar?: string;
    reason_en?: string;
}

const iconMap = {
    danger: <XCircle className="w-5 h-5 text-[#ef4444]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />,
    info: <Info className="w-5 h-5 text-[#3b82f6]" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#10b981]" />,
};

const colorMap = {
    danger: { bg: "bg-[#ef4444]/10", border: "border-[#ef4444]/20", dot: "bg-[#ef4444]" },
    warning: { bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/20", dot: "bg-[#f59e0b]" },
    info: { bg: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/20", dot: "bg-[#3b82f6]" },
    success: { bg: "bg-[#10b981]/10", border: "border-[#10b981]/20", dot: "bg-[#10b981]" },
};

export default function AlertsPage() {
    const { t } = useApp();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState<"all" | "danger" | "warning" | "info">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const pondsRef = ref(database, "ponds");
        const unsub = onValue(pondsRef, (snap) => {
            const data = snap.val();
            const generated: Alert[] = [];
            if (data) {
                Object.keys(data).forEach((key, idx) => {
                    const p = data[key];
                    const c = p.current || {};
                    const ai = p.ai_result?.current || {};
                    const pondName = `${t("حوض", "Pond")} ${idx + 1}`;

                    const pondReadings = {
                        temp: c.Temperature !== undefined ? c.Temperature : "--",
                        ph: c.PH !== undefined ? c.PH : "--",
                        do: c.DO !== undefined ? c.DO : "--",
                        nh3: c.Ammonia !== undefined ? c.Ammonia : "--",
                    };

                    if (ai.Status?.includes("Danger")) {
                        generated.push({
                            id: `${key}_danger`, type: "danger",
                            title_ar: `تنبيه حرج - ${pondName}`, title_en: `Critical Alert - ${pondName}`,
                            desc_ar: ai.Reason || "قراءات خارج النطاق الآمن", desc_en: ai.Reason || "Readings out of safe range",
                            pond: pondName, time: t("منذ دقائق", "Minutes ago"), read: false,
                            readings: pondReadings,
                            reason_ar: ai.Reason || `مستشعر سجل قراءات خطرة`,
                            reason_en: ai.Reason || `Sensor recorded dangerous readings`
                        });
                    } else if (ai.Status?.includes("Warning")) {
                        generated.push({
                            id: `${key}_warn`, type: "warning",
                            title_ar: `تحذير - ${pondName}`, title_en: `Warning - ${pondName}`,
                            desc_ar: ai.Reason || "بعض القراءات تحتاج مراقبة", desc_en: ai.Reason || "Some readings need attention",
                            pond: pondName, time: t("منذ ساعة", "An hour ago"), read: false,
                            readings: pondReadings,
                            reason_ar: ai.Reason || `مستشعر سجل قراءات تحتاج للتدخل`,
                            reason_en: ai.Reason || `Sensor recorded readings needing attention`
                        });
                    }

                    if (c.Temperature > 30) {
                        generated.push({
                            id: `${key}_temp`, type: "warning",
                            title_ar: `تنبيه: ارتفاع درجة الحرارة (°) - ${pondName}`, title_en: `Alert: High Temperature (°) - ${pondName}`,
                            desc_ar: `درجة الحرارة (°) ${c.Temperature?.toFixed(1)} أعلى من المعدل الطبيعي`,
                            desc_en: `Temperature (°) ${c.Temperature?.toFixed(1)} above normal range`,
                            pond: pondName, time: t("منذ 3 ساعات", "3 hours ago"), read: true,
                            readings: pondReadings,
                            reason_ar: `ارتفاع درجة الحرارة لـ ${c.Temperature?.toFixed(1)}`,
                            reason_en: `High Temp: T=${c.Temperature?.toFixed(1)}`,
                        });
                    }
                });
            }

            // Add sample system alerts
            generated.push(
                {
                    id: "sys_1", type: "success",
                    title_ar: "اكتمال دورة التغذية التلقائية", title_en: "Auto-feeding cycle complete",
                    desc_ar: "تمت تغذية جميع الأحواض بنجاح", desc_en: "All ponds fed successfully",
                    pond: t("النظام", "System"), time: t("منذ ساعتين", "2 hours ago"), read: true,
                },
                {
                    id: "sys_2", type: "info",
                    title_ar: "تم تحديث برنامج الذكاء الاصطناعي", title_en: "AI model updated",
                    desc_ar: "تم ترقية النموذج إلى النسخة 2.1", desc_en: "Model upgraded to version 2.1",
                    pond: t("النظام", "System"), time: t("منذ 5 ساعات", "5 hours ago"), read: true,
                }
            );

            setAlerts(generated);
            setLoading(false);
        });
        return () => unsub();
    }, [t]);

    const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-14 h-14 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6 pb-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button className="btn-secondary text-sm">{t("تحديد الكل كمقروء", "Mark all read")}</button>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Bell className="w-6 h-6 text-[var(--color-cyan)]" />
                        {t("التنبيهات", "Alerts")}
                        {alerts.filter((a) => !a.read).length > 0 && (
                            <span className="badge-danger">{alerts.filter((a) => !a.read).length}</span>
                        )}
                    </h2>
                </div>

                {/* Filters */}
                <div className="flex gap-2 justify-end">
                    {(["all", "danger", "warning", "info"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f
                                ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] border border-[var(--color-cyan)]/30"
                                : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                                }`}
                        >
                            {f === "all" ? t("الكل", "All") : f === "danger" ? t("حرج", "Critical") : f === "warning" ? t("تحذير", "Warning") : t("معلومات", "Info")}
                        </button>
                    ))}
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {filtered.length === 0 ? (
                        <div className="card text-center py-12">
                            <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto mb-3 opacity-30" />
                            <p className="text-[var(--color-text-secondary)]">{t("لا توجد تنبيهات", "No alerts")}</p>
                        </div>
                    ) : (
                        filtered.map((alert) => {
                            const c = colorMap[alert.type];
                            const isRichAlert = Boolean(alert.readings && (alert.type === "danger" || alert.type === "warning"));

                            if (isRichAlert) {
                                return (
                                    <div key={alert.id} className={`card flex flex-col p-5 bg-[var(--color-bg-card)] border-l-4 border-l-[#ef4444] shadow-md ${!alert.read ? 'border-[#ef4444]/40 dark:bg-[#111b21] bg-[#e0f2fe]' : 'border-l-transparent border-[var(--color-border)]'}`}>
                                        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3 mb-3">
                                            <div className="w-3.5 h-3.5 flex-shrink-0 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]"></div>
                                            <h4 className="text-[17px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{t(`تنبيه حرج: ${alert.pond}`, `CRITICAL ALERT: ${alert.pond}`)}</h4>
                                        </div>

                                        <div className="grid grid-cols-1 gap-1.5 text-[15px] pb-3 mb-3 border-b border-[var(--color-border)]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🌡️</span>
                                                <span className="font-bold text-[var(--color-text-primary)]">**Temp:**</span>
                                                <span className="text-[var(--color-text-secondary)]">{typeof alert.readings?.temp === 'number' ? alert.readings.temp.toFixed(1) : alert.readings?.temp}°C</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🧪</span>
                                                <span className="font-bold text-[var(--color-text-primary)]">**pH:**</span>
                                                <span className="text-[var(--color-text-secondary)]">{typeof alert.readings?.ph === 'number' ? alert.readings.ph.toFixed(1) : alert.readings?.ph}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">💧</span>
                                                <span className="font-bold text-[var(--color-text-primary)]">**DO:**</span>
                                                <span className="text-[var(--color-text-secondary)]">{typeof alert.readings?.do === 'number' ? alert.readings.do.toFixed(1) : alert.readings?.do} mg/L</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">⚠️</span>
                                                <span className="font-bold text-[var(--color-text-primary)]">**NH3:**</span>
                                                <span className="text-[var(--color-text-secondary)]">{typeof alert.readings?.nh3 === 'number' ? alert.readings.nh3.toFixed(2) : alert.readings?.nh3} mg/L</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 text-[15px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🚫</span>
                                                <span className="font-bold text-[var(--color-text-primary)]">**Reason:**</span>
                                                <span className="text-[var(--color-text-secondary)]">{t(alert.reason_ar || "", alert.reason_en || "")}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">⏰</span>
                                                    <span className="font-bold text-[var(--color-text-primary)]">**Time:**</span>
                                                    <span className="text-[var(--color-text-secondary)]">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                                                </div>
                                                <span className="text-xs text-[var(--color-text-muted)]">{alert.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Fallback rendering for system/info alerts
                            return (
                                <div key={alert.id} className={`card flex items-start gap-4 p-4 ${!alert.read ? `${c.bg} ${c.border}` : ""}`}>
                                    {iconMap[alert.type]}
                                    <div className="flex-1 rtl:mr-2 ltr:ml-2">
                                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{t(alert.title_ar, alert.title_en)}</h4>
                                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{t(alert.desc_ar, alert.desc_en)}</p>
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className="text-[10px] text-[var(--color-text-muted)]">{alert.time}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-input)] text-[var(--color-text-muted)]">{alert.pond}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 mt-1">
                                        {!alert.read && <div className={`w-2 h-2 rounded-full ${c.dot}`} />}
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
