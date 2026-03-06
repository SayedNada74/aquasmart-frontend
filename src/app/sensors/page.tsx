"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useApp } from "@/lib/AppContext";
import {
    Radio, Thermometer, Droplets, FlaskConical, Wind,
    Wifi, WifiOff, Activity, CheckCircle2,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { PageTransition } from "@/components/motion/PageTransition";
import { MotionCard } from "@/components/motion/MotionCard";

interface SensorInfo {
    id: string;
    name_ar: string;
    name_en: string;
    type: string;
    icon: React.ReactNode;
    color: string;
    unit: string;
    value: number;
    status: "online" | "offline";
    pond: string;
    history: number[];
}

export default function SensorsPage() {
    const { t } = useApp();
    const [sensors, setSensors] = useState<SensorInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const pondsRef = ref(database, "ponds");
        const unsub = onValue(pondsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const allSensors: SensorInfo[] = [];
                Object.keys(data).forEach((key, idx) => {
                    const p = data[key];
                    const c = p.current || {};
                    const hist = p.history?.readings ? Object.values(p.history.readings) as any[] : [];
                    const pondLabel = `${t("حوض", "Pond")} ${idx + 1}`;

                    allSensors.push(
                        {
                            id: `${key}_temp`, name_ar: "درجة الحرارة (°)", name_en: "Temperature (°)",
                            type: "DS18B20", icon: <Thermometer className="w-5 h-5" />, color: "#f59e0b",
                            unit: "", value: c.Temperature || 0, status: "online", pond: pondLabel,
                            history: hist.slice(-15).map((h: any) => h.T || 0),
                        },
                        {
                            id: `${key}_ph`, name_ar: "قوة الهيدروجين (PH)", name_en: "Power of hydrogen (PH)",
                            type: "PH-4502C", icon: <FlaskConical className="w-5 h-5" />, color: "#3b82f6",
                            unit: "", value: c.PH || 0, status: "online", pond: pondLabel,
                            history: hist.slice(-15).map((h: any) => h.pH || 0),
                        },
                        {
                            id: `${key}_nh3`, name_ar: "الأمونيا (NH3)", name_en: "Ammonia (NH3)",
                            type: "MQ-135", icon: <Wind className="w-5 h-5" />, color: "#ef4444",
                            unit: "", value: c.Ammonia || 0, status: "online", pond: pondLabel,
                            history: hist.slice(-15).map((h: any) => h.NH3 || 0),
                        },
                        {
                            id: `${key}_do`, name_ar: "الأكسجين المذاب (DO)", name_en: "Dissolved Oxygen (DO)",
                            type: "Galvanic DO", icon: <Droplets className="w-5 h-5" />, color: "#14b8a6",
                            unit: "", value: c.DO || 0, status: "online", pond: pondLabel,
                            history: hist.slice(-15).map((h: any) => h.DO || 0),
                        }
                    );
                });
                setSensors(allSensors);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [t]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-14 h-14 border-4 border-[var(--color-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const online = sensors.filter((s) => s.status === "online").length;

    return (
        <PageTransition>
            <div className="space-y-6 pb-8">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MotionCard className="stat-card">
                        <div className="flex-1 text-right">
                            <p className="text-xs text-[var(--color-text-secondary)]">{t("إجمالي المستشعرات", "Total Sensors")}</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{sensors.length}</p>
                        </div>
                        <Radio className="w-6 h-6 text-[var(--color-cyan)]" />
                    </MotionCard>
                    <MotionCard className="stat-card">
                        <div className="flex-1 text-right">
                            <p className="text-xs text-[var(--color-text-secondary)]">{t("متصل", "Online")}</p>
                            <p className="text-2xl font-bold text-[#10b981]">{online}</p>
                        </div>
                        <Wifi className="w-6 h-6 text-[#10b981]" />
                    </MotionCard>
                    <MotionCard className="stat-card">
                        <div className="flex-1 text-right">
                            <p className="text-xs text-[var(--color-text-secondary)]">{t("غير متصل", "Offline")}</p>
                            <p className="text-2xl font-bold text-[#ef4444]">{sensors.length - online}</p>
                        </div>
                        <WifiOff className="w-6 h-6 text-[#ef4444]" />
                    </MotionCard>
                    <MotionCard className="stat-card">
                        <div className="flex-1 text-right">
                            <p className="text-xs text-[var(--color-text-secondary)]">{t("دقة البيانات", "Data Accuracy")}</p>
                            <p className="text-2xl font-bold text-[var(--color-text-primary)]">99.2%</p>
                        </div>
                        <Activity className="w-6 h-6 text-[var(--color-cyan)]" />
                    </MotionCard>
                </div>

                {/* Sensor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {sensors.map((sensor) => (
                        <MotionCard key={sensor.id} className="card hover:border-[var(--color-cyan)]/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5">
                                    {sensor.status === "online" ? (
                                        <><span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" /><span className="text-[10px] text-[#10b981]">{t("متصل", "Online")}</span></>
                                    ) : (
                                        <><span className="w-2 h-2 rounded-full bg-[#ef4444]" /><span className="text-[10px] text-[#ef4444]">{t("غير متصل", "Offline")}</span></>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--color-text-primary)] text-right">{t(sensor.name_ar, sensor.name_en)}</h3>
                                        <p className="text-[10px] text-[var(--color-text-muted)] text-right">{sensor.type} • {sensor.pond}</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${sensor.color}15`, color: sensor.color }}>
                                        {sensor.icon}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <div className="w-2/3 h-16">
                                    {sensor.history.length > 0 && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={sensor.history.map((v, i) => ({ v, i }))}>
                                                <Line type="monotone" dataKey="v" stroke={sensor.color} strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-3xl font-bold text-[var(--color-text-primary)]">{sensor.value.toFixed(sensor.unit === "ppm" ? 2 : 1)}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{sensor.unit}</p>
                                </div>
                            </div>
                        </MotionCard>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
}
