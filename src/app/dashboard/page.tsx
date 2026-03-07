"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Thermometer, Droplets, FlaskConical, Wind, Activity,
  AlertTriangle, CheckCircle2, Clock, Sparkles, Waves, Radio, Loader2
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";
import { MotionCard } from "@/components/motion/MotionCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchWeather, WeatherData } from "@/lib/weather/weatherService";

interface PondCurrent { Temperature: number; PH: number; Ammonia: number; DO: number; timestamp: string; }
interface PondAI { Status: string; Reason: string; AI_Confidence: string; }
interface PondData { id: string; current: PondCurrent; ai: PondAI; history: any[]; }

export default function DashboardPage() {
  const { t, lang } = useApp();
  const { profile } = useAuth();
  const [ponds, setPonds] = useState<PondData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePond, setActivePond] = useState("pond_1");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Weather Sync
    const loc = profile?.farm?.location || "Default";
    fetchWeather(loc).then(setWeather);

    const pondsRef = ref(database, "ponds");
    const unsub = onValue(pondsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const arr: PondData[] = Object.keys(data).map((key) => {
          const p = data[key];
          let hist: any[] = [];
          if (p.history?.readings) {
            hist = Object.values(p.history.readings)
              .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())
              .slice(-20) as any[];
          }
          return { id: key, current: p.current || {} as PondCurrent, ai: p.ai_result?.current || {} as PondAI, history: hist };
        });
        setPonds(arr);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [profile?.farm?.location]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[500px]">
        <div className="w-14 h-14 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const active = ponds.find((p) => p.id === activePond) || ponds[0];
  const totalPonds = ponds.length;

  const calcSafety = (p: PondData) => {
    if (!p?.current?.Temperature) return 0;
    let score = 100;
    if (p.current.Ammonia > 0.8) score -= 40; else if (p.current.Ammonia > 0.5) score -= 20;
    if (p.current.DO < 4.2) score -= 30; else if (p.current.DO < 5) score -= 10;
    if (p.current.Temperature > 32 || p.current.Temperature < 22) score -= 15;
    if (p.current.PH < 6.5 || p.current.PH > 8.5) score -= 15;
    return Math.max(0, score);
  };

  // Global Farm Status (for Header)
  const globalSafety = ponds.length > 0
    ? Math.round(ponds.reduce((acc, p) => acc + calcSafety(p), 0) / ponds.length)
    : 0;

  const globalSafetyText = globalSafety >= 75 ? t("ممتازة", "Excellent") : globalSafety >= 50 ? t("تحتاج انتباه", "Caution") : t("حرجة", "Critical");

  // Active Pond Status (for detailed view)
  const safety = active ? calcSafety(active) : 0;
  const safetyColor = safety >= 75 ? "#10b981" : safety >= 50 ? "#f59e0b" : "#ef4444";
  const safetyText = safety >= 75 ? t("آمن", "Safe") : safety >= 50 ? t("تحذير", "Warning") : t("خطر", "Danger");
  const waterQuality = safety >= 80 ? 92 : safety >= 50 ? 70 : 45;
  const aiReason = active?.ai?.Reason || t("جميع المعايير ضمن النطاق الآمن. الحوض في حالة مستقرة.", "All parameters within safe range. Pond is stable.");

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12
    ? t("صباح الخير", "Good Morning")
    : currentHour < 17
      ? t("نهار سعيد", "Good Afternoon")
      : t("مساء الخير", "Good Evening");

  const tooltipStyle = { backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text-primary)", borderRadius: "8px", fontSize: "12px" };

  return (
    <PageTransition>
      <div className="space-y-6 pb-8">
        {/* Header Briefing & Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MotionCard className="lg:col-span-2 bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-teal)] p-6 rounded-2xl relative overflow-hidden flex flex-col justify-center min-h-[160px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              {t(`${greeting} يا ${profile?.fullName?.split(' ')[0] || 'مدير المزرعة'}!`, `${greeting}, ${profile?.fullName?.split(' ')[0] || 'Manager'}!`)}
            </h2>
            <p className="text-white/80 text-sm max-w-md leading-relaxed">
              {t(
                `المزرعة في حالة ${globalSafetyText}. لديك ${ponds.filter(p => p.ai?.Status?.includes("Danger")).length} تنبيهات نشطة و ${totalPonds} أحواض تعمل بكفاءة.`,
                `The farm is in ${globalSafetyText} status. You have ${ponds.filter(p => p.ai?.Status?.includes("Danger")).length} active alerts and ${totalPonds} ponds running efficiently.`
              )}
            </p>
          </MotionCard>

          <MotionCard className="card bg-[var(--color-bg-card)] border-2 border-[var(--color-cyan)]/10 flex items-center gap-4 p-5">
            {weather ? (
              <>
                <div className="flex-1">
                  <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{t("حالة الطقس", "Weather Status")}</h3>
                  <div className="flex items-end gap-1 my-1">
                    <span className="text-3xl font-black text-[var(--color-text-primary)]">{Math.round(weather.temp)}°</span>
                    <span className="text-xs text-[var(--color-text-secondary)] mb-1">{t(weather.condition === 'sunny' ? 'مشمس' : 'غائم', weather.condition)}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-cyan)] font-medium">{t(weather.description_ar, weather.description_en)}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-input)] flex items-center justify-center text-4xl shadow-inner">
                  {weather.condition === 'sunny' ? '☀️' : weather.condition === 'cloudy' ? '☁️' : '🌧️'}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)] animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("جاري التحقق من الطقس...", "Checking Weather...")}
              </div>
            )}
          </MotionCard>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("إجمالي الأحواض", "Total Ponds"), value: totalPonds, icon: <Waves className="w-5 h-5 text-[var(--color-teal)]" />, iconBg: "bg-[var(--color-teal)]/10" },
            { label: t("جودة المياه (AQI)", "Water Quality (AQI)"), value: `${waterQuality}%`, icon: <Droplets className="w-5 h-5 text-[var(--color-cyan)]" />, iconBg: "bg-[var(--color-cyan)]/10" },
            { label: t("التنبيهات النشطة", "Active Alerts"), value: ponds.filter(p => p.ai?.Status?.includes("Danger")).length, icon: <AlertTriangle className="w-5 h-5 text-[#ef4444]" />, iconBg: "bg-[#ef4444]/10" },
            { label: t("المهام المجدولة", "Scheduled Tasks"), value: "08", icon: <Clock className="w-5 h-5 text-[#3b82f6]" />, iconBg: "bg-[#3b82f6]/10" },
          ].map((s, i) => (
            <MotionCard key={i} className="stat-card">
              <div className="flex-1">
                <p className="text-xs text-[var(--color-text-secondary)]">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center`}>{s.icon}</div>
            </MotionCard>
          ))}
        </div>

        {/* Pond Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-[var(--color-text-secondary)]">{t("تغيير حوض", "Switch Pond")}</span>
          <div className="flex gap-2 flex-wrap">
            {ponds.map((p, i) => (
              <button key={p.id} onClick={() => setActivePond(p.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activePond === p.id
                  ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] border border-[var(--color-cyan)]/30"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-cyan)]/30"}`}>
                {t(`حوض ${i + 1}`, `Pond ${i + 1}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Safety Gauge + Alerts */}
          <div className="xl:col-span-1 space-y-6">
            <MotionCard className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-input)] rounded-[var(--radius)] p-5 text-center shadow-[var(--card-shadow-base)] border border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">{t("مستوى السلامة العام", "Overall Safety Level")}</h3>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={safetyColor} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${safety * 3.14} ${314 - safety * 3.14}`} className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[var(--color-text-primary)]">{safety}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">{safetyText}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{t("تم تحليل جميع الأحواض بنجاح", "All ponds analyzed successfully")}</p>
            </MotionCard>

            <div className="card">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                {t("التنبيهات الأخيرة", "Recent Alerts")}
              </h3>
              <div className="space-y-3">
                {ponds.filter(p => p.ai?.Status && !p.ai.Status.includes("Safe")).slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-[var(--color-bg-input)]">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${p.ai.Status?.includes("Danger") ? "bg-[#ef4444]" : "bg-[#f59e0b]"}`} />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[var(--color-text-primary)]">{p.ai.Reason || t("تنبيه", "Alert")}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{p.id.replace("_", " ")} • {t("منذ دقائق", "minutes ago")}</p>
                    </div>
                  </div>
                ))}
                {ponds.filter(p => p.ai?.Status && !p.ai.Status.includes("Safe")).length === 0 && (
                  <div className="flex items-center gap-2 text-[#10b981] text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t("لا توجد تنبيهات حالياً", "No alerts currently")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sensor Data + Charts */}
          <div className="xl:col-span-3 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5 text-[var(--color-cyan)]" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {t(`بيانات الحوض المباشرة (#${activePond.replace("pond_", "")})`, `Live Pond Data (#${activePond.replace("pond_", "")})`)}
              </h3>
            </div>

            {/* Sensor Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t("درجة الحرارة (°)", "Temperature (°)"), val: active?.current?.Temperature?.toFixed(1), unit: "", icon: <Thermometer className="w-4 h-4 text-[#f59e0b]" />, bg: "bg-[#f59e0b]/10", color: "#f59e0b", key: "T", status: t("مستقر", "Stable") },
                { label: t("قوة الهيدروجين (PH)", "Power of hydrogen (PH)"), val: active?.current?.PH?.toFixed(1), unit: "", icon: <FlaskConical className="w-4 h-4 text-[#3b82f6]" />, bg: "bg-[#3b82f6]/10", color: "#3b82f6", key: "pH", status: t("نطاق مثالي", "Optimal Range") },
                { label: t("الأمونيا (NH3)", "Ammonia (NH3)"), val: active?.current?.Ammonia?.toFixed(2), unit: "", icon: <Wind className="w-4 h-4 text-[#ef4444]" />, bg: "bg-[#ef4444]/10", color: "#ef4444", key: "NH3", status: t("نسبة آمنة", "Safe Level") },
                { label: t("الأكسجين المذاب (DO)", "Dissolved Oxygen (DO)"), val: active?.current?.DO?.toFixed(1), unit: "", icon: <Droplets className="w-4 h-4 text-[#14b8a6]" />, bg: "bg-[#14b8a6]/10", color: "#14b8a6", key: "DO", status: t("كافي", "Sufficient") },
              ].map((s, i) => (
                <MotionCard key={i} className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                    <span className="text-xs text-[var(--color-text-secondary)]">{s.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">{s.val || "--"}<span className="text-sm text-[var(--color-text-muted)] mr-1">{s.unit}</span></p>
                  <div className="mt-3 h-12">
                    {active?.history.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={active.history.slice(-10)}>
                          <Line type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{s.status}</p>
                </MotionCard>
              ))}
            </div>

            {/* AI Recommendation */}
            <MotionCard className="bg-gradient-to-l from-[var(--color-cyan)]/10 to-transparent border border-[var(--color-cyan)]/20 rounded-xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-cyan)]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[var(--color-cyan)]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[var(--color-cyan)] mb-1">{t("توصية الذكاء الاصطناعي", "AI Recommendation")}</h4>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{aiReason}</p>
              </div>
            </MotionCard>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card">
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">{t("اتجاهات جودة المياه", "Water Quality Trends")}</h4>
                <div className="h-48">
                  {active?.history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={active.history}>
                        <XAxis dataKey="time" hide /><YAxis hide domain={["auto", "auto"]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={2} dot={false} name="pH" />
                        <Line type="monotone" dataKey="DO" stroke="#10b981" strokeWidth={2} dot={false} name="Oxygen" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-sm">{t("لا توجد بيانات تاريخية", "No historical data")}</div>
                  )}
                </div>
              </div>
              <div className="card">
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">{t("الأمونيا (NH3) ودرجة الحرارة (°)", "Ammonia (NH3) & Temperature (°)")}</h4>
                <div className="h-48">
                  {active?.history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={active.history}>
                        <XAxis dataKey="time" hide /><YAxis hide domain={["auto", "auto"]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="T" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temperature" />
                        <Line type="monotone" dataKey="NH3" stroke="#ef4444" strokeWidth={2} dot={false} name="NH3" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-sm">{t("لا توجد بيانات تاريخية", "No historical data")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
