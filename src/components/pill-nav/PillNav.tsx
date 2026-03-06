"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────
export type PillNavItem = {
    id: string;
    label: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
};

export interface PillNavProps {
    items: PillNavItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (id: string) => void;
    vertical?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "glass" | "solid";
    activeColor?: string;
    glowColor?: string;
    radiusClass?: string;
    className?: string;
    itemClassName?: string;
    indicatorClassName?: string;
    enableBreathing?: boolean;
    breathingIntensity?: number;
    animateDurationMs?: number;
    onMobileMenuClick?: () => void;
}

// ─── Helpers ────────────────────────────────────────────
function useReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return reduced;
}

// ─── Component ──────────────────────────────────────────
export function PillNav({
    items,
    value,
    defaultValue,
    onValueChange,
    vertical = false,
    size = "md",
    variant = "glass",
    activeColor = "0 212 170",
    glowColor = "0 212 170",
    radiusClass = "rounded-xl",
    className = "",
    itemClassName = "",
    indicatorClassName = "",
    enableBreathing = true,
    breathingIntensity = 0.04,
    animateDurationMs = 380,
}: PillNavProps) {
    const navRef = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
    const breathingRef = useRef<Animation | null>(null);
    const reducedMotion = useReducedMotion();

    const [activeId, setActiveId] = useState(value ?? defaultValue ?? items[0]?.id);

    // Sync controlled value
    useEffect(() => {
        if (value !== undefined) setActiveId(value);
    }, [value]);

    // ─── Measure + Animate indicator ───────────────────
    const updateIndicator = useCallback(() => {
        const nav = navRef.current;
        const indicator = indicatorRef.current;
        const activeEl = itemRefs.current.get(activeId);
        if (!nav || !indicator || !activeEl) return;

        const navRect = nav.getBoundingClientRect();
        const itemRect = activeEl.getBoundingClientRect();

        const target = vertical
            ? {
                top: itemRect.top - navRect.top,
                left: 0,
                width: navRect.width,
                height: itemRect.height,
            }
            : {
                left: itemRect.left - navRect.left,
                top: 0,
                width: itemRect.width,
                height: itemRect.height,
            };

        if (reducedMotion) {
            indicator.style.transform = `translate(${target.left}px, ${target.top}px)`;
            indicator.style.width = `${target.width}px`;
            indicator.style.height = `${target.height}px`;
            return;
        }

        indicator.animate(
            [
                {
                    transform: indicator.style.transform || `translate(0px, 0px)`,
                    width: indicator.style.width || `${target.width}px`,
                    height: indicator.style.height || `${target.height}px`,
                },
                {
                    transform: `translate(${target.left}px, ${target.top}px)`,
                    width: `${target.width}px`,
                    height: `${target.height}px`,
                },
            ],
            {
                duration: animateDurationMs,
                fill: "forwards",
                easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            }
        );

        indicator.style.transform = `translate(${target.left}px, ${target.top}px)`;
        indicator.style.width = `${target.width}px`;
        indicator.style.height = `${target.height}px`;
    }, [activeId, vertical, animateDurationMs, reducedMotion]);

    useEffect(() => {
        updateIndicator();
    }, [updateIndicator]);

    useEffect(() => {
        const resize = () => updateIndicator();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, [updateIndicator]);

    // ─── Breathing ─────────────────────────────────────
    useEffect(() => {
        const indicator = indicatorRef.current;
        if (!indicator || reducedMotion || !enableBreathing) return;

        breathingRef.current = indicator.animate(
            [
                { boxShadow: `0 0 12px 2px rgba(${glowColor} / 0.15)`, transform: indicator.style.transform },
                { boxShadow: `0 0 22px 6px rgba(${glowColor} / 0.3)`, transform: indicator.style.transform },
            ],
            {
                duration: 2000,
                iterations: Infinity,
                direction: "alternate",
                easing: "ease-in-out",
            }
        );

        return () => {
            breathingRef.current?.cancel();
        };
    }, [activeId, enableBreathing, reducedMotion, glowColor]);

    // ─── Handle Selection ─────────────────────────────
    const handleSelect = useCallback(
        (item: PillNavItem) => {
            if (item.disabled) return;
            setActiveId(item.id);
            onValueChange?.(item.id);
            item.onClick?.();
        },
        [onValueChange]
    );

    // ─── Keyboard ─────────────────────────────────────
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, idx: number) => {
            const enabledItems = items.filter((i) => !i.disabled);
            const curIdx = enabledItems.findIndex((i) => i.id === items[idx].id);
            let nextIdx = curIdx;

            const prev = vertical ? "ArrowUp" : "ArrowLeft";
            const next = vertical ? "ArrowDown" : "ArrowRight";

            if (e.key === next) {
                e.preventDefault();
                nextIdx = (curIdx + 1) % enabledItems.length;
            } else if (e.key === prev) {
                e.preventDefault();
                nextIdx = (curIdx - 1 + enabledItems.length) % enabledItems.length;
            } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(items[idx]);
                return;
            } else {
                return;
            }

            const nextItem = enabledItems[nextIdx];
            const el = itemRefs.current.get(nextItem.id);
            el?.focus();
        },
        [items, vertical, handleSelect]
    );

    // ─── Size mapping ─────────────────────────────────
    const sizeClasses = {
        sm: "px-2.5 py-1.5 text-xs gap-1.5",
        md: "px-3 py-2 text-sm gap-2",
        lg: "px-4 py-2.5 text-base gap-2.5",
    };

    return (
        <nav
            ref={navRef}
            role="tablist"
            aria-orientation={vertical ? "vertical" : "horizontal"}
            className={`relative ${vertical ? "flex flex-col" : "flex items-center"} ${radiusClass} ${className}`}
        >
            {/* Animated Pill Indicator */}
            <div
                ref={indicatorRef}
                aria-hidden
                className={`absolute ${radiusClass} pointer-events-none z-0 ${indicatorClassName}`}
                style={{
                    background: `linear-gradient(135deg, rgba(${activeColor} / 0.18), rgba(${activeColor} / 0.08))`,
                    border: `1px solid rgba(${activeColor} / 0.35)`,
                    boxShadow: `0 0 16px 3px rgba(${glowColor} / 0.2)`,
                    top: 0,
                    left: 0,
                    willChange: "transform, width, height",
                }}
            />

            {/* Nav Items */}
            {items.map((item, idx) => {
                const isActive = item.id === activeId;
                const commonClasses = `
          relative z-10 flex items-center ${sizeClasses[size]} ${radiusClass}
          font-medium transition-colors duration-200 cursor-pointer select-none w-full
          ${isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}
          ${item.disabled ? "opacity-30 cursor-not-allowed" : ""}
          ${itemClassName}
        `.trim();

                const content = (
                    <>
                        {item.icon && (
                            <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-[var(--color-cyan)]" : ""}`}>
                                {item.icon}
                            </span>
                        )}
                        <span>{item.label}</span>
                    </>
                );

                if (item.href && !item.disabled) {
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            ref={(el) => {
                                if (el) itemRefs.current.set(item.id, el);
                            }}
                            role="tab"
                            aria-selected={isActive}
                            tabIndex={item.disabled ? -1 : 0}
                            className={commonClasses}
                            onClick={() => handleSelect(item)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                        >
                            {content}
                        </Link>
                    );
                }

                return (
                    <button
                        key={item.id}
                        ref={(el) => {
                            if (el) itemRefs.current.set(item.id, el);
                        }}
                        role="tab"
                        aria-selected={isActive}
                        aria-disabled={item.disabled}
                        tabIndex={item.disabled ? -1 : 0}
                        className={commonClasses}
                        onClick={() => handleSelect(item)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        disabled={item.disabled}
                    >
                        {content}
                    </button>
                );
            })}
        </nav>
    );
}
