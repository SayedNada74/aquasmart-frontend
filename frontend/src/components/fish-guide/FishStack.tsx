"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FishSpecies } from "@/app/data/fishGuideData";
import { useApp } from "@/lib/AppContext";
import { 
    Thermometer, 
    Droplets, 
    Utensils, 
    AlertCircle, 
    TrendingUp, 
    Sparkles,
    CheckCircle2,
    Info,
    ArrowRight,
    Search
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FishStackProps {
    fish: FishSpecies;
}

export function FishStack({ fish }: FishStackProps) {
    const { t, lang } = useApp();
    const router = useRouter();
    const isRtl = lang === "ar";

    const handleAskAI = () => {
        const query = lang === "ar" ? fish.aiQueryAr : fish.aiQueryEn;
        router.push(`/ai-center?query=${encodeURIComponent(query)}`);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto mt-12 px-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={fish.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="relative z-20"
                >
                    {/* Background Stack Decoration */}
                    <div className="absolute -inset-4 bg-[var(--color-cyan)]/5 rounded-[2rem] -rotate-2 scale-105 pointer-events-none border border-[var(--color-cyan)]/10" />
                    <div className="absolute -inset-4 bg-[var(--color-teal)]/5 rounded-[2rem] rotate-1 scale-102 pointer-events-none border border-[var(--color-teal)]/10" />

                    <div className="card overflow-hidden !rounded-[2rem] shadow-2xl border-2 border-[var(--color-cyan)]/20 shadow-[var(--color-cyan)]/5">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            
                            {/* Visual Content */}
                            <div className="relative h-64 lg:h-full min-h-[300px] lg:min-h-[400px]">
                                <img 
                                    src={fish.image} 
                                    alt={fish.nameEn} 
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(lang === "ar" ? fish.smartTagsAr : fish.smartTagsEn).map((tag, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-[var(--color-cyan)]/20 backdrop-blur-md border border-[var(--color-cyan)]/30 text-[10px] font-bold text-white uppercase tracking-wider">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-2">{t(fish.nameAr, fish.nameEn)}</h2>
                                    <p className="text-white/80 text-sm leading-relaxed">{t(fish.descriptionAr, fish.descriptionEn)}</p>
                                </div>
                            </div>

                            {/* Details Content */}
                            <div className="p-6 md:p-8 lg:p-10 space-y-8">
                                
                                {/* Suitability & Market */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                                        <div className="flex items-center gap-2 mb-2 text-[#10b981]">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t("مؤشر المناسبة", "Suitability")}</span>
                                        </div>
                                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{t(fish.suitabilityLabelAr, fish.suitabilityLabelEn)}</p>
                                        <div className="mt-2 h-1.5 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#10b981]" style={{ width: `${fish.suitabilityScore * 10}%` }} />
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 rounded-2xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                                        <div className="flex items-center gap-2 mb-2 text-[var(--color-cyan)]">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t("رؤية السوق", "Market Insight")}</span>
                                        </div>
                                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{t(fish.marketInsightAr, fish.marketInsightEn)}</p>
                                    </div>
                                </div>

                                {/* Vital Stats */}
                                <div className="grid grid-cols-2 gap-6">
                                    <StatItem icon={<Thermometer className="text-orange-500" />} label={t("الحرارة المثالية", "Ideal Temp")} value={fish.idealTemp} />
                                    <StatItem icon={<Droplets className="text-blue-500" />} label={t("جودة المياه", "Water Quality")} value={fish.idealWater} />
                                    <StatItem icon={<Utensils className="text-[var(--color-teal)]" />} label={t("نوع التغذية", "Feeding")} value={t(fish.feedingAr, fish.feedingEn)} />
                                    <StatItem icon={<AlertCircle className="text-red-500" />} label={t("الأمراض الشائعة", "Common Issues")} value={t(fish.diseasesAr, fish.diseasesEn)} />
                                </div>

                                {/* Market Price */}
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--color-cyan)]/5 border-2 border-dashed border-[var(--color-cyan)]/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-cyan)]/20 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-[var(--color-cyan)]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest">{t("السعر المتوقع", "Market Price")}</p>
                                            <p className="text-lg font-black text-[var(--color-text-primary)]">{t(fish.marketPriceAr, fish.marketPriceEn)}</p>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-lg bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] text-xs font-bold`}>{t("مطلوب تجارياً", "High Demand")}</div>
                                </div>

                                {/* AI Action */}
                                <button 
                                    onClick={handleAskAI}
                                    className="w-full btn-primary !h-14 flex items-center justify-center gap-3 text-lg font-bold group shadow-xl shadow-[var(--color-cyan)]/20"
                                >
                                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                    {t("اسأل الذكاء الاصطناعي عن هذا النوع", "Ask AI About This Fish")}
                                    <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-base)] flex items-center justify-center flex-shrink-0 mt-1">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-2">{value}</p>
            </div>
        </div>
    );
}
