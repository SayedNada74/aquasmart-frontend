import type { WaterReadings } from "@/lib/farmHealth";

type PondSeverity = "safe" | "warning" | "danger";

interface PondAIState {
  Status?: string;
  Reason?: string;
}

export interface PondIssueDetails {
  severity: PondSeverity;
  reasonAr: string;
  reasonEn: string;
  recommendationAr: string;
  recommendationEn: string;
}

export function getPondIssueDetails(
  current?: WaterReadings,
  ai?: PondAIState,
): PondIssueDetails {
  const DO = current?.DO;
  const ammonia = current?.Ammonia;
  const ph = current?.PH;
  const temperature = current?.Temperature;
  const aiStatus = ai?.Status || "";
  const aiReason = ai?.Reason?.trim();

  if (aiStatus.includes("Danger") && aiReason) {
    return {
      severity: "danger",
      reasonAr: aiReason,
      reasonEn: aiReason,
      recommendationAr: `يوجد خطر في هذا الحوض: ${aiReason}`,
      recommendationEn: `There is a critical issue in this pond: ${aiReason}`,
    };
  }

  if (typeof ammonia === "number" && ammonia > 0.8) {
    return {
      severity: "danger",
      reasonAr: "ارتفاع الأمونيا إلى مستوى خطر يحتاج تدخلًا فوريًا.",
      reasonEn: "Ammonia has reached a dangerous level and needs immediate intervention.",
      recommendationAr: "مستوى الأمونيا مرتفع في هذا الحوض. يُفضل تدخل فوري لتحسين جودة المياه.",
      recommendationEn: "Ammonia levels are elevated in this pond. Water quality intervention is recommended immediately.",
    };
  }

  if (typeof DO === "number" && DO < 4.2) {
    return {
      severity: "danger",
      reasonAr: "الأكسجين المذاب منخفض جدًا عن الحد الآمن.",
      reasonEn: "Dissolved oxygen is critically below the safe limit.",
      recommendationAr: "الأكسجين المذاب منخفض في هذا الحوض. فكر في تشغيل البدالات فورًا.",
      recommendationEn: "Low dissolved oxygen detected in this pond. Consider activating the aerators immediately.",
    };
  }

  if (aiStatus.includes("Warning") && aiReason) {
    return {
      severity: "warning",
      reasonAr: aiReason,
      reasonEn: aiReason,
      recommendationAr: `يوجد تحذير يحتاج متابعة: ${aiReason}`,
      recommendationEn: `A warning condition needs attention: ${aiReason}`,
    };
  }

  if (typeof ammonia === "number" && ammonia > 0.5) {
    return {
      severity: "warning",
      reasonAr: "الأمونيا أعلى من النطاق المثالي لهذا الحوض.",
      reasonEn: "Ammonia is above the ideal range for this pond.",
      recommendationAr: "الأمونيا أعلى من المثالي في هذا الحوض. راقب التهوية وجدول تغيير المياه.",
      recommendationEn: "Ammonia is above the ideal range in this pond. Monitor aeration and the water exchange schedule closely.",
    };
  }

  if (typeof DO === "number" && DO < 5) {
    return {
      severity: "warning",
      reasonAr: "الأكسجين المذاب أقل من المستوى المستهدف.",
      reasonEn: "Dissolved oxygen is below the target operating level.",
      recommendationAr: "مستوى الأكسجين أقل من المثالي لهذا الحوض. متابعة التهوية موصى بها.",
      recommendationEn: "Dissolved oxygen is below the ideal target for this pond. Aeration should be monitored closely.",
    };
  }

  if (typeof ph === "number" && (ph < 6.5 || ph > 8.5)) {
    return {
      severity: "warning",
      reasonAr: "درجة الحموضة خارج النطاق المناسب لنمو الأسماك.",
      reasonEn: "pH is outside the suitable range for fish growth.",
      recommendationAr: "قيمة الحموضة خارج النطاق المثالي في هذا الحوض. راقب توازن المياه خلال الدورة القادمة.",
      recommendationEn: "The pH level is outside the optimal range in this pond. Monitor water balance during the next cycle.",
    };
  }

  if (typeof temperature === "number" && (temperature < 22 || temperature > 32)) {
    return {
      severity: "warning",
      reasonAr: "درجة حرارة المياه غير مستقرة لهذا الحوض.",
      reasonEn: "Water temperature is outside the stable operating range.",
      recommendationAr: "درجة حرارة المياه غير مثالية في هذا الحوض. راقب الحمل الحيوي والتهوية.",
      recommendationEn: "Water temperature is outside the ideal range in this pond. Monitor biological load and aeration.",
    };
  }

  return {
    severity: "safe",
    reasonAr: "جميع القراءات الحالية ضمن الحدود الطبيعية.",
    reasonEn: "All current readings are within the normal operating range.",
    recommendationAr: "ظروف المياه مستقرة في هذا الحوض. لا يوجد إجراء فوري مطلوب.",
    recommendationEn: "Water conditions are stable in this pond. No immediate action is required.",
  };
}
