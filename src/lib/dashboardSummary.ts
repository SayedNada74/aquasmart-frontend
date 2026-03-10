import { getHealthStatus } from "@/lib/farmHealth";

export interface DashboardSummaryContext {
  globalAqi: number;
  totalPonds: number;
  activeAlerts: number;
  scheduledTasks: number;
  worstPondNameAr?: string;
  worstPondNameEn?: string;
  worstPondScore?: number;
  latestAlertType?: "danger" | "warning" | "info" | "success";
  latestAlertMessageAr?: string;
  latestAlertMessageEn?: string;
}

export interface BilingualSummary {
  ar: string;
  en: string;
}

export function generateDashboardSummary(context: DashboardSummaryContext): BilingualSummary {
  if (context.latestAlertType === "danger" && context.latestAlertMessageAr && context.latestAlertMessageEn) {
    return {
      ar: `يوجد تنبيه حرج الآن. ${context.latestAlertMessageAr}`,
      en: `A critical alert needs attention now. ${context.latestAlertMessageEn}`,
    };
  }

  if (context.latestAlertType === "warning" && context.worstPondNameAr && context.worstPondNameEn) {
    return {
      ar: `${context.worstPondNameAr} يحتاج متابعة قريبة اليوم، خصوصًا جودة المياه والتهوية.`,
      en: `${context.worstPondNameEn} needs closer monitoring today, especially water quality and aeration.`,
    };
  }

  if (context.worstPondScore !== undefined && getHealthStatus(context.worstPondScore) === "danger" && context.worstPondNameAr && context.worstPondNameEn) {
    return {
      ar: `حالة ${context.worstPondNameAr} هي الأضعف حاليًا. راجع الأمونيا والأكسجين فورًا.`,
      en: `${context.worstPondNameEn} is currently the weakest pond. Review ammonia and oxygen immediately.`,
    };
  }

  if (context.globalAqi < 80) {
    return {
      ar: "جودة المياه أقل من المستوى المثالي الآن. راقب الحرارة ودرجة الحموضة خلال الدورة الحالية.",
      en: "Water quality is below the ideal range right now. Monitor temperature and pH during the current cycle.",
    };
  }

  if (context.scheduledTasks > 0) {
    return {
      ar: `المزرعة مستقرة الآن، ولديك ${context.scheduledTasks} مهام مجدولة جاهزة للتنفيذ.`,
      en: `The farm is stable right now, and you have ${context.scheduledTasks} scheduled tasks ready to run.`,
    };
  }

  return {
    ar: `جميع الأحواض الـ ${context.totalPonds} تعمل بشكل جيد، ولا توجد مخاطر نشطة حالياً.`,
    en: `All ${context.totalPonds} ponds are performing well, with no active risks at the moment.`,
  };
}
