"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronRight, TriangleAlert, X, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/AppContext";
import { getAlertRecoveryGuidance } from "@/lib/alertRecovery";

interface SmartAlertToastAlert {
  id: string;
  pondId: string;
  type: "danger" | "warning" | "info";
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

interface SmartAlertToastProps {
  alert: SmartAlertToastAlert;
  onClose: (id: string) => void;
  onOpenDetails: () => void;
}

export function SmartAlertToast({ alert, onClose, onOpenDetails }: SmartAlertToastProps) {
  const { t, lang } = useApp();
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef(Date.now());
  const remainingRef = useRef(6000);
  const [isPaused, setIsPaused] = useState(false);

  const guidance = getAlertRecoveryGuidance(alert.metrics, alert.message_ar, alert.message_en);
  const isDanger = alert.type === "danger";
  const tone = isDanger
    ? {
        border: "border-[#ef4444]/30",
        glow: "shadow-[0_18px_40px_rgba(239,68,68,0.16)]",
        line: "from-[#ef4444] via-[#ef4444]/60 to-transparent",
        iconBg: "bg-[#ef4444]/12",
        iconText: "text-[#ef4444]",
        chip: "bg-[#ef4444]/12 text-[#ef4444]",
      }
    : {
        border: "border-[#f59e0b]/30",
        glow: "shadow-[0_18px_40px_rgba(245,158,11,0.16)]",
        line: "from-[#f59e0b] via-[#f59e0b]/60 to-transparent",
        iconBg: "bg-[#f59e0b]/12",
        iconText: "text-[#f59e0b]",
        chip: "bg-[#f59e0b]/12 text-[#f59e0b]",
      };

  useEffect(() => {
    if (isPaused) return;

    startedAtRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => {
      onClose(alert.id);
    }, remainingRef.current);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [alert.id, isPaused, onClose]);

  const handlePause = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    setIsPaused(true);
  };

  const handleResume = () => {
    if (remainingRef.current <= 0) {
      onClose(alert.id);
      return;
    }
    setIsPaused(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border bg-[var(--color-bg-card)]/82 backdrop-blur-xl p-4 ${tone.border} ${tone.glow}`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${tone.line}`} />
      <div className="pointer-events-none absolute -top-16 end-0 h-28 w-28 rounded-full bg-[var(--color-cyan-glow)]/20 blur-2xl" />

      <div className="relative z-10 flex gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.iconBg}`}>
          {isDanger ? <XCircle className={`h-5 w-5 ${tone.iconText}`} /> : <TriangleAlert className={`h-5 w-5 ${tone.iconText}`} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tone.chip}`}>
                  {isDanger ? t("تنبيه حرج", "Critical Alert") : t("تحذير", "Warning")}
                </span>
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {t(alert.pondId.replace("pond_", "حوض "), alert.pondId.replace("pond_", "Pond "))}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
                {t(alert.message_ar, alert.message_en)}
              </p>
            </div>

            <button
              onClick={() => onClose(alert.id)}
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              aria-label={t("إغلاق", "Close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)]/70 px-3 py-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              <Bell className="h-3.5 w-3.5" />
              {t("هدف الاستعادة", "Recovery Target")}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {t(guidance.targetAr, guidance.targetEn)}
            </p>
          </div>

          <button
            onClick={onOpenDetails}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-cyan)] transition-colors hover:text-[var(--color-cyan-dark)]"
          >
            {t("عرض التفاصيل", "View details")}
            <ChevronRight className={`h-3.5 w-3.5 ${lang === "ar" ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
