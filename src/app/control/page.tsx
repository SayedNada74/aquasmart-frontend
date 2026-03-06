"use client";

import { Waves, Wind, Droplets, Utensils, Plus, Clock } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";
import { MotionCard } from "@/components/motion/MotionCard";

interface Device {
    id: string;
    name_ar: string;
    name_en: string;
    type: "aerator" | "pump" | "feeder";
    active: boolean;
    consumption: string;
}

const initialDevices: Device[] = [
    { id: "1", name_ar: "بدالة رقم 01 - حوض أ", name_en: "Aerator #01 - Pond A", type: "aerator", active: true, consumption: "1.2 kW" },
    { id: "2", name_ar: "بدالة رقم 02 - حوض ب", name_en: "Aerator #02 - Pond B", type: "aerator", active: false, consumption: "0 kW" },
    { id: "3", name_ar: "مضخة التدوير المركزية", name_en: "Central Circulation Pump", type: "pump", active: true, consumption: "" },
    { id: "4", name_ar: "مضخة الصرف - قطاع 2", name_en: "Drain Pump - Sector 2", type: "pump", active: false, consumption: "" },
];

export default function ControlPage() {
    const { t, lang } = useApp();
    const [devices, setDevices] = useState(initialDevices);
    const [feedingMsg, setFeedingMsg] = useState("");

    const toggleDevice = (id: string) => {
        setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));
    };

    const feedNow = (feeder: string) => {
        setFeedingMsg(t(`جاري تغذية ${feeder}...`, `Feeding ${feeder}...`));
        setTimeout(() => setFeedingMsg(t(`تمت تغذية ${feeder} بنجاح ✓`, `${feeder} fed successfully ✓`)), 1500);
        setTimeout(() => setFeedingMsg(""), 4000);
    };

    const feeders = [
        { name_ar: "وحدة حوض أ", name_en: "Pond A Unit", load: 85, lastFeed: t("آخر تغذية: قبل ساعتين", "Last fed: 2 hours ago") },
        { name_ar: "وحدة حوض ب", name_en: "Pond B Unit", load: 12, lastFeed: t("مستوى منخفض!", "Low level!") },
        { name_ar: "وحدة حوض ج", name_en: "Pond C Unit", load: 94, lastFeed: t("آخر تغذية: قبل 30 دقيقة", "Last fed: 30 min ago") },
    ];

    const schedules = [
        { time: "AM 06:00", label: t("تغذية", "Feeding"), desc: t("تغذية صباحية - كل الأحواض", "Morning feed - All ponds"), days: [t("س", "S"), t("ن", "M"), t("ث", "T"), t("ت", "W"), t("خ", "T"), t("ج", "F"), t("ح", "S")] },
        { time: "PM 08:00", label: t("تهوية", "Aeration"), desc: t("تشغيل البدالات - الوضع الليلي", "Aerators ON - Night mode"), days: [] },
    ];

    return (
        <PageTransition>
            <div className="space-y-6 pb-8">
                {/* Toast */}
                {feedingMsg && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-cyan)] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
                        {feedingMsg}
                    </div>
                )}

                {/* Aerators */}
                <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                        <Wind className="w-5 h-5 text-[var(--color-cyan)]" />
                        {t("بدالات الأكسجين المذاب (DO) (Aerators)", "Dissolved Oxygen (DO) Aerators")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {devices.filter((d) => d.type === "aerator").map((d) => (
                            <MotionCard key={d.id} className="card flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => toggleDevice(d.id)}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${d.active ? "bg-[var(--color-cyan)]" : "bg-[var(--color-border)]"}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${d.active ? (lang === "ar" ? "right-0.5" : "left-6") : (lang === "ar" ? "left-0.5" : "left-0.5")}`} />
                                    </button>
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t(d.name_ar, d.name_en)}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{d.active ? t(`متصل • استهلاك ${d.consumption}`, `Connected • ${d.consumption}`) : t("منقطع", "Disconnected")}</p>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${d.active ? "bg-[#10b981]" : "bg-[var(--color-text-muted)]"}`} />
                            </MotionCard>
                        ))}
                    </div>
                </div>

                {/* Pumps */}
                <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                        <Droplets className="w-5 h-5 text-[#3b82f6]" />
                        {t("مضخات المياه (Water Pumps)", "Water Pumps")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {devices.filter((d) => d.type === "pump").map((d) => (
                            <MotionCard key={d.id} className="card flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => toggleDevice(d.id)}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${d.active ? "bg-[#10b981] text-white" : "bg-[var(--color-bg-input)] text-[var(--color-text-muted)]"}`}>
                                        {d.active ? t("إيقاف", "Stop") : t("تشغيل", "Start")}
                                    </button>
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t(d.name_ar, d.name_en)}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{d.active ? t("نشط", "Active") : t("غير نشط", "Inactive")}</p>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${d.active ? "bg-[#10b981]" : "bg-[var(--color-text-muted)]"}`} />
                            </MotionCard>
                        ))}
                    </div>
                </div>

                {/* Feeders */}
                <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                        <Utensils className="w-5 h-5 text-[#f59e0b]" />
                        {t("وحدات التغذية التلقائية", "Auto-Feeding Units")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {feeders.map((f, i) => (
                            <MotionCard key={i} className="card text-center">
                                <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">{t(f.name_ar, f.name_en)}</p>
                                <div className="relative w-full h-3 bg-[var(--color-bg-input)] rounded-full overflow-hidden mb-2">
                                    <div className={`h-full rounded-full transition-all ${f.load > 50 ? "bg-[var(--color-cyan)]" : f.load > 20 ? "bg-[#f59e0b]" : "bg-[#ef4444]"}`} style={{ width: `${f.load}%` }} />
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)]">{t("الحمولة", "Load")}: {f.load}%</p>
                                <button onClick={() => feedNow(t(f.name_ar, f.name_en))} className="btn-primary w-full mt-3 text-xs py-2">{t("غذّ الآن", "Feed Now")}</button>
                                <p className={`text-[10px] mt-2 ${f.load < 20 ? "text-[#ef4444]" : "text-[var(--color-text-muted)]"}`}>{f.lastFeed}</p>
                            </MotionCard>
                        ))}
                    </div>
                </div>

                {/* Schedule + Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <button className="w-8 h-8 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#3b82f6]" />
                                {t("جدولة المهام", "Task Scheduling")}
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {schedules.map((s, i) => (
                                <div key={i} className="p-3 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="badge-safe">{s.label}</span>
                                        <span className="text-sm font-mono font-bold text-[var(--color-text-primary)]">{s.time}</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{s.desc}</p>
                                    {s.days.length > 0 && (
                                        <div className="flex gap-1 mt-2 justify-end">
                                            {s.days.map((d) => (
                                                <span key={d} className="w-6 h-6 rounded text-[10px] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] flex items-center justify-center font-semibold">{d}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                            {t("سجل العمليات", "Operation Log")}
                        </h3>
                        <div className="space-y-3">
                            {[
                                { text: t('تم إيقاف "بدالة 01" يدوياً', '"Aerator 01" stopped manually'), detail: t("منذ 15 دقيقة • بواسطة المشرف", "15 min ago • by Admin"), color: "bg-[#3b82f6]" },
                                { text: t("اكتمال دورة التغذية التلقائية", "Auto-feeding cycle complete"), detail: t("منذ ساعتين • تلقائي", "2 hours ago • Automatic"), color: "bg-[#10b981]" },
                                { text: t("تنبيه: ارتفاع درجة الحرارة (°)", "Alert: High Temperature (°)"), detail: t("منذ 4 ساعات • حوض ج", "4 hours ago • Pond C"), color: "bg-[#f59e0b]" },
                                { text: t('تشغيل "مضخة المركز" آلياً', '"Central Pump" started auto'), detail: t("منذ 6 ساعات • جدول المياه", "6 hours ago • Water schedule"), color: "bg-[var(--color-teal)]" },
                            ].map((log, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.color}`} />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-[var(--color-text-primary)]">{log.text}</p>
                                        <p className="text-[10px] text-[var(--color-text-muted)]">{log.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
