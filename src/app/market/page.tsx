"use client";

import { Store, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";

export default function MarketPage() {
    const { t } = useApp();

    const fishPrices = [
        { name: t("بلطي (درجة أولى)", "Tilapia (Grade A)"), price: t("٨٥", "85"), change: t("+٢٣.٣٪", "+23.3%"), img: "🐟" },
        { name: t("بوري (كبير)", "Mullet (Large)"), price: t("١٤٠", "140"), change: t("+١.٥٪", "+1.5%"), img: "🐠" },
        { name: t("دنيس مزارع", "Sea Bream (Farm)"), price: t("٣٢٠", "320"), change: t("+٢٠.٨٪", "+20.8%"), img: "🐡" },
        { name: t("قاروص (وسط)", "Sea Bass (Medium)"), price: t("٣٥٠", "350"), change: t("+٢٤.١٪", "+24.1%"), img: "🎣" },
    ];

    const profitData = [
        { month: t("يناير", "Jan"), revenue: 45, cost: 30 },
        { month: t("فبراير", "Feb"), revenue: 52, cost: 28 },
        { month: t("مارس", "Mar"), revenue: 48, cost: 35 },
        { month: t("أبريل", "Apr"), revenue: 60, cost: 32 },
        { month: t("مايو", "May"), revenue: 55, cost: 30 },
    ];

    const harvestPlan = [
        { pond: t("حوض رقم ٤ - بلطي", "Pond #4 - Tilapia"), weight: t("٥٠٠ جرام / سمكة", "500g / fish"), price: t("٩٣ ج.م / كجم (خلال ١٠ أيام)", "93 EGP/kg (in 10 days)"), status: t("مثالي للحصاد", "Ideal for Harvest"), statusColor: "bg-[#10b981]" },
        { pond: t("حوض رقم ٧ - بوري", "Pond #7 - Mullet"), weight: t("٣٢٠ جرام / سمكة", "320g / fish"), price: t("سبتمبر ٢٠٢٤", "September 2024"), status: t("قيد النمو", "Growing"), statusColor: "bg-[#f59e0b]" },
    ];

    const tooltipStyle = { backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text-primary)", borderRadius: "8px", fontSize: "12px" };

    return (
        <PageTransition>
            <div className="space-y-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: t("القيمة الإجمالية للمزرعة", "Total Farm Value"), val: t("٤٥٠,٠٠٠", "450,000"), unit: t("ج.م", "EGP"), change: t("↑ ٧٠.٥٣٪ منذ الشهر الماضي", "↑ 70.53% since last month"), accent: true },
                        { label: t("العائد على الاستثمار المتوقع", "Expected ROI"), val: t("٢٤", "24"), unit: "%", change: t("↑ +١.٥٪ تحسن في الكفاءة", "↑ +1.5% efficiency improvement") },
                        { label: t("هامش الربح الحالي", "Current Profit Margin"), val: t("١٨.٥", "18.5"), unit: "%", change: t("↓ ٠.٨٪ خفض في تكاليف العلف", "↓ 0.8% feed cost reduction") },
                    ].map((s, i) => (
                        <div key={i} className={`stat-card ${s.accent ? "border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5" : ""}`}>
                            <div className="flex-1">
                                <p className="text-xs text-[var(--color-text-secondary)]">{s.label}</p>
                                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{s.val} <span className="text-sm text-[var(--color-text-muted)]">{s.unit}</span></p>
                                <p className="text-[10px] text-[#10b981]">{s.change}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Market Prices */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] text-[var(--color-text-muted)]">{t("آخر تحديث: منذ دقيقتين", "Last update: 2 min ago")}</p>
                        <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Store className="w-5 h-5 text-[var(--color-cyan)]" />
                            {t("أسعار السوق المباشرة", "Live Market Prices")}
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {fishPrices.map((f, i) => (
                            <div key={i} className="card cursor-pointer">
                                <div className="h-28 bg-[var(--color-bg-input)] rounded-lg mb-3 flex items-center justify-center text-5xl">{f.img}</div>
                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{f.name}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-[#10b981]">{f.change}</span>
                                    <p className="text-lg font-bold text-[var(--color-cyan)]">{f.price} <span className="text-xs text-[var(--color-text-muted)]">{t("ج.م / كجم", "EGP/kg")}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">{t("تخطيط الحصاد الذكي", "Smart Harvest Planning")}</h4>
                        <div className="space-y-4">
                            {harvestPlan.map((h, i) => (
                                <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)]">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${h.statusColor}`}>{h.status}</span>
                                        <h5 className="text-sm font-bold text-[var(--color-text-primary)]">{h.pond}</h5>
                                    </div>
                                    <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                                        <p>{h.price}</p>
                                        <p>{t("الوزن الحالي", "Current Weight")}: <span className="text-[var(--color-text-primary)] font-medium">{h.weight}</span></p>
                                    </div>
                                    {i === 0 && <button className="btn-primary w-full mt-3 text-xs py-2">{t("عرض تقرير المحاكاة", "View Simulation Report")}</button>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">{t("تحليل الربحية", "Profitability Analysis")}</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={profitData}>
                                    <XAxis dataKey="month" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                                    <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} name={t("الإيرادات", "Revenue")} />
                                    <Bar dataKey="cost" fill="var(--color-text-muted)" radius={[4, 4, 0, 0]} name={t("التكاليف", "Costs")} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="flex justify-start">
                    <button className="btn-primary flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {t("تحديث البيانات", "Refresh Data")}
                    </button>
                </div>
            </div>
        </PageTransition>
    );
}
