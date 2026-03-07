"use client";

import { useEffect, useState, useRef } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push } from "firebase/database";
import { useApp } from "@/lib/AppContext";
import { AlertTriangle, XCircle, Bell, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface GlobalAlert {
    id: string;
    pondId: string;
    type: "danger" | "warning";
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
    const [activeAlerts, setActiveAlerts] = useState<GlobalAlert[]>([]);
    const notifiedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const pondsRef = ref(database, "ponds");
        const unsub = onValue(pondsRef, (snap) => {
            const data = snap.val();
            if (!data) return;

            const newAlerts: GlobalAlert[] = [];
            Object.keys(data).forEach((pondId) => {
                const p = data[pondId];
                const ai = p.ai_result?.current || {};
                const status = ai.Status || "";

                // Only trigger for Danger or Warning
                if (status.includes("Danger") || status.includes("Warning")) {
                    const type = status.includes("Danger") ? "danger" : "warning";
                    const alertKey = `${pondId}_${status}_${ai.Reason?.substring(0, 20)}`;

                    // Deduplication logic: Only notify if status/reason changed for this pond
                    if (!notifiedRef.current.has(alertKey)) {
                        const alert: GlobalAlert = {
                            id: Math.random().toString(36).substring(2, 11),
                            pondId,
                            type,
                            message_ar: ai.Reason || (type === "danger" ? "خطر حرج!" : "تحذير!"),
                            message_en: ai.Reason || (type === "danger" ? "Critical Danger!" : "Warning!"),
                            timestamp: Date.now(),
                            metrics: p.current ? {
                                temp: p.current.Temperature || 0,
                                ph: p.current.PH || 0,
                                do: p.current.DO || 0,
                                nh3: p.current.Ammonia || 0
                            } : undefined
                        };

                        // Push to active notifications
                        newAlerts.push(alert);

                        // Persistent Storage: Add to Alerts History in Firebase
                        saveToHistory(alert);

                        notifiedRef.current.add(alertKey);
                    }
                } else if (status.includes("Safe")) {
                    // Clear all keys for this pond if it's safe now
                    // This creates a "Hysteresis" to allow re-alerting if a problem recurs
                    Array.from(notifiedRef.current).forEach(key => {
                        if (key.startsWith(`${pondId}_`)) {
                            notifiedRef.current.delete(key);
                        }
                    });
                }
            });

            if (newAlerts.length > 0) {
                setActiveAlerts(prev => [...prev, ...newAlerts]);
                // Auto-clear after 8 seconds
                newAlerts.forEach(alert => {
                    setTimeout(() => {
                        removeAlert(alert.id);
                    }, 8000);
                });
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
                title_ar: alert.type === "danger" ? "تنبيه حرج" : "تحذير",
                title_en: alert.type === "danger" ? "Critical Alert" : "Warning",
                desc_ar: alert.message_ar,
                desc_en: alert.message_en,
                timestamp: alert.timestamp,
                read: false,
                severity: alert.type === "danger" ? 3 : 2,
                metrics: alert.metrics || null
            });
        } catch (e) {
            console.error("Failed to save alert history:", e);
        }
    };

    const removeAlert = (id: string) => {
        setActiveAlerts(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="fixed top-20 left-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
            <AnimatePresence>
                {activeAlerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className={`pointer-events-auto p-4 rounded-xl shadow-2xl border-l-[6px] flex gap-3 relative overflow-hidden backdrop-blur-md ${alert.type === "danger"
                            ? "bg-red-500/10 border-red-500 text-red-100 dark:bg-red-950/40"
                            : "bg-amber-500/10 border-amber-500 text-amber-100 dark:bg-amber-950/40"
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${alert.type === "danger" ? "bg-red-500/20" : "bg-amber-500/20"}`}>
                            {alert.type === "danger" ? <XCircle className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div className="flex-1 pr-6">
                            <h4 className="font-bold text-sm mb-1 text-white">
                                {t(alert.pondId.replace('pond_', 'حوض '), alert.pondId.replace('_', ' '))}
                            </h4>
                            <p className="text-xs opacity-90 leading-relaxed">
                                {t(alert.message_ar, alert.message_en)}
                            </p>
                            <span className="text-[10px] opacity-60 mt-2 block italic text-white/70">
                                {new Date(alert.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                            </span>
                        </div>
                        <button
                            onClick={() => removeAlert(alert.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-white/50" />
                        </button>

                        {/* Animated background pulse */}
                        <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-30 animate-shrink-width`} style={{ animationDuration: '8s' }} />
                    </motion.div>
                ))}
            </AnimatePresence>

            <style jsx>{`
                @keyframes shrink-width {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-shrink-width {
                    animation-name: shrink-width;
                    animation-timing-function: linear;
                }
            `}</style>
        </div>
    );
}
