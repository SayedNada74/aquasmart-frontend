"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Thermometer, 
    FlaskConical, 
    Droplets, 
    Wind, 
    FileText, 
    TrendingUp, 
    History, 
    BrainCircuit,
    Download
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend 
} from "recharts";
import { generatePondPDF } from "@/lib/generatePDF";

interface PondData {
    id: string;
    name_ar: string;
    name_en: string;
    current: { Temperature: number; PH: number; Ammonia: number; DO: number };
    status: string;
    reason?: string;
    fishType: string;
    area: string;
    feedSchedule: string;
    waterQuality: number;
    history?: any[];
}

interface PondDetailModalProps {
    pond: PondData | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PondDetailModal({ pond, isOpen, onClose }: PondDetailModalProps) {
    const { t, lang, theme, userName, userEmail } = useApp();

    if (!pond) return null;

    const chartData = (pond.history || []).map((h: any) => ({
        time: h.time?.includes(" ") ? h.time.split(" ")[1].substring(0, 5) : h.time,
        temp: h.T || h.Temperature,
        ph: h.pH || h.PH,
        nh3: h.NH3 || h.Ammonia,
        do: h.DO,
    }));

    const handleDownloadReport = () => {
        const reportData = {
            pondId: pond.id,
            pondName: lang === "ar" ? pond.name_ar : pond.name_en,
            managerName: userName,
            managerEmail: userEmail,
            current: { ...pond.current, timestamp: new Date().toISOString() },
            aiStatus: pond.status,
            aiReason: pond.reason || "",
            aiConfidence: "High",
            history: (pond.history || []).map(h => ({
                time: h.time || "",
                T: h.T || h.Temperature || 0,
                pH: h.pH || h.PH || 0,
                NH3: h.NH3 || h.Ammonia || 0,
                DO: h.DO || 0,
                status: h.status || "Safe"
            }))
        };
        generatePondPDF(reportData);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const isDanger = status.includes("Danger");
        const isWarning = status.includes("Warning");
        const baseClass = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm";
        
        if (isDanger) return <span className={`${baseClass} bg-red-500/20 text-red-500 border border-red-500/30`}>{t("خطر حرج", "CRITICAL")}</span>;
        if (isWarning) return <span className={`${baseClass} bg-amber-500/20 text-amber-500 border border-amber-500/30`}>{t("تحذير", "WARNING")}</span>;
        return <span className={`${baseClass} bg-emerald-500/20 text-emerald-500 border border-emerald-500/30`}>{t("مستقر", "STABLE")}</span>;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-[var(--color-bg-card)] to-[var(--color-bg-input)]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--color-cyan)]/10 flex items-center justify-center text-[var(--color-cyan)] shadow-inner">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[var(--color-text-primary)]">{t(pond.name_ar, pond.name_en)}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StatusBadge status={pond.status} />
                                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">• {pond.fishType} • {pond.area} m²</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[var(--color-bg-input)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all hover:rotate-90">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Current Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: <Thermometer />, label: t("الحرارة", "Temp"), val: pond.current.Temperature.toFixed(1) + "°C", color: "#f59e0b" },
                                    { icon: <FlaskConical />, label: t("الحموضة", "pH"), val: pond.current.PH.toFixed(1), color: "#3b82f6" },
                                    { icon: <Wind />, label: t("الأمونيا", "NH3"), val: pond.current.Ammonia.toFixed(2), color: "#ef4444" },
                                    { icon: <Droplets />, label: t("الأكسجين", "DO"), val: pond.current.DO.toFixed(1), color: "#14b8a6" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-[var(--color-bg-input)] border border-[var(--color-border)] hover:border-[var(--color-cyan)]/30 transition-all group">
                                        <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
                                            <span className="w-4 h-4" style={{ color: stat.color }}>{stat.icon}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                                        </div>
                                        <div className="text-lg font-black text-[var(--color-text-primary)]">{stat.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Main Analysis Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Chart */}
                                <div className="lg:col-span-2 card p-4 !bg-[var(--color-bg-input)] relative overflow-hidden min-h-[300px]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black text-[var(--color-text-secondary)] flex items-center gap-2">
                                            <History className="w-4 h-4 text-[var(--color-cyan)]" />
                                            {t("تحليل الاتجاهات (آخر 24 ساعة)", "Trend Analysis (Last 24h)")}
                                        </h3>
                                    </div>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#eee'} vertical={false} />
                                                <XAxis 
                                                    dataKey="time" 
                                                    stroke="#888" 
                                                    fontSize={10} 
                                                    tickLine={false} 
                                                    axisLine={false}
                                                    reversed={lang === 'ar'}
                                                />
                                                <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
                                                        border: '1px solid #333',
                                                        borderRadius: '12px',
                                                        fontSize: '10px'
                                                    }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                                <Line type="monotone" dataKey="temp" name={t("الحرارة", "Temp")} stroke="#f59e0b" strokeWidth={3} dot={false} />
                                                <Line type="monotone" dataKey="ph" name={t("الحموضة", "pH")} stroke="#3b82f6" strokeWidth={3} dot={false} />
                                                <Line type="monotone" dataKey="do" name={t("الأكسجين", "DO")} stroke="#14b8a6" strokeWidth={3} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* AI Insight Card */}
                                <div className="card p-4 bg-gradient-to-br from-[var(--color-cyan)]/10 to-transparent border-[var(--color-cyan)]/20">
                                    <h3 className="text-xs font-black text-[var(--color-text-secondary)] flex items-center gap-2 mb-4">
                                        <BrainCircuit className="w-4 h-4 text-[var(--color-cyan)]" />
                                        {t("تحليل الذكاء الاصطناعي", "AI Insights")}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-[10px] text-[var(--color-cyan)] font-bold mb-1">{t("الحالة الحالية", "Current Status")}</p>
                                            <p className="text-sm font-bold text-[var(--color-text-primary)]">{t(pond.status === "Safe" ? "مستقرة وجيدة" : pond.status, pond.status)}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-[10px] text-[var(--color-cyan)] font-bold mb-1">{t("التوصية", "Recommendation")}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                                {pond.reason ? t(pond.reason, pond.reason) : t("الاستمرار في المراقبة الروتينية. لا توجد إجراءات تصحيحية مطلوبة حالياً.", "Continue routine monitoring. No corrective actions required at this time.")}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={handleDownloadReport}
                                            className="w-full btn-primary py-3 text-xs font-black flex items-center justify-center gap-2 mt-4 shadow-xl shadow-[var(--color-cyan)]/20"
                                        >
                                            <Download className="w-4 h-4" />
                                            {t("تحميل التقرير الكامل", "Download Full Report")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-input)]/50 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)] font-medium">
                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {t("حوض رقم", "Pond ID")}: {pond.id}</span>
                                <span className="flex items-center gap-1">• {t("تحديث مباشر", "Live Update")}</span>
                            </div>
                            <button onClick={onClose} className="btn-secondary px-6 py-2 text-xs font-bold">
                                {t("إغلاق", "Close")}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
