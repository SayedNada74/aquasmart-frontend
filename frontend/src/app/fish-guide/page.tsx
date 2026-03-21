"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";
import { motion } from "framer-motion";
import { fishGuideData } from "@/app/data/fishGuideData";
import { InfiniteMenu } from "@/components/fish-guide/InfiniteMenu";
import { FishStack } from "@/components/fish-guide/FishStack";
import { HelpCircle, Info, Sparkles, Waves } from "lucide-react";

export default function FishGuidePage() {
    const { t, lang } = useApp();
    const [selectedFishId, setSelectedFishId] = useState(fishGuideData[0].id);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentIndex = fishGuideData.findIndex(f => f.id === selectedFishId);
            const isRtl = lang === "ar";
            
            if (e.key === "ArrowRight") {
                const nextIndex = isRtl 
                    ? (currentIndex > 0 ? currentIndex - 1 : fishGuideData.length - 1)
                    : (currentIndex < fishGuideData.length - 1 ? currentIndex + 1 : 0);
                setSelectedFishId(fishGuideData[nextIndex].id);
            } else if (e.key === "ArrowLeft") {
                const prevIndex = isRtl 
                    ? (currentIndex < fishGuideData.length - 1 ? currentIndex + 1 : 0)
                    : (currentIndex > 0 ? currentIndex - 1 : fishGuideData.length - 1);
                setSelectedFishId(fishGuideData[prevIndex].id);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedFishId, lang]);

    const selectedFish = fishGuideData.find(f => f.id === selectedFishId) || fishGuideData[0];

    return (
        <PageTransition>
            <div className="space-y-0 pb-20">
                
                {/* Hero Section */}
                <section className="relative pt-12 pb-20 px-6 overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[var(--color-cyan)]/10 blur-[120px] rounded-full -z-10" />
                    
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/20 text-[var(--color-cyan)] text-xs font-bold uppercase tracking-widest"
                        >
                            <Sparkles className="w-4 h-4" />
                            {t("معلومات حصرية للمزارع المصرية", "Exclusive Insights for Egyptian Farms")}
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-[var(--color-text-primary)] leading-tight"
                        >
                            {t("دليلك لأنواع السمك في مصر", "Your Guide to Fish Types in Egypt")}
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed"
                        >
                            {t("استكشف أفضل أنواع الأسماك للاستزراع المائي في مصر، واعرف أسرار كل نوع لتحقيق أعلى إنتاجية.", "Explore the best fish species for aquaculture in Egypt, and learn the secrets of each type to achieve maximum productivity.")}
                        </motion.p>
                    </div>
                </section>

                {/* Infinite Menu Section */}
                <section className="space-y-6">
                    <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                         <h3 className="text-sm font-black text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-2">
                            <Waves className="w-5 h-5 text-[var(--color-cyan)]" />
                            {t("اختر نوع السمك", "Select Species")}
                         </h3>
                         <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] font-bold">
                            <Info className="w-3 h-3" />
                            {t("مرر لليسار أو اليمين لتصفح القائمة", "Swipe left/right to browse items")}
                         </div>
                    </div>
                    
                    <InfiniteMenu 
                        data={fishGuideData} 
                        selectedId={selectedFishId} 
                        onSelect={setSelectedFishId} 
                    />
                </section>

                {/* Stack Details Section */}
                <section>
                    <FishStack fish={selectedFish} />
                </section>

                {/* Contextual Info */}
                <section className="max-w-4xl mx-auto mt-20 px-6">
                    <div className="py-8 px-10 rounded-[2rem] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-base)] border border-[var(--color-border)] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-3">
                            <h4 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                <HelpCircle className="w-6 h-6 text-[var(--color-cyan)]" />
                                {t("هل تحتاج لمعلومات أكثر تخصصاً؟", "Need more specialized info?")}
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                {t("يمكنك دائماً سؤال الذكاء الاصطناعي الخاص بـ AquaSmart عن أي تفاصيل دقيقة تتعلق بنوع معين أو بأمراض محددة تواجهها في مزرعتك.", "You can always ask AquaSmart AI about any specific details regarding a species or particular diseases you face on your farm.")}
                            </p>
                        </div>
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="px-8 py-3 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-sm hover:border-[var(--color-cyan)]/50 transition-all flex-shrink-0"
                        >
                            {t("عد للأعلى وتصفح الأنواع", "Back to Selection")}
                        </button>
                    </div>
                </section>

            </div>
        </PageTransition>
    );
}
