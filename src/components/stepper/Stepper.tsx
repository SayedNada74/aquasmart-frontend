"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StepperProps {
    steps: { label_ar: string; label_en: string }[];
    activeStep: number;
    lang: "ar" | "en";
}

export function Stepper({ steps, activeStep, lang }: StepperProps) {
    const reducedMotion = useReducedMotion();

    return (
        <div className="flex w-full items-center justify-between mb-8 px-2">
            {steps.map((step, index) => {
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;

                return (
                    <React.Fragment key={index}>
                        <div className="relative flex flex-col items-center group">
                            {/* Halo / Glow for active step */}
                            {isActive && !reducedMotion && (
                                <motion.div
                                    className="absolute -inset-2 rounded-full bg-emerald-400/20 dark:bg-white/10"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            )}

                            {/* Circle */}
                            <motion.div
                                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300
                                ${isCompleted
                                        ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-400 dark:border-emerald-400 dark:text-black"
                                        : isActive
                                            ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] dark:bg-[#34d399]/10 dark:border-[#34d399]/30 dark:text-[#34d399]"
                                            : "bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                                    }`}
                                layout={!reducedMotion}
                            >
                                <AnimatePresence mode="wait">
                                    {isCompleted ? (
                                        <motion.div
                                            key="check"
                                            initial={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                                            animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }}
                                            exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Check className="w-5 h-5" />
                                        </motion.div>
                                    ) : (
                                        <motion.span
                                            key="number"
                                            initial={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                                            animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                                            exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                                            className="text-sm font-bold"
                                        >
                                            {index + 1}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Label */}
                            <div className="absolute top-12 whitespace-nowrap text-center">
                                <span className={`text-[12px] font-bold transition-colors duration-300 ${isActive || isCompleted ? "text-[#10b981] dark:text-[#34d399]" : "text-[var(--color-text-muted)]"
                                    }`}>
                                    {lang === "ar" ? step.label_ar : step.label_en}
                                </span>
                            </div>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="relative flex-1 h-[2px] mx-4 bg-black/10 dark:bg-white/10 overflow-hidden rounded-full">
                                <motion.div
                                    className={`absolute top-0 left-0 h-full w-full bg-emerald-600/70 dark:bg-emerald-400/70 ${lang === 'ar' ? 'origin-right' : 'origin-left'}`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                                    transition={{ duration: reducedMotion ? 0 : 0.4, ease: "easeInOut" }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
