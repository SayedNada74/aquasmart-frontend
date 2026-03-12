export type SensorTrendDirection = "up" | "down" | "stable";
export type SensorTrendTone = "good" | "bad" | "neutral";
export type SensorTrendSensor = "temperature" | "ph" | "nh3" | "do";

export interface SensorTrendResult {
  direction: SensorTrendDirection;
  tone: SensorTrendTone;
  delta: number;
}

export interface TrendComparableReading {
  Temperature: number;
  PH: number;
  Ammonia: number;
  DO: number;
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

function readNumber(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number") {
      return value;
    }
  }

  return undefined;
}

export function getPreviousReadingFromHistory(history: Array<Record<string, unknown>>): TrendComparableReading | undefined {
  if (!history.length) {
    return undefined;
  }

  const lastReading = history[history.length - 1];
  const Temperature = readNumber(lastReading, "Temperature", "T");
  const PH = readNumber(lastReading, "PH", "pH");
  const Ammonia = readNumber(lastReading, "Ammonia", "NH3");
  const DO = readNumber(lastReading, "DO");

  if (
    typeof Temperature !== "number" &&
    typeof PH !== "number" &&
    typeof Ammonia !== "number" &&
    typeof DO !== "number"
  ) {
    return undefined;
  }

  return {
    Temperature: Temperature ?? 0,
    PH: PH ?? 0,
    Ammonia: Ammonia ?? 0,
    DO: DO ?? 0,
  };
}
