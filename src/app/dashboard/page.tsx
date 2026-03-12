"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Thermometer,
  Droplets,
  FlaskConical,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Waves,
  Radio,
  Loader2,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";
import { MotionCard } from "@/components/motion/MotionCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getHealthStatus } from "@/lib/farmHealth";
import { useDashboardData } from "@/hooks/useDashboardData";

type RecommendationSeverity = "safe" | "warning" | "danger";

export default function DashboardPage() {
  const { t, lang } = useApp();
  const { profile } = useAuth();
  const { ponds, weather, recentAlerts, metrics, loading } = useDashboardData(profile?.farm?.location);
  const [activePond, setActivePond] = useState("pond_1");

  useEffect(() => {
    if (!ponds.length) return;
    const exists = ponds.some((pond) => pond.id === activePond);
    if (!exists) {
      setActivePond(ponds[0].id);
    }
  }, [activePond, ponds]);

  const active = ponds.find((pond) => pond.id === activePond) || ponds[0];
  const selectedPondNumber = active?.id.replace("pond_", "") || "1";
  const selectedPondLabel = t(`حوض ${selectedPondNumber}`, `Pond ${selectedPondNumber}`);

  const selectedPondSafety = active?.score ?? 0;
  const selectedPondSafetyStatus: RecommendationSeverity =
    selectedPondSafety >= 85 ? "safe" : selectedPondSafety >= 60 ? "warning" : "danger";
  const selectedPondSafetyColor =
    selectedPondSafetyStatus === "safe" ? "#10b981" : selectedPondSafetyStatus === "warning" ? "#f59e0b" : "#ef4444";
  const selectedPondSafetyText =
    selectedPondSafetyStatus === "safe"
      ? t("ممتازة", "Excellent")
      : selectedPondSafetyStatus === "warning"
        ? t("تحتاج انتباه", "Caution")
        : t("حرجة", "Critical");

  const recommendation = useMemo(() => {
    if (!active) {
      return {
        ar: "جاري تحليل حالة الحوض المحدد...",
        en: "Analyzing the selected pond status...",
        severity: "safe" as RecommendationSeverity,
      };
    }

    const { DO, Ammonia, PH, Temperature } = active.current;
    const aiStatus = active.ai.Status || "";

    if (typeof Ammonia === "number" && Ammonia > 0.8) {
      return {
        ar: "مستوى الأمونيا مرتفع في هذا الحوض. يُفضل تدخل فوري لتحسين جودة المياه.",
        en: "Ammonia levels are elevated in this pond. Water quality intervention is recommended immediately.",
        severity: "danger" as RecommendationSeverity,
      };
    }

    if (typeof DO === "number" && DO < 4.2) {
      return {
        ar: "الأكسجين المذاب منخفض في هذا الحوض. فكر في تشغيل البدالات فورًا.",
        en: "Low dissolved oxygen detected in this pond. Consider activating the aerators immediately.",
        severity: "danger" as RecommendationSeverity,
      };
    }

    if (typeof Ammonia === "number" && Ammonia > 0.5) {
      return {
        ar: "الأمونيا أعلى من المثالي في هذا الحوض. راقب التهوية وجدول تغيير المياه.",
        en: "Ammonia is above the ideal range in this pond. Monitor aeration and the water exchange schedule closely.",
        severity: "warning" as RecommendationSeverity,
      };
    }

    if (typeof DO === "number" && DO < 5) {
      return {
        ar: "مستوى الأكسجين أقل من المثالي لهذا الحوض. متابعة التهوية موصى بها.",
        en: "Dissolved oxygen is below the ideal target for this pond. Aeration should be monitored closely.",
        severity: "warning" as RecommendationSeverity,
      };
    }

    if (typeof PH === "number" && (PH < 6.5 || PH > 8.5)) {
      return {
        ar: "قيمة الحموضة خارج النطاق المثالي في هذا الحوض. راقب توازن المياه خلال الدورة القادمة.",
        en: "The pH level is outside the optimal range in this pond. Monitor water balance during the next cycle.",
        severity: "warning" as RecommendationSeverity,
      };
    }

    if (typeof Temperature === "number" && (Temperature < 22 || Temperature > 32)) {
      return {
        ar: "درجة حرارة المياه غير مثالية في هذا الحوض. راقب الحمل الحيوي والتهوية.",
        en: "Water temperature is outside the ideal range in this pond. Monitor biological load and aeration.",
        severity: "warning" as RecommendationSeverity,
      };
    }

    if (aiStatus.includes("Danger")) {
      return {
        ar: "الذكاء الاصطناعي رصد خطرًا في هذا الحوض. راجع القراءات الحالية ونفّذ إجراءً تصحيحيًا.",
        en: "AI detected a risk in this pond. Review the live readings and apply corrective action now.",
        severity: "danger" as RecommendationSeverity,
      };
    }

    if (aiStatus.includes("Warning") || getHealthStatus(selectedPondSafety) === "warning") {
      return {
        ar: "حالة الحوض مستقرة نسبيًا ولكن تحتاج متابعة قريبة خلال الساعات القادمة.",
        en: "This pond is relatively stable, but it needs closer monitoring over the next few hours.",
        severity: "warning" as RecommendationSeverity,
      };
    }

    return {
      ar: "ظروف المياه مستقرة في هذا الحوض. لا يوجد إجراء فوري مطلوب.",
      en: "Water conditions are stable in this pond. No immediate action is required.",
      severity: "safe" as RecommendationSeverity,
    };
  }, [active, selectedPondSafety]);

  const recommendationStyles =
    recommendation.severity === "danger"
      ? {
          card: "from-[#ef4444]/10 to-transparent border-[#ef4444]/20",
          icon: "bg-[#ef4444]/10",
          iconColor: "text-[#ef4444]",
          title: "text-[#ef4444]",
        }
      : recommendation.severity === "warning"
        ? {
            card: "from-[#f59e0b]/10 to-transparent border-[#f59e0b]/20",
            icon: "bg-[#f59e0b]/10",
            iconColor: "text-[#f59e0b]",
            title: "text-[#f59e0b]",
          }
        : {
            card: "from-[var(--color-cyan)]/10 to-transparent border-[var(--color-cyan)]/20",
            icon: "bg-[var(--color-cyan)]/10",
            iconColor: "text-[var(--color-cyan)]",
            title: "text-[var(--color-cyan)]",
          };

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? t("صباح الخير", "Good Morning") : currentHour < 17 ? t("نهار سعيد", "Good Afternoon") : t("مساء الخير", "Good Evening");

  const tooltipStyle = {
    backgroundColor: "var(--color-bg-card)",
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
    borderRadius: "8px",
    fontSize: "12px",
  };

  const weatherLabel = useMemo(() => {
    if (!weather) return "";
    if (weather.condition === "sunny") return t("مشمس", "Sunny");
    if (weather.condition === "windy") return t("رياح", "Windy");
    if (weather.condition === "rainy") return t("ممطر", "Rainy");
    return t("غائم", "Cloudy");
  }, [t, weather]);

  const formatTimeAgo = (timestamp: number) => {
    const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMinutes < 1) return t("الآن", "Just now");
    if (diffMinutes < 60) return t(`منذ ${diffMinutes} دقيقة`, `${diffMinutes} min ago`);
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return t(`منذ ${hours} ساعة`, `${hours} hours ago`);
    return new Date(timestamp).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US");
  };

  const sensorCards = active
    ? [
        {
          label: t("درجة الحرارة (°)", "Temperature (°)"),
          value: active.current.Temperature?.toFixed(1),
          icon: <Thermometer className="w-4 h-4 text-[#f59e0b]" />,
          bg: "bg-[#f59e0b]/10",
          color: "#f59e0b",
          key: "T",
          status:
            typeof active.current.Temperature === "number" && active.current.Temperature >= 22 && active.current.Temperature <= 32
              ? t("مستقر", "Stable")
              : t("يحتاج مراجعة", "Needs review"),
        },
        {
          label: t("قوة الهيدروجين (PH)", "Power of hydrogen (PH)"),
          value: active.current.PH?.toFixed(1),
          icon: <FlaskConical className="w-4 h-4 text-[#3b82f6]" />,
          bg: "bg-[#3b82f6]/10",
          color: "#3b82f6",
          key: "pH",
          status:
            typeof active.current.PH === "number" && active.current.PH >= 6.5 && active.current.PH <= 8.5
              ? t("نطاق مثالي", "Optimal Range")
              : t("خارج النطاق", "Out of range"),
        },
        {
          label: t("الأمونيا (NH3)", "Ammonia (NH3)"),
          value: active.current.Ammonia?.toFixed(2),
          icon: <Wind className="w-4 h-4 text-[#ef4444]" />,
          bg: "bg-[#ef4444]/10",
          color: "#ef4444",
          key: "NH3",
          status:
            typeof active.current.Ammonia === "number" && active.current.Ammonia <= 0.5
              ? t("نسبة آمنة", "Safe Level")
              : t("تحتاج تدخل", "Needs action"),
        },
        {
          label: t("الأكسجين المذاب (DO)", "Dissolved Oxygen (DO)"),
          value: active.current.DO?.toFixed(1),
          icon: <Droplets className="w-4 h-4 text-[#14b8a6]" />,
          bg: "bg-[#14b8a6]/10",
          color: "#14b8a6",
          key: "DO",
          status:
            typeof active.current.DO === "number" && active.current.DO >= 5
              ? t("كافي", "Sufficient")
              : t("منخفض", "Low"),
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[500px]">
        <div className="w-14 h-14 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MotionCard className="lg:col-span-2 bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-teal)] p-6 rounded-2xl relative overflow-hidden flex flex-col justify-center min-h-[160px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              {t(`${greeting} يا ${profile?.fullName?.split(" ")[0] || "مدير المزرعة"}!`, `${greeting}, ${profile?.fullName?.split(" ")[0] || "Manager"}!`)}
            </h2>
            <p className="text-white/80 text-sm max-w-md leading-relaxed">
              {t(
                `المزرعة في حالة جيدة. لديك ${metrics.activeAlerts} تنبيهات نشطة و ${metrics.totalPonds} أحواض تعمل بكفاءة.`,
                `The farm is in good shape. You have ${metrics.activeAlerts} active alerts and ${metrics.totalPonds} ponds running efficiently.`,
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
                    <span className="text-xs text-[var(--color-text-secondary)] mb-1">{weatherLabel}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-cyan)] font-medium">{t(weather.description_ar, weather.description_en)}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-input)] flex items-center justify-center text-4xl shadow-inner">
                  {weather.condition === "sunny" ? "☀️" : weather.condition === "cloudy" ? "☁️" : weather.condition === "windy" ? "🌬️" : "🌧️"}
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("إجمالي الأحواض", "Total Ponds"), value: metrics.totalPonds, icon: <Waves className="w-5 h-5 text-[var(--color-teal)]" />, iconBg: "bg-[var(--color-teal)]/10" },
            { label: t("جودة المياه (AQI)", "Water Quality (AQI)"), value: `${metrics.waterQuality}%`, icon: <Droplets className="w-5 h-5 text-[var(--color-cyan)]" />, iconBg: "bg-[var(--color-cyan)]/10" },
            { label: t("التنبيهات النشطة", "Active Alerts"), value: metrics.activeAlerts, icon: <AlertTriangle className="w-5 h-5 text-[#ef4444]" />, iconBg: "bg-[#ef4444]/10" },
            { label: t("المهام المجدولة", "Scheduled Tasks"), value: metrics.scheduledTasks, icon: <Clock className="w-5 h-5 text-[#3b82f6]" />, iconBg: "bg-[#3b82f6]/10" },
          ].map((stat, index) => (
            <MotionCard key={index} className="stat-card">
              <div className="flex-1">
                <p className="text-xs text-[var(--color-text-secondary)]">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>{stat.icon}</div>
            </MotionCard>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-[var(--color-text-secondary)]">{t("تغيير حوض", "Switch Pond")}</span>
          <div className="flex gap-2 flex-wrap">
            {ponds.map((pond, index) => (
              <button
                key={pond.id}
                onClick={() => setActivePond(pond.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activePond === pond.id
                    ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] border border-[var(--color-cyan)]/30"
                    : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-cyan)]/30"
                }`}
              >
                {t(`حوض ${index + 1}`, `Pond ${index + 1}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <MotionCard className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-input)] rounded-[var(--radius)] p-5 text-center shadow-[var(--card-shadow-base)] border border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">{t("مستوى السلامة العام", "Overall Safety Level")}</h3>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={selectedPondSafetyColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${selectedPondSafety * 3.14} ${314 - selectedPondSafety * 3.14}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[var(--color-text-primary)]">{selectedPondSafety}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">{selectedPondSafetyText}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                {t(`تم حساب مستوى السلامة الحالي لـ ${selectedPondLabel} بناءً على قراءاته المباشرة`, `The safety score shown here is calculated for ${selectedPondLabel} only from its live readings`)}
              </p>
            </MotionCard>

            <div className="card">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                {t("التنبيهات الأخيرة", "Recent Alerts")}
              </h3>
              <div className="space-y-3">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alert) => {
                    const isDanger = alert.type === "danger";
                    return (
                      <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg bg-[var(--color-bg-input)]">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isDanger ? "bg-[#ef4444]" : "bg-[#f59e0b]"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isDanger ? "bg-[#ef4444]/10 text-[#ef4444]" : "bg-[#f59e0b]/10 text-[#f59e0b]"}`}>
                              {isDanger ? t("حرج", "Critical") : t("تحذير", "Warning")}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">{formatTimeAgo(alert.timestamp)}</span>
                          </div>
                          <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{t(alert.desc_ar, alert.desc_en)}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{t(alert.pondLabelAr, alert.pondLabelEn)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center gap-2 text-[#10b981] text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t("لا توجد تنبيهات حاليًا", "No alerts currently")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5 text-[var(--color-cyan)]" />
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {active ? t(`بيانات الحوض المباشرة (#${active.id.replace("pond_", "")})`, `Live Pond Data (#${active.id.replace("pond_", "")})`) : t("بيانات الحوض المباشرة", "Live Pond Data")}
              </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {sensorCards.map((sensor, index) => (
                <MotionCard key={index} className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${sensor.bg} flex items-center justify-center`}>{sensor.icon}</div>
                    <span className="text-xs text-[var(--color-text-secondary)]">{sensor.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">{sensor.value || "--"}</p>
                  <div className="mt-3 h-12">
                    {active?.history.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={active.history.slice(-10)}>
                          <Line type="monotone" dataKey={sensor.key} stroke={sensor.color} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{sensor.status}</p>
                </MotionCard>
              ))}
            </div>

            <MotionCard className={`bg-gradient-to-l ${recommendationStyles.card} border rounded-xl p-5 flex items-start gap-4`}>
              <div className={`w-12 h-12 rounded-xl ${recommendationStyles.icon} flex items-center justify-center flex-shrink-0`}>
                <Sparkles className={`w-6 h-6 ${recommendationStyles.iconColor}`} />
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-bold mb-1 ${recommendationStyles.title}`}>{t("توصية الذكاء الاصطناعي", "AI Recommendation")}</h4>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{t(recommendation.ar, recommendation.en)}</p>
              </div>
            </MotionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card">
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">{t("قوة الهيدروجين (PH) والأكسجين المذاب (DO)", "Power of hydrogen (PH) & Dissolved Oxygen (DO)")}</h4>
                <div className="h-48">
                  {active?.history.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={active.history}>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={["auto", "auto"]} />
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
                  {active?.history.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={active.history}>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={["auto", "auto"]} />
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
