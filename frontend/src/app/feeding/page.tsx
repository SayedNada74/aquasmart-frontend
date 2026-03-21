"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Utensils, 
  Info, 
  Thermometer, 
  Scale, 
  ChevronRight, 
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";
import { MotionCard } from "@/components/motion/MotionCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/lib/auth/AuthProvider";

type FishSpecies = "tilapia" | "mullet" | "carp" | "catfish";

interface FeedingRecommendation {
  dailyRate: number; // percentage of body weight
  totalFeedKg: number;
  frequency: number; // times per day
  strategy_ar: string;
  strategy_en: string;
  tempAdjustment: number;
}

export default function FeedingPage() {
  const { t, lang } = useApp();
  const { profile } = useAuth();
  const { weather } = useDashboardData(profile?.farm?.location);
  
  const [species, setSpecies] = useState<FishSpecies>("tilapia");
  const [avgWeight, setAvgWeight] = useState<number>(250);
  const [fishCount, setFishCount] = useState<number>(10000);
  const [temp, setTemp] = useState<number>(28);

  const speciesList: FishSpecies[] = ["tilapia", "catfish", "mullet", "carp"];

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = speciesList.indexOf(species);
      const isRtl = lang === "ar";

      if (e.key === "ArrowRight") {
        const nextIndex = isRtl
          ? (currentIndex > 0 ? currentIndex - 1 : speciesList.length - 1)
          : (currentIndex < speciesList.length - 1 ? currentIndex + 1 : 0);
        setSpecies(speciesList[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        const prevIndex = isRtl
          ? (currentIndex < speciesList.length - 1 ? currentIndex + 1 : 0)
          : (currentIndex > 0 ? currentIndex - 1 : speciesList.length - 1);
        setSpecies(speciesList[prevIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [species, lang]);

  // Sync with real weather when available
  useEffect(() => {
    if (weather?.temp) {
      setTemp(Math.round(weather.temp));
    }
  }, [weather]);

  const recommendation = useMemo((): FeedingRecommendation => {
    let baseRate = 2.0; // Default for 250g Tilapia
    
    // 1. Base Rate by Species and Weight
    if (species === "tilapia") {
      if (avgWeight < 1) baseRate = 20.0;
      else if (avgWeight < 10) baseRate = 10.0;
      else if (avgWeight < 50) baseRate = 5.0;
      else if (avgWeight < 200) baseRate = 3.0;
      else if (avgWeight < 500) baseRate = 2.0;
      else baseRate = 1.2;
    } else if (species === "catfish") {
        baseRate = avgWeight < 10 ? 8.0 : avgWeight < 100 ? 5.0 : 2.5;
    } else {
        baseRate = 2.5; // Average fallback
    }

    // 2. Temperature Adjustment
    let tempFactor = 1.0;
    if (temp < 20) tempFactor = 0.4;
    else if (temp < 24) tempFactor = 0.8;
    else if (temp <= 30) tempFactor = 1.0; // Optimal
    else if (temp <= 33) tempFactor = 0.7;
    else tempFactor = 0.2; // Critical Heat

    const finalRate = baseRate * tempFactor;
    const biomassKg = (avgWeight * fishCount) / 1000;
    const totalFeed = (biomassKg * finalRate) / 100;

    // 3. Frequency
    let frequency = 2;
    if (avgWeight < 10) frequency = 6;
    else if (avgWeight < 100) frequency = 4;
    else frequency = 2;

    const strategy_ar = tempFactor < 0.5 
        ? "درجة الحرارة غير مناسبة للتغذية المكثفة. قلل الكمية لتجنب تلوث المياه." 
        : "درجة الحرارة مثالية. وزع الكمية على وجبات منتظمة لضمان أفضل تحويل غذائي.";
    const strategy_en = tempFactor < 0.5 
        ? "Temperature is not suitable for heavy feeding. Reduce amount to avoid water pollution." 
        : "Optimal temperature. Distribute feedings regularly for best conversion ratio.";

    return {
      dailyRate: finalRate,
      totalFeedKg: totalFeed,
      frequency,
      strategy_ar,
      strategy_en,
      tempAdjustment: tempFactor
    };
  }, [species, avgWeight, fishCount, temp]);

  const isRtl = lang === "ar";

  return (
    <PageTransition>
      <div className="space-y-6 pb-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="print:text-black">
            <h1 className="text-2xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
              <Utensils className="w-7 h-7 text-[var(--color-cyan)] print:text-black" />
              {t("حاسبة التغذية الذكية", "Smart Feeding Calculator")}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 print:text-black">
              {t("نظام مدعوم بالذكاء الاصطناعي لتحسين معدل التحويل الغذائي (FCR)", "AI-powered system to optimize Feed Conversion Ratio (FCR)")}
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl print:border-black">
             <div className="w-8 h-8 rounded-lg bg-[var(--color-cyan)]/10 flex items-center justify-center print:hidden">
                <Thermometer className="w-4 h-4 text-[var(--color-cyan)]" />
             </div>
             <div>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold print:text-black">{t("الحرارة الحالية", "Current Temp")}</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)] print:text-black">{temp}°C</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs Section */}
          <div className="lg:col-span-7 space-y-6">
            <MotionCard className="card print:hidden">
              <div className="flex items-center gap-2 mb-6 border-b border-[var(--color-border)] pb-4">
                 <Scale className="w-5 h-5 text-[var(--color-cyan)]" />
                 <h3 className="font-bold text-[var(--color-text-primary)]">{t("بيانات الأحياء", "Biological Data")}</h3>
              </div>

              <div className="space-y-6">
                {/* Species Selector */}
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-3">{t("نوع السمك", "Fish Species")}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: "tilapia", ar: "بلطي", en: "Tilapia" },
                      { id: "catfish", ar: "قرموط", en: "Catfish" },
                      { id: "mullet", ar: "بوري", en: "Mullet" },
                      { id: "carp", ar: "مبروك", en: "Carp" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSpecies(item.id as FishSpecies)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          species === item.id 
                          ? "bg-[var(--color-cyan)] border-[var(--color-cyan)] text-white shadow-lg shadow-[var(--color-cyan)]/20" 
                          : "bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-cyan)]/50"
                        }`}
                      >
                        {t(item.ar, item.en)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Avg Weight Slider */}
                   <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase">{t("متوسط الوزن", "Avg Weight")}</label>
                        <span className="text-sm font-black text-[var(--color-cyan)]">{avgWeight} <span className="text-[10px]">{t("جرام", "g")}</span></span>
                      </div>
                      <input 
                        type="range" min="1" max="1000" step="5"
                        value={avgWeight} onChange={(e) => setAvgWeight(Number(e.target.value))}
                        className="w-full h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--color-cyan)]"
                      />
                      <div className="flex justify-between mt-1 text-[9px] text-[var(--color-text-muted)] font-bold">
                        <span>1g</span>
                        <span>500g</span>
                        <span>1kg</span>
                      </div>
                   </div>

                   {/* Fish Count */}
                   <div>
                      <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-2">{t("عدد الأسماك (تقريبي)", "Fish Count (Approx)")}</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={fishCount} onChange={(e) => setFishCount(Number(e.target.value))}
                          className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--color-text-primary)] focus:border-[var(--color-cyan)] outline-none transition-colors"
                        />
                        <div className={`absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] ${isRtl ? 'left-4' : 'right-4'}`}>
                           <Info className="w-4 h-4" />
                        </div>
                      </div>
                   </div>
                </div>

                {/* Temp Control (Manual Override) */}
                <div>
                   <div className="flex items-center justify-between mb-2">
                     <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase">{t("درجة حرارة المياه", "Water Temperature")}</label>
                     <span className={`text-sm font-black ${recommendation.tempAdjustment < 0.6 ? 'text-[#ef4444]' : 'text-[var(--color-cyan)]'}`}>{temp}°C</span>
                   </div>
                   <input 
                      type="range" min="10" max="40" 
                      value={temp} onChange={(e) => setTemp(Number(e.target.value))}
                      className="w-full h-2 bg-[var(--color-bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--color-cyan)]"
                    />
                </div>
              </div>
            </MotionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
               <MotionCard className="card bg-[var(--color-cyan)]/5 border border-[var(--color-cyan)]/20 p-4 print:bg-white print:border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-cyan)]/20 flex items-center justify-center print:hidden">
                      <Sparkles className="w-4 h-4 text-[var(--color-cyan)]" />
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text-primary)] print:text-black">{t("الاستراتيجية المقترحة", "AI Strategy")}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed print:text-black">
                    {t(recommendation.strategy_ar, recommendation.strategy_en)}
                  </p>
               </MotionCard>

               <MotionCard className="card bg-yellow-500/5 border border-yellow-500/20 p-4 print:bg-white print:border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center print:hidden">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text-primary)] print:text-black">{t("تنبيه جودة المياه", "Water Quality Note")}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed print:text-black">
                    {t("نصف كمية علف زائدة كفيلة برفع الأمونيا لمستويات سامة. التزم بالكمية المحسوبة.", "Half of excess feed is enough to raise ammonia to toxic levels. Stick to the calculated amount.")}
                  </p>
               </MotionCard>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-5 space-y-6">
             <MotionCard className="card border-2 border-[var(--color-cyan)] shadow-xl shadow-[var(--color-cyan)]/5 overflow-hidden print:border-black print:shadow-none">
                <div className="bg-[var(--color-cyan)] p-6 text-white relative print:bg-white print:text-black print:border-b print:border-black">
                   <div className="absolute top-0 right-0 p-8 opacity-10 print:hidden">
                      <Utensils className="w-24 h-24" />
                   </div>
                   <p className="text-xs font-bold uppercase tracking-widest opacity-80 print:text-black">{t("الاحتياج اليومي الإجمالي", "Total Daily Requirement")}</p>
                   <h2 className="text-4xl md:text-5xl font-black mt-2 print:text-black">
                      {recommendation.totalFeedKg.toFixed(1)} <span className="text-xl opacity-80">{t("كجم", "Kg")}</span>
                   </h2>

                   <div className="mt-4 flex items-center gap-2 text-sm font-bold print:text-black">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse print:hidden" />
                      {t(`معدل التغذية: ${recommendation.dailyRate.toFixed(2)}% من الكتلة الحية`, `Feeding Rate: ${recommendation.dailyRate.toFixed(2)}% of biomass`)}
                   </div>
                </div>

                <div className="p-6 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-input)] flex items-center justify-center print:hidden">
                            <Clock className="w-5 h-5 text-[var(--color-text-secondary)]" />
                         </div>
                         <div>
                            <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase print:text-black">{t("عدد الوجبات", "Feeding Frequency")}</p>
                            <p className="text-lg font-black text-[var(--color-text-primary)] print:text-black">{recommendation.frequency} {t("وجبات في اليوم", "meals per day")}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase print:text-black">{t("لكل وجبة", "Per Meal")}</p>
                         <p className="text-lg font-black text-[var(--color-cyan)] print:text-black">{(recommendation.totalFeedKg / recommendation.frequency).toFixed(1)} كجم</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider print:text-black">{t("الجدول الزمني المقترح", "Suggested Schedule")}</p>
                      {Array.from({ length: recommendation.frequency }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] print:border-black print:bg-white">
                           <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-[var(--color-cyan)] text-white text-[10px] font-bold flex items-center justify-center print:bg-black print:text-white">{i + 1}</span>
                              <span className="text-sm font-bold text-[var(--color-text-primary)] print:text-black">
                                 {i === 0 ? "08:00 AM" : i === 1 ? "04:30 PM" : i === 2 ? "11:00 AM" : "01:00 PM"}
                              </span>
                           </div>
                           <span className="text-xs font-bold text-[var(--color-text-secondary)] print:text-black">{(recommendation.totalFeedKg / recommendation.frequency).toFixed(1)} {t("كجم", "Kg")}</span>
                        </div>
                      ))}
                   </div>

                   <button 
                    onClick={() => window.print()}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 print:hidden"
                   >
                      {t("تخصيص وطباعة التقرير", "Customize & Print Report")}
                      <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                   </button>
                </div>
             </MotionCard>

             <MotionCard className="card p-5 border-dashed bg-transparent print:hidden">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-[var(--color-cyan)]/10 flex items-center justify-center flex-shrink-0">
                      <Info className="w-5 h-5 text-[var(--color-cyan)]" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{t("كيف تحسن الـ FCR؟", "How to improve FCR?")}</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                         {t("معدل التحويل الغذائي المثالي للبلطي هو 1.2-1.5. إذا كان استهلاكك أعلى من ذلك، فربما هناك هدر في العلف أو جودة المياه تحتاج لتحسين.", "Ideal FCR for Tilapia is 1.2-1.5. If your consumption is higher, you might be wasting feed or water quality needs improvement.")}
                      </p>
                   </div>
                </div>
             </MotionCard>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
