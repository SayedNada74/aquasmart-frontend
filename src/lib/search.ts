export type SearchResultType = "pond" | "sensor" | "page";

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

export function buildSearchIndex(ponds: SearchPond[]): SearchResult[] {
  const pondResults: SearchResult[] = ponds.map((pond) => ({
    id: pond.id,
    type: "pond",
    title_ar: pond.label_ar,
    title_en: pond.label_en,
    subtitle_ar: "الانتقال إلى هذا الحوض داخل لوحة القيادة",
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
  }));

  const sensorResults: SearchResult[] = [
    {
      id: "sensor_temperature",
      type: "sensor",
      title_ar: "درجة الحرارة",
      title_en: "Temperature",
      subtitle_ar: "الانتقال إلى بطاقة الحرارة في لوحة القيادة",
      subtitle_en: "Go to the temperature card in the dashboard",
      href: "/dashboard?metric=temperature",
      aliases: ["درجة الحرارة", "الحراره", "حرارة", "temperature", "temp", "t"],
    },
    {
      id: "sensor_ph",
      type: "sensor",
      title_ar: "قوة الهيدروجين (PH)",
      title_en: "Power of Hydrogen (pH)",
      subtitle_ar: "الانتقال إلى بطاقة pH في لوحة القيادة",
      subtitle_en: "Go to the pH card in the dashboard",
      href: "/dashboard?metric=ph",
      aliases: ["ph", "power of hydrogen", "قوة الهيدروجين", "الاس الهيدروجيني", "حموضة"],
    },
    {
      id: "sensor_nh3",
      type: "sensor",
      title_ar: "الأمونيا (NH3)",
      title_en: "Ammonia (NH3)",
      subtitle_ar: "الانتقال إلى بطاقة الأمونيا في لوحة القيادة",
      subtitle_en: "Go to the ammonia card in the dashboard",
      href: "/dashboard?metric=nh3",
      aliases: ["nh3", "ammonia", "الأمونيا", "امونيا", "نشادر"],
    },
    {
      id: "sensor_do",
      type: "sensor",
      title_ar: "الأكسجين المذاب (DO)",
      title_en: "Dissolved Oxygen (DO)",
      subtitle_ar: "الانتقال إلى بطاقة الأكسجين في لوحة القيادة",
      subtitle_en: "Go to the dissolved oxygen card in the dashboard",
      href: "/dashboard?metric=do",
      aliases: ["do", "oxygen", "dissolved oxygen", "الأكسجين", "اكسجين", "الأكسجين المذاب"],
    },
  ];

  const pageResults: SearchResult[] = [
    {
      id: "page_dashboard",
      type: "page",
      title_ar: "لوحة القيادة",
      title_en: "Dashboard",
      subtitle_ar: "فتح ملخص المزرعة الرئيسي",
      subtitle_en: "Open the main farm overview",
      href: "/dashboard",
      aliases: ["لوحة القيادة", "dashboard", "home"],
    },
    {
      id: "page_ponds",
      type: "page",
      title_ar: "الأحواض",
      title_en: "Ponds",
      subtitle_ar: "فتح صفحة إدارة الأحواض",
      subtitle_en: "Open the ponds management page",
      href: "/ponds",
      aliases: ["الأحواض", "الاحواض", "ponds"],
    },
    {
      id: "page_sensors",
      type: "page",
      title_ar: "المستشعرات",
      title_en: "Sensors",
      subtitle_ar: "فتح صفحة المستشعرات",
      subtitle_en: "Open the sensors page",
      href: "/sensors",
      aliases: ["المستشعرات", "sensors", "sensor"],
    },
    {
      id: "page_alerts",
      type: "page",
      title_ar: "التنبيهات",
      title_en: "Alerts",
      subtitle_ar: "فتح سجل التنبيهات",
      subtitle_en: "Open the alerts history",
      href: "/alerts",
      aliases: ["التنبيهات", "alerts", "alert", "warning", "danger"],
    },
  ];

  return [...pondResults, ...sensorResults, ...pageResults];
}

export function getSearchResults(query: string, index: SearchResult[], limit = 6) {
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
