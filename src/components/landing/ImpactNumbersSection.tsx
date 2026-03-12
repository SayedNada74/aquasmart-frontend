"use client";

import { AlertTriangle, BellRing, Clock3, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedContent } from "@/components/animations/AnimatedContent";
import { useApp } from "@/lib/AppContext";

interface CountMetric {
  title: string;
  description: string;
  end: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

function CountValue({ end, suffix = "", prefix = "", decimals = 0 }: Omit<CountMetric, "title" | "description">) {
  const mountRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const currentRef = mountRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(currentRef);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let frameId = 0;
    let startTime = 0;
    const duration = 1100;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(end * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [end, hasStarted]);

  const formattedValue = useMemo(() => {
    const rounded = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();
    return `${prefix}${rounded}${suffix}`;
  }, [decimals, displayValue, prefix, suffix]);

  return <span ref={mountRef}>{formattedValue}</span>;
}

export function ImpactNumbersSection() {
  const { t } = useApp();

  const metrics: Array<CountMetric & { icon: React.ComponentType<{ className?: string }>; iconClass: string; iconBg: string }> = [
    {
      title: t("تقليل الخسائر", "Reduced Losses"),
      description: t(
        "الكشف المبكر عن مشاكل جودة المياه يقلل الخسائر المحتملة.",
        "Early detection of water issues helps reduce potential losses.",
      ),
      end: 30,
      suffix: "%",
      icon: ShieldCheck,
      iconClass: "text-[var(--color-cyan-dark)]",
      iconBg: "bg-[var(--color-cyan-glow)]",
    },
    {
      title: t("سرعة اكتشاف الخطر", "Faster Risk Detection"),
      description: t(
        "النظام يكتشف التغيرات الخطيرة في المياه بسرعة.",
        "The system detects dangerous water changes faster.",
      ),
      end: 90,
      suffix: "%",
      icon: AlertTriangle,
      iconClass: "text-[#f59e0b]",
      iconBg: "bg-[#f59e0b]/10",
    },
    {
      title: t("مراقبة الأحواض", "Continuous Monitoring"),
      description: t("متابعة الأحواض والقراءات طوال الوقت.", "Monitor ponds and sensor readings continuously."),
      end: 24,
      suffix: "/7",
      icon: Clock3,
      iconClass: "text-[var(--color-teal)]",
      iconBg: "bg-[var(--color-teal)]/10",
    },
    {
      title: t("تنبيه فوري", "Instant Alerts"),
      description: t("تنبيهات فورية عند حدوث أي خطر في الحوض.", "Immediate alerts when pond conditions become risky."),
      end: 10,
      prefix: "<",
      suffix: "s",
      icon: BellRing,
      iconClass: "text-[#3b82f6]",
      iconBg: "bg-[#3b82f6]/10",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div className="text-center mb-14">
        <AnimatedContent delayMs={60}>
          <p className="text-sm text-[var(--color-cyan-dark)] font-semibold mb-2">{t("أثر النظام", "System Impact")}</p>
        </AnimatedContent>
        <AnimatedContent delayMs={140}>
          <h2 className="text-3xl font-bold">{t("نتائج AquaSmart", "AquaSmart Impact")}</h2>
        </AnimatedContent>
        <AnimatedContent delayMs={220}>
          <p className="text-[var(--color-text-secondary)] mt-3 max-w-3xl mx-auto leading-relaxed">
            {t(
              "نظام مصمم لتقليل الخسائر وتحسين إدارة المزارع السمكية.",
              "A system designed to reduce losses and improve fish farm management.",
            )}
          </p>
        </AnimatedContent>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <AnimatedContent key={metric.title} delayMs={index * 80} className="h-full">
              <div className="card h-full p-6 relative overflow-hidden border-[var(--color-border)]">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
                  style={{ background: "linear-gradient(90deg, var(--color-cyan), var(--color-teal), transparent)" }}
                />
                <div className="relative z-10 flex h-full flex-col">
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-full ${metric.iconBg} shadow-sm`}>
                    <Icon className={`h-5 w-5 ${metric.iconClass}`} />
                  </div>

                  <div className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight mb-2">
                    <CountValue end={metric.end} suffix={metric.suffix} prefix={metric.prefix} decimals={metric.decimals} />
                  </div>

                  <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">{metric.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{metric.description}</p>
                </div>
              </div>
            </AnimatedContent>
          );
        })}
      </div>
    </section>
  );
}
