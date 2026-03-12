export type SearchResultType = "page" | "pond" | "sensor" | "action" | "section";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  href: string;
  aliases: string[];
}

export interface SearchPond {
  id: string;
  number: number;
  label_ar: string;
  label_en: string;
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .split("")
    .map((char) => {
      const arabicIndex = ARABIC_DIGITS.indexOf(char);
      if (arabicIndex >= 0) return String(arabicIndex);
      const easternIndex = EASTERN_ARABIC_DIGITS.indexOf(char);
      if (easternIndex >= 0) return String(easternIndex);
      return char;
    })
    .join("");
}

function scoreResult(query: string, result: SearchResult) {
  let bestScore = 0;

  for (const alias of result.aliases) {
    const normalizedAlias = normalizeSearchText(alias);
    if (normalizedAlias === query) {
      return 100;
    }
    if (normalizedAlias.startsWith(query)) {
      bestScore = Math.max(bestScore, 70);
    } else if (normalizedAlias.includes(query)) {
      bestScore = Math.max(bestScore, 40);
    }
  }

  return bestScore;
}

function makeResult(result: SearchResult) {
  return result;
}

export function buildSearchIndex(ponds: SearchPond[]): SearchResult[] {
  const pondResults = ponds.map((pond) =>
    makeResult({
      id: pond.id,
      type: "pond",
      title_ar: pond.label_ar,
      title_en: pond.label_en,
      subtitle_ar: "فتح هذا الحوض داخل لوحة القيادة",
      subtitle_en: "Open this pond in the dashboard",
      href: `/dashboard?pond=${pond.id}`,
      aliases: [
        pond.label_ar,
        pond.label_en,
        `حوض ${pond.number}`,
        `حوض${pond.number}`,
        `pond ${pond.number}`,
        `pond${pond.number}`,
        `pond #${pond.number}`,
      ],
    }),
  );

  const pageResults: SearchResult[] = [
    makeResult({
      id: "page_dashboard",
      type: "page",
      title_ar: "لوحة القيادة",
      title_en: "Dashboard",
      subtitle_ar: "فتح ملخص المزرعة الرئيسي",
      subtitle_en: "Open the main farm overview",
      href: "/dashboard",
      aliases: ["لوحة القيادة", "dashboard", "home"],
    }),
    makeResult({
      id: "page_ponds",
      type: "page",
      title_ar: "الأحواض",
      title_en: "Ponds",
      subtitle_ar: "فتح صفحة إدارة الأحواض",
      subtitle_en: "Open the ponds page",
      href: "/ponds",
      aliases: ["الأحواض", "الاحواض", "ponds", "pond management"],
    }),
    makeResult({
      id: "page_sensors",
      type: "page",
      title_ar: "المستشعرات",
      title_en: "Sensors",
      subtitle_ar: "فتح صفحة المستشعرات",
      subtitle_en: "Open the sensors page",
      href: "/sensors",
      aliases: ["المستشعرات", "sensors", "sensor"],
    }),
    makeResult({
      id: "page_alerts",
      type: "page",
      title_ar: "التنبيهات",
      title_en: "Alerts",
      subtitle_ar: "فتح صفحة التنبيهات",
      subtitle_en: "Open the alerts page",
      href: "/alerts",
      aliases: ["التنبيهات", "alerts", "alert", "warning", "danger"],
    }),
    makeResult({
      id: "page_ai",
      type: "page",
      title_ar: "مركز الذكاء الاصطناعي",
      title_en: "AI Center",
      subtitle_ar: "فتح مركز AquaAI",
      subtitle_en: "Open the AI center",
      href: "/ai-center",
      aliases: ["مركز الذكاء الاصطناعي", "الذكاء الاصطناعي", "ai center", "ai", "aquaai", "chat"],
    }),
    makeResult({
      id: "page_control",
      type: "page",
      title_ar: "التحكم الذكي",
      title_en: "Smart Control",
      subtitle_ar: "فتح صفحة التحكم الذكي",
      subtitle_en: "Open smart control",
      href: "/control",
      aliases: ["التحكم الذكي", "smart control", "control"],
    }),
    makeResult({
      id: "page_reports",
      type: "page",
      title_ar: "التقارير",
      title_en: "Reports",
      subtitle_ar: "فتح صفحة التقارير",
      subtitle_en: "Open the reports page",
      href: "/reports",
      aliases: ["التقارير", "reports", "report", "pdf"],
    }),
    makeResult({
      id: "page_market",
      type: "page",
      title_ar: "السوق",
      title_en: "Market",
      subtitle_ar: "فتح صفحة السوق والمحاكاة",
      subtitle_en: "Open market simulation",
      href: "/market",
      aliases: ["السوق", "market", "market simulation", "prices"],
    }),
    makeResult({
      id: "page_settings",
      type: "page",
      title_ar: "الإعدادات",
      title_en: "Settings",
      subtitle_ar: "فتح إعدادات الحساب والمزرعة",
      subtitle_en: "Open account settings",
      href: "/settings",
      aliases: ["الإعدادات", "settings", "profile", "account"],
    }),
    makeResult({
      id: "page_login",
      type: "page",
      title_ar: "تسجيل الدخول",
      title_en: "Login",
      subtitle_ar: "فتح صفحة تسجيل الدخول",
      subtitle_en: "Open login page",
      href: "/login",
      aliases: ["تسجيل الدخول", "login", "sign in"],
    }),
    makeResult({
      id: "page_register",
      type: "page",
      title_ar: "إنشاء حساب",
      title_en: "Register",
      subtitle_ar: "فتح صفحة إنشاء الحساب",
      subtitle_en: "Open registration page",
      href: "/register",
      aliases: ["إنشاء حساب", "انشاء حساب", "register", "sign up"],
    }),
  ];

  const sensorResults: SearchResult[] = [
    makeResult({
      id: "sensor_temperature",
      type: "sensor",
      title_ar: "درجة الحرارة",
      title_en: "Temperature",
      subtitle_ar: "الانتقال إلى بطاقة الحرارة في لوحة القيادة",
      subtitle_en: "Go to the temperature card in the dashboard",
      href: "/dashboard?metric=temperature",
      aliases: ["درجة الحرارة", "الحراره", "حرارة", "temperature", "temp", "t"],
    }),
    makeResult({
      id: "sensor_ph",
      type: "sensor",
      title_ar: "قوة الهيدروجين (PH)",
      title_en: "Power of Hydrogen (pH)",
      subtitle_ar: "الانتقال إلى بطاقة pH في لوحة القيادة",
      subtitle_en: "Go to the pH card in the dashboard",
      href: "/dashboard?metric=ph",
      aliases: ["ph", "power of hydrogen", "قوة الهيدروجين", "الاس الهيدروجيني", "حموضة"],
    }),
    makeResult({
      id: "sensor_nh3",
      type: "sensor",
      title_ar: "الأمونيا (NH3)",
      title_en: "Ammonia (NH3)",
      subtitle_ar: "الانتقال إلى بطاقة الأمونيا في لوحة القيادة",
      subtitle_en: "Go to the ammonia card in the dashboard",
      href: "/dashboard?metric=nh3",
      aliases: ["nh3", "ammonia", "الأمونيا", "امونيا", "نشادر"],
    }),
    makeResult({
      id: "sensor_do",
      type: "sensor",
      title_ar: "الأكسجين المذاب (DO)",
      title_en: "Dissolved Oxygen (DO)",
      subtitle_ar: "الانتقال إلى بطاقة الأكسجين في لوحة القيادة",
      subtitle_en: "Go to the dissolved oxygen card in the dashboard",
      href: "/dashboard?metric=do",
      aliases: ["do", "oxygen", "dissolved oxygen", "الأكسجين", "اكسجين", "الأكسجين المذاب"],
    }),
  ];

  const actionResults: SearchResult[] = [
    makeResult({
      id: "action_feeding",
      type: "action",
      title_ar: "التغذية",
      title_en: "Feeding",
      subtitle_ar: "الانتقال إلى وحدات التغذية في التحكم الذكي",
      subtitle_en: "Go to feeding units in smart control",
      href: "/control?section=feeding",
      aliases: ["تغذية", "feeding", "feed now", "feeder", "auto feeding", "وحدات التغذية"],
    }),
    makeResult({
      id: "action_aeration",
      type: "action",
      title_ar: "تشغيل التهوية",
      title_en: "Aeration",
      subtitle_ar: "الانتقال إلى قسم البدالات",
      subtitle_en: "Go to the aerators section",
      href: "/control?section=aeration",
      aliases: ["تهوية", "aeration", "aerator", "تشغيل التهوية", "بدالات", "oxygen control"],
    }),
    makeResult({
      id: "action_schedule",
      type: "action",
      title_ar: "جدولة المهام",
      title_en: "Task Scheduling",
      subtitle_ar: "فتح قسم جدولة المهام في التحكم الذكي",
      subtitle_en: "Open task scheduling in smart control",
      href: "/control?section=schedule",
      aliases: ["جدولة المهام", "schedule", "task scheduler", "scheduled tasks", "مهام مجدولة"],
    }),
    makeResult({
      id: "action_upload_image",
      type: "action",
      title_ar: "رفع صورة",
      title_en: "Upload Image",
      subtitle_ar: "الانتقال إلى تشخيص الصور في مركز الذكاء الاصطناعي",
      subtitle_en: "Go to image diagnosis in the AI center",
      href: "/ai-center?section=vision",
      aliases: ["رفع صورة", "upload image", "image upload", "photo", "camera"],
    }),
    makeResult({
      id: "action_diagnosis",
      type: "action",
      title_ar: "تشخيص الأمراض",
      title_en: "Disease Diagnosis",
      subtitle_ar: "فتح تشخيص الأمراض بالصور",
      subtitle_en: "Open disease diagnosis",
      href: "/ai-center?section=vision",
      aliases: ["تشخيص الأمراض", "تشخيص", "disease diagnosis", "fish disease", "vision diagnosis"],
    }),
    makeResult({
      id: "action_refresh_market",
      type: "action",
      title_ar: "تحديث البيانات",
      title_en: "Refresh Data",
      subtitle_ar: "الانتقال إلى زر تحديث بيانات السوق",
      subtitle_en: "Go to refresh market data",
      href: "/market?section=refresh",
      aliases: ["تحديث البيانات", "refresh data", "refresh", "update market", "تحديث السوق"],
    }),
    makeResult({
      id: "action_export_pdf",
      type: "action",
      title_ar: "تصدير PDF",
      title_en: "Export PDF",
      subtitle_ar: "الانتقال إلى تصدير التقارير",
      subtitle_en: "Go to report PDF export",
      href: "/reports?section=export",
      aliases: ["تصدير pdf", "pdf", "export pdf", "report pdf", "تحميل التقرير"],
    }),
    makeResult({
      id: "action_upgrade_plan",
      type: "action",
      title_ar: "ترقية الباقة",
      title_en: "Upgrade Plan",
      subtitle_ar: "الانتقال إلى قسم ترقية الباقة",
      subtitle_en: "Go to the upgrade plan area",
      href: "/settings?section=plan",
      aliases: ["ترقية الباقة", "upgrade plan", "plan", "subscription", "الباقة"],
    }),
    makeResult({
      id: "action_change_password",
      type: "action",
      title_ar: "تغيير كلمة المرور",
      title_en: "Change Password",
      subtitle_ar: "الانتقال إلى إعدادات الأمان",
      subtitle_en: "Go to security settings",
      href: "/settings?section=security",
      aliases: ["تغيير كلمة المرور", "كلمة المرور", "change password", "password", "security"],
    }),
  ];

  const sectionResults: SearchResult[] = [
    makeResult({
      id: "section_ai_recommendation",
      type: "section",
      title_ar: "توصية الذكاء الاصطناعي",
      title_en: "AI Recommendation",
      subtitle_ar: "الانتقال إلى توصية الذكاء الاصطناعي في لوحة القيادة",
      subtitle_en: "Go to the AI recommendation in the dashboard",
      href: "/dashboard?section=ai-recommendation",
      aliases: ["توصية الذكاء الاصطناعي", "ai recommendation", "ai insight"],
    }),
    makeResult({
      id: "section_recent_alerts",
      type: "section",
      title_ar: "التنبيهات الأخيرة",
      title_en: "Recent Alerts",
      subtitle_ar: "الانتقال إلى قسم التنبيهات الأخيرة",
      subtitle_en: "Go to recent alerts",
      href: "/dashboard?section=recent-alerts",
      aliases: ["التنبيهات الأخيرة", "recent alerts", "latest alerts"],
    }),
    makeResult({
      id: "section_live_data",
      type: "section",
      title_ar: "البيانات المباشرة",
      title_en: "Live Data",
      subtitle_ar: "الانتقال إلى بيانات الحوض المباشرة",
      subtitle_en: "Go to live pond data",
      href: "/dashboard?section=live-data",
      aliases: ["البيانات المباشرة", "live data", "live monitoring"],
    }),
    makeResult({
      id: "section_operation_log",
      type: "section",
      title_ar: "سجل العمليات",
      title_en: "Operation Log",
      subtitle_ar: "الانتقال إلى سجل العمليات في التحكم الذكي",
      subtitle_en: "Go to the operation log in smart control",
      href: "/control?section=logs",
      aliases: ["سجل العمليات", "operation log", "logs", "history"],
    }),
    makeResult({
      id: "section_live_pond_status",
      type: "section",
      title_ar: "حالة الأحواض الحية",
      title_en: "Live Pond Status",
      subtitle_ar: "الانتقال إلى حالة الأحواض في مركز الذكاء الاصطناعي",
      subtitle_en: "Go to live pond status in AI center",
      href: "/ai-center?section=status",
      aliases: ["حالة الأحواض الحية", "live pond status", "pond status"],
    }),
    makeResult({
      id: "section_market_prices",
      type: "section",
      title_ar: "أسعار السوق المباشرة",
      title_en: "Live Market Prices",
      subtitle_ar: "الانتقال إلى أسعار السوق",
      subtitle_en: "Go to live market prices",
      href: "/market?section=prices",
      aliases: ["أسعار السوق", "market prices", "prices", "live market"],
    }),
    makeResult({
      id: "section_fish_guide",
      type: "section",
      title_ar: "دليل الأسماك",
      title_en: "Fish Guide",
      subtitle_ar: "الانتقال إلى صفحة السوق ودليل الأنواع",
      subtitle_en: "Go to the fish guide area",
      href: "/market?section=guide",
      aliases: ["دليل الأسماك", "fish guide", "fish types", "species"],
    }),
  ];

  return [...pageResults, ...pondResults, ...sensorResults, ...actionResults, ...sectionResults];
}

export function getSearchResults(query: string, index: SearchResult[], limit = 8) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return index
    .map((result) => ({
      result,
      score: scoreResult(normalizedQuery, result),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.result.title_en.localeCompare(b.result.title_en))
    .slice(0, limit)
    .map((entry) => entry.result);
}
