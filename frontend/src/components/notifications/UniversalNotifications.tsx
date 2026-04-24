"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push } from "firebase/database";
import { useApp } from "@/lib/AppContext";
import { AnimatePresence } from "framer-motion";
import { SmartAlertToast } from "@/components/notifications/SmartAlertToast";
import { getPondIssueDetails } from "@/lib/pondIssue";

interface GlobalAlert {
  id: string;
  pondId: string;
  type: "danger" | "warning" | "success";
  message_ar: string;
  message_en: string;
  timestamp: number;
  metrics?: {
    temp: number;
    ph: number;
    do: number;
    nh3: number;
  };
}

export function UniversalNotifications() {
  const { t, lang } = useApp();
  const router = useRouter();
  const [activeAlerts, setActiveAlerts] = useState<GlobalAlert[]>([]);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const pondsRef = ref(database, "ponds");
    const unsub = onValue(pondsRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      const newAlerts: GlobalAlert[] = [];

      Object.keys(data).forEach((pondId) => {
        const pond = data[pondId];
        const ai = pond.ai_result?.current || {};
        const status = ai.Status || "";

        if (status.includes("Danger") || status.includes("Warning")) {
          const type = status.includes("Danger") ? "danger" : "warning";
          const issue = getPondIssueDetails(pond.current, ai);
          
          // Use the English reason from issue details mapped directly from numbers for a reliable unique key
          const alertKey = `${pondId}_${type}_${issue.reasonEn.substring(0, 30)}`;

          notifiedRef.current.delete(`${pondId}_success_recovery`);

          if (!notifiedRef.current.has(alertKey)) {
            const alert: GlobalAlert = {
              id: `${pondId}_${Date.now()}`,
              pondId,
              type,
              message_ar: issue.reasonAr,
              message_en: issue.reasonEn,
              timestamp: Date.now(),
              metrics: pond.current
                ? {
                    temp: pond.current.Temperature || 0,
                    ph: pond.current.PH || 0,
                    do: pond.current.DO || 0,
                    nh3: pond.current.Ammonia || 0,
                  }
                : undefined,
            };

            newAlerts.push(alert);
            saveToHistory(alert);
            notifiedRef.current.add(alertKey);
          }
        } else if (status.includes("Safe")) {
          let recovered = false;
          Array.from(notifiedRef.current).forEach((key) => {
            if (key.startsWith(`${pondId}_`) && key !== `${pondId}_success_recovery`) {
              notifiedRef.current.delete(key);
              recovered = true;
            }
          });

          if (recovered) {
            const alertKey = `${pondId}_success_recovery`;
            if (!notifiedRef.current.has(alertKey)) {
              const alert: GlobalAlert = {
                id: `${pondId}_${Date.now()}`,
                pondId,
                type: "success",
                message_ar: "عادت قراءات الحوض إلى الوضع الطبيعي الآمن",
                message_en: "Pond readings have returned to normal safe levels",
                timestamp: Date.now(),
                metrics: pond.current
                  ? {
                      temp: pond.current.Temperature || 0,
                      ph: pond.current.PH || 0,
                      do: pond.current.DO || 0,
                      nh3: pond.current.Ammonia || 0,
                    }
                  : undefined,
              };

              newAlerts.push(alert);
              saveToHistory(alert);
              notifiedRef.current.add(alertKey);
            }
          }
        }
      });

      if (newAlerts.length > 0) {
        setActiveAlerts((prev) => [...newAlerts.reverse(), ...prev].slice(0, 3));
      }
    });

    return () => unsub();
  }, [t]);

  const saveToHistory = (alert: GlobalAlert) => {
    try {
      const historyRef = ref(database, "alerts_history");
      const newAlertRef = push(historyRef);
      set(newAlertRef, {
        pondId: alert.pondId,
        type: alert.type,
        title_ar: alert.type === "danger" ? "تنبيه حرج" : alert.type === "warning" ? "تحذير" : "استعادة",
        title_en: alert.type === "danger" ? "Critical Alert" : alert.type === "warning" ? "Warning" : "Recovery",
        desc_ar: alert.message_ar,
        desc_en: alert.message_en,
        timestamp: alert.timestamp,
        read: false,
        severity: alert.type === "danger" ? 3 : alert.type === "warning" ? 2 : 1,
        metrics: alert.metrics || null,
      });
    } catch (error) {
      console.error("Failed to save alert history:", error);
    }
  };

  const removeAlert = (id: string) => {
    setActiveAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <div
      className={`fixed top-20 z-[9999] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 pointer-events-none ${
        lang === "ar" ? "left-4 items-start" : "right-4 items-end"
      }`}
    >
      <AnimatePresence>
        {activeAlerts.map((alert) => (
          <SmartAlertToast
            key={alert.id}
            alert={alert}
            onClose={removeAlert}
            onOpenDetails={() => {
              removeAlert(alert.id);
              router.push("/alerts");
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
