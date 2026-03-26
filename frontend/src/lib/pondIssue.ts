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
  
  let severity: PondSeverity = "safe";
  let causesDanger = false;
  
  // Exact Scientific Thresholds for Danger
  if (typeof ammonia === "number" && ammonia > 0.8) causesDanger = true;
  if (typeof DO === "number" && DO < 4.2) causesDanger = true;
  if (typeof temperature === "number" && (temperature < 23.5 || temperature > 33.0)) causesDanger = true;
  if (typeof ph === "number" && (ph < 6.3 || ph > 8.7)) causesDanger = true;

  if (causesDanger || aiStatus.includes("Danger")) severity = "danger";
  else if (aiStatus.includes("Warning")) severity = "warning";

  if (severity === "safe") {
    return {
      severity: "safe",
      reasonAr: "جميع القراءات الحالية في المنطقة الآمنة.",
      reasonEn: "All current readings are within the safe zone.",
      recommendationAr: "ظروف المياه ممتازة في هذا الحوض. استمر في المراقبة الروتينية.",
      recommendationEn: "Water conditions are excellent. Continue routine monitoring.",
    };
  }

  // Compound Reasons Builder
  const reasonsAr: string[] = [];
  const reasonsEn: string[] = [];
  const recsAr: string[] = [];
  const recsEn: string[] = [];

  // 1. NH3 
  if (typeof ammonia === "number" && ammonia > 0.8) {
    reasonsAr.push("الأمونيا تسبب تسمم فوري للدم وتضرب الخياشيم");
    reasonsEn.push("Ammonia causes immediate blood poisoning and gill damage");
    recsAr.push("تغيير جزء من المياه فوراً لوقف التسمم");
    recsEn.push("perform an immediate partial water change");
  } else if (typeof ammonia === "number" && ammonia > 0.5 && severity === "warning") {
    reasonsAr.push("الأمونيا بدأت في الارتفاع عن الحد المثالي");
    reasonsEn.push("Ammonia is starting to rise above ideal levels");
    recsAr.push("وقف التغذية ومراقبة جودة المياه");
    recsEn.push("stop feeding and monitor water quality");
  }

  // 2. DO
  if (typeof DO === "number" && DO < 4.2) {
    reasonsAr.push("نقص الأكسجين يجعل السمك يختنق ويطلع على سطح المياه");
    reasonsEn.push("Low oxygen causes fish to suffocate and surface");
    recsAr.push("تشغيل جميع البدالات والتهوية بأقصى طاقة فوراً");
    recsEn.push("activate all aerators at maximum capacity immediately");
  } else if (typeof DO === "number" && DO < 5.0 && severity === "warning") {
    reasonsAr.push("الأكسجين أقل من المستوى التشغيلي المثالي");
    reasonsEn.push("Oxygen is below the ideal operating level");
    recsAr.push("زيادة مستوى التهوية تدريجياً");
    recsEn.push("increase aeration levels gradually");
  }

  // 3. Temp
  if (typeof temperature === "number" && (temperature < 23.5 || temperature > 33.0)) {
    reasonsAr.push("درجة الحرارة تُجهد السمك حرارياً وتقلل مناعته");
    reasonsEn.push("Temperature causes extreme thermal stress and reduces immunity");
    recsAr.push("تعديل مستوى المياه ومراجعة دورة التبريد أو التدفئة");
    recsEn.push("adjust water levels and verify thermal circulation");
  }

  // 4. pH
  if (typeof ph === "number" && (ph < 6.3 || ph > 8.7)) {
    reasonsAr.push("الحموضة/القلوية العالية تذيب قشور السمك وتزيد من سمية الأرقام الأخرى");
    reasonsEn.push("pH imbalance dissolves fish scales and magnifies toxicity of other parameters");
    recsAr.push("استخدام محسنات لوزن درجة حموضة المياه فوراً");
    recsEn.push("apply amendments to balance water pH immediately");
  }

  if (reasonsAr.length === 0) {
    const fallbackReason = ai?.Reason || "مؤشرات غير مستقرة عامة";
    reasonsAr.push(fallbackReason);
    reasonsEn.push(ai?.Reason || "Unstable general indicators");
    recsAr.push("إرسال فني لأخذ عينات يدوية من المزارع");
    recsEn.push("dispatch a technician for manual farm sampling");
  }

  const joinAr = (arr: string[]) => arr.join("، و");
  const joinEn = (arr: string[]) => arr.join(" and ");

  return {
    severity,
    reasonAr: `${joinAr(reasonsAr)}.`,
    reasonEn: `${joinEn(reasonsEn)}.`,
    recommendationAr: `المقترح: ${joinAr(recsAr)}.`,
    recommendationEn: `Action: ${joinEn(recsEn)}.`,
  };
}
