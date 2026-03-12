type MetricKey = "nh3" | "do" | "temp" | "ph";

interface AlertMetrics {
  temp?: number;
  ph?: number;
  do?: number;
  nh3?: number;
}

export interface AlertRecoveryGuidance {
  metricKey: MetricKey;
  metricLabelAr: string;
  metricLabelEn: string;
  safeRangeAr: string;
  safeRangeEn: string;
  actionAr: string;
  actionEn: string;
  targetAr: string;
  targetEn: string;
}

const guidanceMap: Record<MetricKey, AlertRecoveryGuidance> = {
  nh3: {
    metricKey: "nh3",
    metricLabelAr: "الأمونيا (NH3)",
    metricLabelEn: "Ammonia (NH3)",
    safeRangeAr: "من 0 إلى 0.2 mg/L",
    safeRangeEn: "0 – 0.2 mg/L",
    actionAr: "يفضل زيادة التهوية أو تغيير جزء من المياه لتقليل الأمونيا.",
    actionEn: "Increase aeration and consider a partial water exchange to reduce ammonia.",
    targetAr: "يجب أن تعود الأمونيا إلى النطاق 0 – 0.2 mg/L",
    targetEn: "NH3 should return to the 0 – 0.2 mg/L range.",
  },
  do: {
    metricKey: "do",
    metricLabelAr: "الأكسجين المذاب (DO)",
    metricLabelEn: "Dissolved Oxygen (DO)",
    safeRangeAr: "أعلى من 5 mg/L",
    safeRangeEn: "Above 5 mg/L",
    actionAr: "يفضل تشغيل البدالات ورفع التهوية حتى يعود الأكسجين للمستوى الآمن.",
    actionEn: "Activate aerators and improve circulation until oxygen returns to the safe level.",
    targetAr: "يجب أن يرتفع الأكسجين المذاب لأكثر من 5 mg/L",
    targetEn: "DO should rise above 5 mg/L.",
  },
  temp: {
    metricKey: "temp",
    metricLabelAr: "درجة الحرارة",
    metricLabelEn: "Temperature",
    safeRangeAr: "من 24 إلى 30 °C",
    safeRangeEn: "24 – 30 °C",
    actionAr: "راقب التهوية ومعدل التغذية وحاول إعادة الحرارة إلى النطاق المعتدل.",
    actionEn: "Adjust aeration and feeding load and bring water temperature back to the moderate range.",
    targetAr: "يجب أن تستقر درجة الحرارة بين 24 و30 °C",
    targetEn: "Temperature should stabilize between 24 and 30 °C.",
  },
  ph: {
    metricKey: "ph",
    metricLabelAr: "الحموضة (pH)",
    metricLabelEn: "pH",
    safeRangeAr: "من 6.5 إلى 8.5",
    safeRangeEn: "6.5 – 8.5",
    actionAr: "راجع توازن المياه وجودة المصدر المائي حتى تعود الحموضة للمعدل الطبيعي.",
    actionEn: "Review water balance and source quality until pH returns to the normal operating range.",
    targetAr: "يجب أن تعود الحموضة إلى النطاق 6.5 – 8.5",
    targetEn: "pH should return to the 6.5 – 8.5 range.",
  },
};

function inferMetricKey(metrics?: AlertMetrics, descAr = "", descEn = ""): MetricKey {
  if (typeof metrics?.nh3 === "number" && metrics.nh3 > 0.2) return "nh3";
  if (typeof metrics?.do === "number" && metrics.do <= 5) return "do";
  if (typeof metrics?.temp === "number" && (metrics.temp < 24 || metrics.temp > 30)) return "temp";
  if (typeof metrics?.ph === "number" && (metrics.ph < 6.5 || metrics.ph > 8.5)) return "ph";

  const haystack = `${descAr} ${descEn}`.toLowerCase();
  if (haystack.includes("nh3") || haystack.includes("ammonia") || haystack.includes("الأمونيا")) return "nh3";
  if (haystack.includes("oxygen") || haystack.includes("dissolved oxygen") || haystack.includes("الأكسجين")) return "do";
  if (haystack.includes("temperature") || haystack.includes("الحرارة")) return "temp";
  return "ph";
}

export function getAlertRecoveryGuidance(metrics?: AlertMetrics, descAr = "", descEn = ""): AlertRecoveryGuidance {
  const metricKey = inferMetricKey(metrics, descAr, descEn);
  return guidanceMap[metricKey];
}
