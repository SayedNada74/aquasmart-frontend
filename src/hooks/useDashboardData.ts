"use client";

import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase";
import { fetchWeather, WeatherData } from "@/lib/weather/weatherService";
import { calculateAverageHealth, calculateHealthScore, getHealthStatus, type WaterReadings } from "@/lib/farmHealth";
import { generateDashboardSummary, type BilingualSummary } from "@/lib/dashboardSummary";
import { getPreviousReadingFromHistory } from "@/lib/trend";
import type { ScheduledTask } from "@/lib/taskScheduleService";

interface PondCurrent extends WaterReadings {
  timestamp?: string;
}

interface PondAI {
  Status?: string;
  Reason?: string;
  AI_Confidence?: string;
}

export interface DashboardPondData {
  id: string;
  current: PondCurrent;
  previousCurrent?: PondCurrent;
  ai: PondAI;
  history: Array<Record<string, unknown>>;
  score: number;
}

export interface DashboardAlert {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  desc_ar: string;
  desc_en: string;
  pondId?: string;
  pondLabelAr: string;
  pondLabelEn: string;
  timestamp: number;
  read: boolean;
}

interface DashboardMetrics {
  totalPonds: number;
  waterQuality: number;
  activeAlerts: number;
  scheduledTasks: number;
}

export function useDashboardData(location?: string) {
  const [ponds, setPonds] = useState<DashboardPondData[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendation, setRecommendation] = useState<BilingualSummary>({
    ar: "جاري تحليل الحالة الحالية للمزرعة...",
    en: "Analyzing the current farm status...",
  });
  const [loadingPonds, setLoadingPonds] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const pondsRef = ref(database, "ponds");
    const unsubscribe = onValue(pondsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setPonds([]);
        setLoadingPonds(false);
        return;
      }

      setPonds((previousPonds) => {
        const previousCurrentMap = new Map(previousPonds.map((pond) => [pond.id, pond.current]));

        return Object.keys(data).map((key) => {
          const pond = data[key];
          const current = (pond.current || {}) as PondCurrent;
          const history = pond.history?.readings
            ? (Object.values(pond.history.readings) as Array<Record<string, unknown>>)
                .sort((a, b) => new Date(String(a.time)).getTime() - new Date(String(b.time)).getTime())
                .slice(-20)
            : [];

          return {
            id: key,
            current,
            previousCurrent: previousCurrentMap.get(key) || getPreviousReadingFromHistory(history),
            ai: (pond.ai_result?.current || {}) as PondAI,
            history,
            score: calculateHealthScore(current),
          };
        });
      });
      setLoadingPonds(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const alertsRef = ref(database, "alerts_history");
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setAlerts([]);
        setLoadingAlerts(false);
        return;
      }

      const nextAlerts = Object.keys(data).map((key) => {
        const alert = data[key];
        const pondId = alert.pondId as string | undefined;
        const pondNumber = pondId?.replace("pond_", "") || "";
        return {
          id: key,
          type: alert.type || "info",
          desc_ar: alert.desc_ar || "تنبيه",
          desc_en: alert.desc_en || "Alert",
          pondId,
          pondLabelAr: pondId ? `حوض ${pondNumber}` : "النظام",
          pondLabelEn: pondId ? `Pond ${pondNumber}` : "System",
          timestamp: Number(alert.timestamp || Date.now()),
          read: Boolean(alert.read),
        } as DashboardAlert;
      });

      setAlerts(nextAlerts.sort((a, b) => b.timestamp - a.timestamp));
      setLoadingAlerts(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const tasksRef = ref(database, "control/tasks");
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setTasks([]);
        setLoadingTasks(false);
        return;
      }

      const nextTasks = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      })) as ScheduledTask[];

      setTasks(nextTasks);
      setLoadingTasks(false);
    });

    return () => unsubscribe();
  }, []);

  const metrics: DashboardMetrics = useMemo(() => {
    const totalPonds = ponds.length;
    const waterQuality = calculateAverageHealth(ponds.map((pond) => pond.current));
    const activeAlerts = alerts.filter((alert) => !alert.read && (alert.type === "danger" || alert.type === "warning")).length;
    const scheduledTasks = tasks.length;

    return {
      totalPonds,
      waterQuality,
      activeAlerts,
      scheduledTasks,
    };
  }, [alerts, ponds, tasks]);

  const globalSafety = metrics.waterQuality;
  const worstPond = useMemo(() => ponds.slice().sort((a, b) => a.score - b.score)[0], [ponds]);
  const weatherContextTemp = useMemo(() => {
    if (!ponds.length) return undefined;
    const avgTemp =
      ponds.reduce((sum, pond) => sum + (typeof pond.current.Temperature === "number" ? pond.current.Temperature : 0), 0) / ponds.length;
    return Math.round(avgTemp);
  }, [ponds]);
  const recentAlerts = useMemo(() => {
    const actionable = alerts.filter((alert) => alert.type === "danger" || alert.type === "warning");
    const pool = actionable.length > 0 ? actionable : alerts;
    return pool.slice(0, 3);
  }, [alerts]);

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      const nextWeather = await fetchWeather(location || "Default", weatherContextTemp);
      if (!cancelled) setWeather(nextWeather);
    };

    void loadWeather();
    const interval = window.setInterval(loadWeather, 1000 * 60 * 10);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [location, weatherContextTemp]);

  useEffect(() => {
    const localSummary = generateDashboardSummary({
      globalAqi: metrics.waterQuality,
      totalPonds: metrics.totalPonds,
      activeAlerts: metrics.activeAlerts,
      scheduledTasks: metrics.scheduledTasks,
      worstPondNameAr: worstPond ? `حوض ${worstPond.id.replace("pond_", "")}` : undefined,
      worstPondNameEn: worstPond ? `Pond ${worstPond.id.replace("pond_", "")}` : undefined,
      worstPondScore: worstPond?.score,
      latestAlertType: recentAlerts[0]?.type,
      latestAlertMessageAr: recentAlerts[0]?.desc_ar,
      latestAlertMessageEn: recentAlerts[0]?.desc_en,
    });

    setRecommendation(localSummary);

    if (process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_AI_SUMMARY !== "true") {
      return;
    }

    const controller = new AbortController();
    const topIssue = recentAlerts[0]?.desc_en || worstPond?.ai?.Reason || "none";

    const enhance = async () => {
      try {
        const response = await fetch("/api/dashboard-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fallback: localSummary,
            context: {
              totalPonds: metrics.totalPonds,
              activeAlerts: metrics.activeAlerts,
              scheduledTasks: metrics.scheduledTasks,
              globalAqi: metrics.waterQuality,
              topIssue,
            },
          }),
          signal: controller.signal,
        });

        if (!response.ok) return;
        const enhanced = (await response.json()) as BilingualSummary;
        if (enhanced.ar && enhanced.en) {
          setRecommendation(enhanced);
        }
      } catch {
        // Keep local summary silently.
      }
    };

    void enhance();
    return () => controller.abort();
  }, [metrics, recentAlerts, worstPond]);

  return {
    ponds,
    weather,
    recommendation,
    recentAlerts,
    metrics,
    globalSafety,
    loading: loadingPonds || loadingAlerts || loadingTasks,
  };
}
