"use client";

import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase";
import { useApp } from "@/lib/AppContext";

type LiveState = "connected" | "syncing" | "lost";

interface LiveDataIndicatorProps {
  path: string;
  className?: string;
  staleAfterMs?: number;
  lostAfterMs?: number;
}

export function LiveDataIndicator({
  path,
  className = "",
  staleAfterMs = 5000,
  lostAfterMs = 15000,
}: LiveDataIndicatorProps) {
  const { t, lang } = useApp();
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [hasReceivedSnapshot, setHasReceivedSnapshot] = useState(false);
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [hasListenerError, setHasListenerError] = useState(false);

  useEffect(() => {
    setHasReceivedSnapshot(false);
    setLastUpdateAt(null);
    setHasListenerError(false);

    const connectionRef = ref(database, ".info/connected");
    const dataRef = ref(database, path);

    const unsubscribeConnection = onValue(connectionRef, (snapshot) => {
      setIsFirebaseConnected(Boolean(snapshot.val()));
    });

    const unsubscribeData = onValue(
      dataRef,
      () => {
        const timestamp = Date.now();
        setHasReceivedSnapshot(true);
        setHasListenerError(false);
        setLastUpdateAt(timestamp);
        setNow(timestamp);
      },
      () => {
        setHasListenerError(true);
      },
    );

    return () => {
      unsubscribeConnection();
      unsubscribeData();
    };
  }, [path]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const status = useMemo<LiveState>(() => {
    if (hasListenerError || (!isFirebaseConnected && hasReceivedSnapshot)) {
      return "lost";
    }

    if (!hasReceivedSnapshot || lastUpdateAt === null) {
      return isFirebaseConnected ? "syncing" : "lost";
    }

    const age = now - lastUpdateAt;
    if (!isFirebaseConnected || age > lostAfterMs) {
      return "lost";
    }
    if (age > staleAfterMs) {
      return "syncing";
    }
    return "connected";
  }, [hasListenerError, hasReceivedSnapshot, isFirebaseConnected, lastUpdateAt, lostAfterMs, now, staleAfterMs]);

  const relativeTimeLabel = useMemo(() => {
    if (!hasReceivedSnapshot || lastUpdateAt === null) {
      return t("بانتظار أول تحديث", "Waiting for first update");
    }

    const diffSeconds = Math.max(0, Math.floor((now - lastUpdateAt) / 1000));
    if (diffSeconds < 1) {
      return t("تم التحديث الآن", "Updated just now");
    }

    if (diffSeconds < 60) {
      const seconds = diffSeconds.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
      return t(`آخر تحديث منذ ${seconds} ثانية`, `Last update: ${seconds}s ago`);
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      const minutes = diffMinutes.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
      return t(`آخر تحديث منذ ${minutes} دقيقة`, `Last update: ${minutes}m ago`);
    }

    const diffHours = Math.floor(diffMinutes / 60);
    const hours = diffHours.toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
    return t(`آخر تحديث منذ ${hours} ساعة`, `Last update: ${hours}h ago`);
  }, [hasReceivedSnapshot, lang, lastUpdateAt, now, t]);

  const label =
    status === "connected"
      ? t("المراقبة المباشرة", "Live Monitoring")
      : status === "syncing"
        ? t("جاري مزامنة البيانات...", "Syncing data...")
        : t("انقطع الاتصال", "Connection lost");

  const statusStyles =
    status === "connected"
      ? {
          dot: "bg-[#10b981] animate-pulse",
          border: "border-[#10b981]/20",
          glow: "shadow-[0_0_0_1px_rgba(16,185,129,0.08)]",
          text: "text-[#10b981]",
        }
      : status === "syncing"
        ? {
            dot: "bg-[#f59e0b]",
            border: "border-[#f59e0b]/20",
            glow: "shadow-[0_0_0_1px_rgba(245,158,11,0.08)]",
            text: "text-[#f59e0b]",
          }
        : {
            dot: "bg-[#ef4444]",
            border: "border-[#ef4444]/20",
            glow: "shadow-[0_0_0_1px_rgba(239,68,68,0.08)]",
            text: "text-[#ef4444]",
          };

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-full border bg-[var(--color-bg-card)]/80 px-3 py-1.5 text-xs backdrop-blur-sm ${statusStyles.border} ${statusStyles.glow} ${className}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${statusStyles.dot}`} />
      <span className={`font-semibold ${statusStyles.text}`}>{label}</span>
      <span className="text-[var(--color-text-muted)]">•</span>
      <span className="text-[var(--color-text-secondary)]">{relativeTimeLabel}</span>
    </div>
  );
}
