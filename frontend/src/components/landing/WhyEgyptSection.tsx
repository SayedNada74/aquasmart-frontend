"use client";

import { Bell, Languages, Smartphone, Waves } from "lucide-react";
import { AnimatedContent } from "@/components/animations/AnimatedContent";
import { useApp } from "@/lib/AppContext";

const cardAccentStyles = [
  {
    icon: Waves,
    iconColor: "text-[var(--color-cyan-dark)]",
    iconBg: "bg-[var(--color-cyan-glow)]",
  },
  {
    icon: Bell,
    iconColor: "text-[#f59e0b]",
    iconBg: "bg-[#f59e0b]/10",
  },
  {
    icon: Languages,
    iconColor: "text-[var(--color-teal)]",
    iconBg: "bg-[var(--color-teal)]/10",
  },
  {
    icon: Smartphone,
    iconColor: "text-[#3b82f6]",
    iconBg: "bg-[#3b82f6]/10",
  },
] as const;

export function WhyEgyptSection() {
  const { t } = useApp();

  const cards = [
    {
      title: t("مصمم لواقع المزارع المصرية", "Built for Egyptian Fish Farms"),
      description: t(
        "تم تصميم النظام ليتعامل مع التغيرات السريعة في جودة المياه والتحديات اليومية في المزارع المحلية.",
        "Designed to handle real water quality fluctuations and daily challenges faced by local fish farms.",
      ),
    },
    {
      title: t("تنبيهات فورية لتقليل الخسائر", "Instant Alerts to Reduce Losses"),
      description: t(
        "يراقب النظام جودة المياه باستمرار ويرسل تنبيهات فورية عند حدوث أي خطر.",
        "The system continuously monitors water quality and sends instant alerts when risks appear.",
      ),
    },
    {
      title: t("دعم كامل للغة العربية", "Arabic-First Experience"),
      description: t(
        "واجهة النظام مصممة لتكون سهلة الاستخدام للمزارعين باللغة العربية.",
        "The platform provides a fully localized Arabic interface for easier use.",
      ),
    },
    {
      title: t("مراقبة المزرعة من أي مكان", "Monitor Your Farm From Anywhere"),
      description: t(
        "يمكن متابعة الأحواض والقراءات والتحكم في المعدات من الموبايل أو الويب.",
        "Monitor ponds, sensors, and equipment remotely from web or mobile.",
      ),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div className="text-center mb-14">
        <AnimatedContent delayMs={60}>
          <p className="text-sm text-[var(--color-cyan-dark)] font-semibold mb-2">
            {t("ملائم للسوق المحلي", "Built for the Local Market")}
          </p>
        </AnimatedContent>
        <AnimatedContent delayMs={140}>
          <h2 className="text-3xl font-bold">{t("لماذا AquaSmart مناسب للسوق المصري؟", "Why AquaSmart Fits the Egyptian Market")}</h2>
        </AnimatedContent>
        <AnimatedContent delayMs={220}>
          <p className="text-[var(--color-text-secondary)] mt-3 max-w-3xl mx-auto leading-relaxed">
            {t(
              "نظام مصمم لواقع المزارع المصرية، مع مراقبة فورية، تنبيهات ذكية، وتجربة سهلة للمزارع.",
              "A system built for Egyptian fish farms with real-time monitoring, smart alerts, and practical usability.",
            )}
          </p>
        </AnimatedContent>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const accent = cardAccentStyles[index];
          const Icon = accent.icon;

          return (
            <AnimatedContent key={card.title} delayMs={index * 80} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/80 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-xl">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
                  style={{ background: "linear-gradient(90deg, var(--color-cyan), var(--color-teal), transparent)" }}
                />
                <div
                  className="pointer-events-none absolute -top-10 end-0 h-28 w-28 rounded-full blur-2xl opacity-30 transition-opacity duration-300 group-hover:opacity-50"
                  style={{ background: "radial-gradient(circle, var(--color-cyan-glow) 0%, transparent 70%)" }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent opacity-80" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 ${accent.iconBg} shadow-sm`}>
                    <Icon className={`h-5 w-5 ${accent.iconColor}`} />
                  </div>

                  <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-3 leading-snug">{card.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{card.description}</p>
                </div>
              </div>
            </AnimatedContent>
          );
        })}
      </div>
    </section>
  );
}
