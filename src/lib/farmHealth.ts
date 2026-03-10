export interface WaterReadings {
  Temperature?: number;
  PH?: number;
  DO?: number;
  Ammonia?: number;
}

export function calculateHealthScore(readings: WaterReadings): number {
  if (typeof readings.Temperature !== "number") return 0;

  let score = 100;

  if (typeof readings.Ammonia === "number") {
    if (readings.Ammonia > 0.8) score -= 40;
    else if (readings.Ammonia > 0.5) score -= 20;
  }

  if (typeof readings.DO === "number") {
    if (readings.DO < 4.2) score -= 30;
    else if (readings.DO < 5) score -= 10;
  }

  if (typeof readings.Temperature === "number" && (readings.Temperature > 32 || readings.Temperature < 22)) {
    score -= 15;
  }

  if (typeof readings.PH === "number" && (readings.PH < 6.5 || readings.PH > 8.5)) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getHealthStatus(score: number) {
  if (score >= 75) return "safe";
  if (score >= 50) return "warning";
  return "danger";
}

export function calculateAverageHealth(readingsList: WaterReadings[]): number {
  if (readingsList.length === 0) return 0;
  const total = readingsList.reduce((sum, readings) => sum + calculateHealthScore(readings), 0);
  return Math.round(total / readingsList.length);
}
