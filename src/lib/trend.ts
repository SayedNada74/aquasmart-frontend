export type SensorTrendDirection = "up" | "down" | "stable";
export type SensorTrendTone = "good" | "bad" | "neutral";
export type SensorTrendSensor = "temperature" | "ph" | "nh3" | "do";

export interface SensorTrendResult {
  direction: SensorTrendDirection;
  tone: SensorTrendTone;
  delta: number;
}

const thresholds: Record<SensorTrendSensor, number> = {
  temperature: 0.3,
  ph: 0.05,
  nh3: 0.02,
  do: 0.1,
};

export function getSensorTrend(
  sensor: SensorTrendSensor,
  current?: number,
  previous?: number,
): SensorTrendResult {
  if (typeof current !== "number" || typeof previous !== "number") {
    return { direction: "stable", tone: "neutral", delta: 0 };
  }

  const delta = current - previous;
  const threshold = thresholds[sensor];

  if (Math.abs(delta) < threshold) {
    return { direction: "stable", tone: "neutral", delta };
  }

  if (sensor === "do") {
    return {
      direction: delta > 0 ? "up" : "down",
      tone: delta > 0 ? "good" : "bad",
      delta,
    };
  }

  if (sensor === "nh3") {
    return {
      direction: delta > 0 ? "up" : "down",
      tone: delta > 0 ? "bad" : "good",
      delta,
    };
  }

  return {
    direction: delta > 0 ? "up" : "down",
    tone: "neutral",
    delta,
  };
}
