"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useApp } from "@/lib/AppContext";
import {
    Waves, Thermometer, Droplets, FlaskConical, Wind,
    Plus, X, Fish, Ruler, Clock, ShieldCheck, AlertTriangle,
    CheckCircle2, Gauge,
} from "lucide-react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Stepper } from "@/components/stepper/Stepper";
import { motion, AnimatePresence } from "framer-motion";
import { ChromaCard } from "@/components/effects/ChromaCard";
import { LiveDataIndicator } from "@/components/monitoring/LiveDataIndicator";

interface PondData {
    id: string;
    name_ar: string;
    name_en: string;
    current: { Temperature: number; PH: number; Ammonia: number; DO: number };
    status: string;
    fishType: string;
    area: string;
    feedSchedule: string;
    waterQuality: number;
    isLocal?: boolean;
}

const fishTypes = [
    { ar: "بلطي", en: "Tilapia" },
    { ar: "بوري", en: "Mullet" },
    { ar: "قاروص", en: "Sea Bass" },
    { ar: "مبروك", en: "Carp" },
    { ar: "جمبري", en: "Shrimp" },
];

function calcWaterQuality(c: { Temperature: number; PH: number; Ammonia: number; DO: number }): number {
    let score = 100;
    if (c.Temperature < 24 || c.Temperature > 32) score -= 20;
    else if (c.Temperature < 25 || c.Temperature > 30) score -= 5;
    if (c.PH < 6.5 || c.PH > 8.5) score -= 25;
    else if (c.PH < 7.0 || c.PH > 8.0) score -= 5;
    if (c.Ammonia > 0.8) score -= 30;
    else if (c.Ammonia > 0.5) score -= 15;
    else if (c.Ammonia > 0.3) score -= 5;
    if (c.DO < 4.2) score -= 30;
    else if (c.DO < 5.0) score -= 15;
    else if (c.DO < 6.0) score -= 5;
    return Math.max(0, Math.min(100, score));
}

export default function PondsPage() {
    const { t, lang } = useApp();
    const [ponds, setPonds] = useState<PondData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [activeStep, setActiveStep] = useState(0);
    const [newPond, setNewPond] = useState({
        name: "", fishType: "بلطي", area: "", feedTime: "07:00",
    });

    useEffect(() => {
        if (!showModal) {
            setActiveStep(0);
            setNewPond({ name: "", fishType: "بلطي", area: "", feedTime: "07:00" });
        }
    }, [showModal]);

    useEffect(() => {
        const pondsRef = ref(database, "ponds");
        const unsub = onValue(pondsRef, (snap) => {
            const data = snap.val();
            const arr: PondData[] = [];
            if (data) {
                Object.keys(data).forEach((key, idx) => {
                    const c = data[key].current || { Temperature: 0, PH: 0, Ammonia: 0, DO: 0 };
                    arr.push({
                        id: key,
                        name_ar: `حوض رقم ${idx + 1}`,
                        name_en: `Pond #${idx + 1}`,
                        current: c,
                        status: data[key].ai_result?.current?.Status || "Safe",
                        fishType: idx === 0 ? "Tilapia" : idx === 1 ? "Mullet" : "Sea Bass",
                        area: `${(idx + 1) * 500}`,
                        feedSchedule: "07:00, 12:00, 17:00",
                        waterQuality: calcWaterQuality(c),
                    });
                });
            }
            // Merge locally added ponds
            try {
                const local = JSON.parse(localStorage.getItem("aquasmart_local_ponds") || "[]");
                local.forEach((lp: any) => arr.push({ ...lp, isLocal: true }));
            } catch { }
            setPonds(arr);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleAddPond = () => {
        if (!newPond.name.trim()) return;
        const localPond: PondData = {
            id: `local_${Date.now()}`,
            name_ar: newPond.name,
            name_en: newPond.name,
            current: { Temperature: 26.5, PH: 7.4, Ammonia: 0.08, DO: 7.2 },
            status: "Safe ✅",
            fishType: newPond.fishType,
            area: newPond.area || "500",
            feedSchedule: newPond.feedTime,
            waterQuality: 95,
            isLocal: true,
        };
        // Save to localStorage
        try {
            const existing = JSON.parse(localStorage.getItem("aquasmart_local_ponds") || "[]");
            existing.push(localPond);
            localStorage.setItem("aquasmart_local_ponds", JSON.stringify(existing));
        } catch { }
        setPonds((prev) => [...prev, localPond]);
        setShowModal(false);
        setNewPond({ name: "", fishType: "بلطي", area: "", feedTime: "07:00" });
        setToastMsg(t("تم إضافة الحوض بنجاح!", "Pond added successfully!"));
        setTimeout(() => setToastMsg(""), 3000);
    };

    const handleDeleteLocal = (id: string) => {
        setPonds((prev) => prev.filter((p) => p.id !== id));
        try {
            const existing = JSON.parse(localStorage.getItem("aquasmart_local_ponds") || "[]");
            localStorage.setItem("aquasmart_local_ponds", JSON.stringify(existing.filter((p: any) => p.id !== id)));
        } catch { }
        setToastMsg(t("تم حذف الحوض", "Pond deleted"));
        setTimeout(() => setToastMsg(""), 3000);
    };

    const getStatusBadge = (status: string) => {
        if (status.includes("Danger")) return <span className="badge-danger">{t("خطر", "Danger")}</span>;
        if (status.includes("Warning")) return <span className="badge-warning">{t("تحذير", "Warning")}</span>;
        return <span className="badge-safe">{t("مستقر", "Safe")}</span>;
    };

    const getQualityColor = (q: number) => q >= 80 ? "#10b981" : q >= 60 ? "#f59e0b" : "#ef4444";
    const getQualityLabel = (q: number) => q >= 80 ? t("ممتازة", "Excellent") : q >= 60 ? t("متوسطة", "Fair") : t("ضعيفة", "Poor");

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-14 h-14 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6 pb-8">
                {/* Toast */}
                {toastMsg && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#10b981] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {toastMsg}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t("إضافة حوض جديد", "Add New Pond")}
                    </button>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-1.5">
                            {t(`إجمالي: ${ponds.length} حوض`, `Total: ${ponds.length} ponds`)}
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Waves className="w-6 h-6 text-[var(--color-cyan)]" />
                            {t("إدارة الأحواض", "Ponds Management")}
                        </h2>
                        <LiveDataIndicator path="ponds" />
                    </div>
                </div>

                {/* Ponds Grid */}
                {ponds.length === 0 ? (
                    <div className="card text-center py-16">
                        <Waves className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-30" />
                        <p className="text-[var(--color-text-secondary)] mb-4">{t("لا توجد أحواض. أضف أول حوض!", "No ponds yet. Add your first pond!")}</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">{t("+ إضافة حوض", "+ Add Pond")}</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {ponds.map((pond) => (
                            <ChromaCard key={pond.id} className="card p-5 !border-transparent hover:!border-[var(--color-cyan)]/30 transition-all flex flex-col justify-between min-h-[300px]">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(pond.status)}
                                        {pond.isLocal && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#3b82f6]/15 text-[#3b82f6]">{t("يدوي", "Manual")}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                                            {t(pond.name_ar, pond.name_en)}
                                        </h3>
                                        <Waves className="w-5 h-5 text-[var(--color-cyan)]" />
                                    </div>
                                </div>

                                {/* Fish Type + Water Quality */}
                                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-[var(--color-bg-input)]">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="w-4 h-4" style={{ color: getQualityColor(pond.waterQuality) }} />
                                        <div>
                                            <p className="text-xs text-[var(--color-text-muted)]">{t("جودة المياه", "Water Quality")}</p>
                                            <p className="text-sm font-bold" style={{ color: getQualityColor(pond.waterQuality) }}>
                                                {pond.waterQuality}% - {getQualityLabel(pond.waterQuality)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-left">
                                            <p className="text-xs text-[var(--color-text-muted)]">{t("النوع", "Species")}</p>
                                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{pond.fishType}</p>
                                        </div>
                                        <Fish className="w-5 h-5 text-[var(--color-cyan)]" />
                                    </div>
                                </div>

                                {/* Sensor Readings */}
                                <div className="grid grid-cols-2 gap-3 mb-4 flex-grow">
                                    <div className="p-3 rounded-lg bg-[var(--color-bg-input)] flex flex-col justify-center items-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1 text-center">
                                            <Thermometer className="w-3.5 h-3.5 text-[#f59e0b] hidden sm:block" />
                                            <span className="text-[10px] text-[var(--color-text-secondary)]">{t("درجة الحرارة (°)", "Temperature (°)")}</span>
                                        </div>
                                        <p className="text-lg font-bold text-[var(--color-text-primary)]">{pond.current.Temperature?.toFixed(1)} <span className="text-[10px] text-[var(--color-text-muted)]">°C</span></p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--color-bg-input)] flex flex-col justify-center items-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1 text-center">
                                            <FlaskConical className="w-3.5 h-3.5 text-[#3b82f6] hidden sm:block" />
                                            <span className="text-[10px] text-[var(--color-text-secondary)]">{t("قوة الهيدروجين (PH)", "Power of hydrogen (PH)")}</span>
                                        </div>
                                        <p className="text-lg font-bold text-[var(--color-text-primary)]">{pond.current.PH?.toFixed(1)}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--color-bg-input)] flex flex-col justify-center items-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1 text-center">
                                            <Wind className="w-3.5 h-3.5 text-[#ef4444] hidden sm:block" />
                                            <span className="text-[10px] text-[var(--color-text-secondary)]">{t("الأمونيا (NH3)", "Ammonia (NH3)")}</span>
                                        </div>
                                        <p className="text-lg font-bold text-[var(--color-text-primary)]">{pond.current.Ammonia?.toFixed(2)} <span className="text-[10px] text-[var(--color-text-muted)]">ppm</span></p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[var(--color-bg-input)] flex flex-col justify-center items-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1 text-center">
                                            <Droplets className="w-3.5 h-3.5 text-[#14b8a6] hidden sm:block" />
                                            <span className="text-[10px] text-[var(--color-text-secondary)]">{t("الأكسجين المذاب (DO)", "Dissolved Oxygen (DO)")}</span>
                                        </div>
                                        <p className="text-lg font-bold text-[var(--color-text-primary)]">{pond.current.DO?.toFixed(1)} <span className="text-[10px] text-[var(--color-text-muted)]">mg/L</span></p>
                                    </div>
                                </div>

                                {/* Meta Info + Footer */}
                                <div>
                                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mb-3">
                                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pond.feedSchedule}</div>
                                        <div className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {pond.area} m²</div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                                        {pond.isLocal ? (
                                            <button onClick={() => handleDeleteLocal(pond.id)} className="text-[#ef4444] text-xs hover:underline pointer-events-auto relative z-20">{t("حذف", "Delete")}</button>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] text-[#10b981]"><ShieldCheck className="w-3 h-3" />{t("متصل بالمستشعرات", "Connected")}</span>
                                        )}
                                        <span className="text-[10px] text-[var(--color-text-muted)]">{pond.fishType}</span>
                                    </div>
                                </div>
                            </ChromaCard>
                        ))}
                    </div>
                )}

                {/* ===== ADD POND MODAL ===== */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowModal(false)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                                    <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-[var(--color-bg-input)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                        {t("إضافة حوض جديد", "Add New Pond")}
                                        <Plus className="w-5 h-5 text-[var(--color-cyan)]" />
                                    </h3>
                                </div>

                                {/* Modal Body with Stepper */}
                                <div className="p-5 flex-1 relative min-h-[340px] flex flex-col">
                                    <Stepper
                                        lang={lang}
                                        activeStep={activeStep}
                                        steps={[
                                            { label_ar: "معلومات الحوض", label_en: "Pond Info" },
                                            { label_ar: "إعدادات السمك", label_en: "Fish Settings" },
                                            { label_ar: "مراجعة", label_en: "Review" },
                                        ]}
                                    />

                                    <div className="relative mt-8 flex-1">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {activeStep === 0 && (
                                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1.5">{t("اسم الحوض *", "Pond Name *")}</label>
                                                        <input
                                                            value={newPond.name}
                                                            onChange={(e) => setNewPond((p) => ({ ...p, name: e.target.value }))}
                                                            placeholder={t("مثال: حوض البلطي الشرقي", "e.g., East Tilapia Pond")}
                                                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)] transition-shadow"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1.5">{t("المساحة (م²) *", "Area (m²) *")}</label>
                                                        <input
                                                            type="number"
                                                            value={newPond.area}
                                                            onChange={(e) => setNewPond((p) => ({ ...p, area: e.target.value }))}
                                                            placeholder="500"
                                                            min="1"
                                                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)] transition-shadow"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeStep === 1 && (
                                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1.5">{t("نوع السمك *", "Fish Species *")}</label>
                                                        <select
                                                            value={newPond.fishType}
                                                            onChange={(e) => setNewPond((p) => ({ ...p, fishType: e.target.value }))}
                                                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)] transition-shadow"
                                                        >
                                                            {fishTypes.map((f) => (
                                                                <option key={f.en} value={f.en}>{lang === "ar" ? `${f.ar} (${f.en})` : f.en}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1.5">{t("أول وقت تغذية *", "First Feed Time *")}</label>
                                                        <input
                                                            type="time"
                                                            value={newPond.feedTime}
                                                            onChange={(e) => setNewPond((p) => ({ ...p, feedTime: e.target.value }))}
                                                            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)] transition-shadow flex items-center"
                                                            style={{ colorScheme: "dark" }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeStep === 2 && (
                                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                                                    <div className="p-4 rounded-xl bg-[var(--color-cyan)]/5 border border-[var(--color-cyan)]/20 shadow-inner">
                                                        <h4 className="flex items-center gap-2 text-sm font-bold text-[var(--color-cyan-dark)] mb-4 pb-2 border-b border-[var(--color-cyan)]/20">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            {t("مراجعة البيانات", "Review Details")}
                                                        </h4>
                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[var(--color-text-secondary)]">{t("اسم الحوض:", "Pond Name:")}</span>
                                                                <span className="font-semibold text-[var(--color-text-primary)]">{newPond.name}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[var(--color-text-secondary)]">{t("المساحة:", "Area:")}</span>
                                                                <span className="font-semibold text-[var(--color-text-primary)]">{newPond.area} m²</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[var(--color-text-secondary)]">{t("النوع:", "Species:")}</span>
                                                                <span className="font-semibold text-[var(--color-text-primary)]">{newPond.fishType}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[var(--color-text-secondary)]">{t("أول وقت تغذية:", "First Feed:")}</span>
                                                                <span className="font-semibold text-[var(--color-text-primary)] text-[var(--color-cyan-dark)] px-2 py-0.5 rounded bg-[var(--color-cyan)]/10">{newPond.feedTime}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex gap-3 p-5 border-t border-[var(--color-border)] rounded-b-2xl bg-[var(--color-bg-base)]/30 backdrop-blur-sm">
                                    {activeStep > 0 ? (
                                        <button onClick={() => setActiveStep(s => s - 1)} className="btn-secondary flex-1 border border-[var(--color-border)] shadow-sm hover:bg-[var(--color-bg-input)]">
                                            {t("السابق", "Back")}
                                        </button>
                                    ) : (
                                        <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 border border-[var(--color-border)] shadow-sm hover:bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]">
                                            {t("إلغاء", "Cancel")}
                                        </button>
                                    )}

                                    {activeStep < 2 ? (
                                        <button
                                            onClick={() => setActiveStep(s => s + 1)}
                                            disabled={
                                                (activeStep === 0 && (!newPond.name.trim() || !newPond.area || Number(newPond.area) <= 0)) ||
                                                (activeStep === 1 && (!newPond.fishType || !newPond.feedTime))
                                            }
                                            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--color-cyan)]/20"
                                        >
                                            {t("التالي", "Next")}
                                        </button>
                                    ) : (
                                        <button onClick={handleAddPond} className="btn-primary flex-1 flex items-center justify-center gap-2 !bg-emerald-500 hover:!bg-emerald-600 !border-none !text-white shadow-lg shadow-emerald-500/20 transition-all">
                                            <CheckCircle2 className="w-4 h-4" />
                                            {t("تأكيد وإضافة", "Confirm & Add")}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
