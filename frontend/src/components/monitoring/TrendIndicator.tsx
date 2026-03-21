"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { getSensorTrend, type SensorTrendSensor } from "@/lib/trend";

interface TrendIndicatorProps {
  type: SensorTrendSensor;
  current?: number;
  previous?: number;
}

export function TrendIndicator({ type, current, previous }: TrendIndicatorProps) {
  if (typeof current !== "number" || typeof previous !== "number") {
    return null;
  }

  const trend = getSensorTrend(type, current, previous);

  if (!trend) {
    return null;
  }

  const classes =
    trend.tone === "good"
      ? "text-[#10b981] bg-[#10b981]/10"
      : trend.tone === "bad"
        ? "text-[#ef4444] bg-[#ef4444]/10"
        : "text-[var(--color-text-muted)] bg-[var(--color-text-muted)]/10";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors duration-300 ${classes}`}
      aria-hidden="true"
    >
      {trend.direction === "up" ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : trend.direction === "down" ? (
        <ArrowDownRight className="h-3 w-3" />
      ) : (
        <Minus className="h-3 w-3" />
      )}
    </span>
  );
}
