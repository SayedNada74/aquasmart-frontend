"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";

export interface ChromaCardProps {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

// Theme-dependent effect palettes
const DARK_THEME = {
    glowColor: "rgba(0,212,170,0.18)",
    overlayAlpha: 0.22,
    saturateBoost: 0.8,
    brightnessBoost: 0.12,
};
const LIGHT_THEME = {
    glowColor: "rgba(0,212,170,0.25)",
    overlayAlpha: 0.22,
    saturateBoost: 0.8,
    brightnessBoost: 0.0,
};

export function ChromaCard({
    children,
    className = "",
    disabled = false,
}: ChromaCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [reducedMotion, setReducedMotion] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const isActiveRef = useRef(false);

    // GSAP quick setters
    const revealSetter = useRef<gsap.QuickToFunc | null>(null);
    const xSetter = useRef<Function | null>(null);
    const ySetter = useRef<Function | null>(null);

    // ── Theme + motion detection ─────────────────────────────────────────
    useEffect(() => {
        // Reduced motion
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener("change", motionHandler);

        // Theme detection via .light-mode on <html>
        const updateTheme = () => {
            setIsDark(!document.documentElement.classList.contains("light-mode"));
        };
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            mq.removeEventListener("change", motionHandler);
            observer.disconnect();
        };
    }, []);

    // ── GSAP setters init ────────────────────────────────────────────────
    useEffect(() => {
        if (reducedMotion || disabled || !cardRef.current) return;

        revealSetter.current = gsap.quickTo(cardRef.current, "--reveal", {
            duration: 0.25,
            ease: "power3.out",
        });
        xSetter.current = gsap.quickSetter(cardRef.current, "--mx", "%");
        ySetter.current = gsap.quickSetter(cardRef.current, "--my", "%");
    }, [reducedMotion, disabled]);

    // ── Computed styles based on theme ────────────────────────────────────
    const theme = isDark ? DARK_THEME : LIGHT_THEME;

    const showEffect = !reducedMotion && !disabled;

    // ── Pointer/focus handlers ─────────────────────────────────────────
    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!showEffect || !cardRef.current || !revealSetter.current || !xSetter.current || !ySetter.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            xSetter.current(x);
            ySetter.current(y);
            if (!isActiveRef.current) {
                isActiveRef.current = true;
                revealSetter.current(1);
            }
        },
        [showEffect]
    );

    const handlePointerLeave = useCallback(() => {
        if (!showEffect || !revealSetter.current) return;
        isActiveRef.current = false;
        gsap.to(cardRef.current, {
            "--reveal": 0,
            duration: 0.4,
            ease: "power2.out",
        });
    }, [showEffect]);

    const handleFocus = useCallback(() => {
        if (!showEffect || !cardRef.current || !revealSetter.current || !xSetter.current || !ySetter.current) return;
        xSetter.current(50);
        ySetter.current(50);
        isActiveRef.current = true;
        revealSetter.current(1);
    }, [showEffect]);

    const handleBlur = useCallback(() => {
        if (!showEffect || !revealSetter.current) return;
        isActiveRef.current = false;
        gsap.to(cardRef.current, {
            "--reveal": 0,
            duration: 0.4,
            ease: "power2.out",
        });
    }, [showEffect]);

    return (
        <div
            ref={cardRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
            className={`group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 light-mode:focus-visible:ring-sky-600/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-primary)] ${className}`}
            style={
                {
                    "--reveal": 0,
                    "--mx": "50%",
                    "--my": "50%",
                } as React.CSSProperties
            }
        >
            {/* ── Glow Overlay ─────────────────────────────────────────────── */}
            {showEffect && (
                <div
                    ref={overlayRef}
                    aria-hidden="true"
                    className="absolute inset-0 z-20 pointer-events-none rounded-[inherit]"
                    style={{
                        background: `radial-gradient(260px circle at var(--mx) var(--my), ${theme.glowColor}, transparent 100%)`,
                        opacity: `calc(var(--reveal) * ${theme.overlayAlpha} * 5)`,
                        mixBlendMode: isDark ? "screen" : "multiply",
                        transition: "opacity 0.1s linear",
                    }}
                />
            )}

            {/* ── Content (receives CSS filter for grayscale→color reveal) ── */}
            <div
                ref={contentRef}
                className="relative z-10 h-full w-full"
                style={{
                    filter: reducedMotion
                        ? "none"
                        : `grayscale(calc(1 - var(--reveal))) saturate(calc(1 + var(--reveal) * ${theme.saturateBoost}))${theme.brightnessBoost > 0 ? ` brightness(calc(1 + var(--reveal) * ${theme.brightnessBoost}))` : ""}`,
                    transition: "filter 0.15s ease",
                }}
            >
                {children}
            </div>
        </div>
    );
}
