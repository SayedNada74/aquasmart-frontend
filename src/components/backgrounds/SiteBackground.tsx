"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/AppContext";

// ── Theme palettes ──────────────────────────────────────────────────────────
const DARK = {
    bgA: "#0a0e1a",
    bgB: "#0d1520",
    bgC: "#071020",
    bgD: "#05090f",
    glow1: "rgba(0,212,170,0.25)",
    glow2: "rgba(14,165,233,0.18)",
    blobOpacity: 1,
};

const LIGHT = {
    bgA: "#cbe4f5", // Exact match base
    bgB: "#b5d8ef", // Slightly deeper
    bgC: "#d6ebf8", // Slightly lighter
    bgD: "#c0dff2", // Mid-tone match
    glow1: "rgba(255, 255, 255, 0.6)", // White highlights 
    glow2: "rgba(14, 165, 233, 0.2)", // Subtle deep blue contrast
    blobOpacity: 1,
};

// ── Keyframes (injected once) ────────────────────────────────────────────────
const STYLES = `
@keyframes siteGradient {
  0%   { background-position: 0%   50% }
  50%  { background-position: 100% 50% }
  100% { background-position: 0%   50% }
}
@keyframes siteBlob1 {
  0%, 100% { transform: translate(0, 0) scale(1)   }
  33%       { transform: translate(30px, -40px) scale(1.1) }
  66%       { transform: translate(-20px, 20px) scale(0.95) }
}
@keyframes siteBlob2 {
  0%, 100% { transform: translate(0, 0) scale(1)   }
  33%       { transform: translate(-30px, 40px) scale(1.08) }
  66%       { transform: translate(20px, -25px) scale(0.97) }
}
@keyframes noiseDrift {
  0% { transform: translateY(0) translateX(0); }
  100% { transform: translateY(-50px) translateX(-50px); }
}
`;

export function SiteBackground() {
    const { lowPowerMode } = useApp();
    const [isDark, setIsDark] = useState(true);
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        // Reduced motion
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);

        // Theme detection — watches for the .light-mode class on <html>
        const update = () =>
            setIsDark(!document.documentElement.classList.contains("light-mode"));
        update();
        const obs = new MutationObserver(update);
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            mq.removeEventListener("change", handler);
            obs.disconnect();
        };
    }, []);

    const p = isDark ? DARK : LIGHT;
    const isPaused = reduced || lowPowerMode;

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
            <style>{STYLES}</style>

            {/* ── Animated Gradient ── */}
            <div
                className="absolute inset-0 transition-colors duration-700"
                style={{
                    backgroundImage: `linear-gradient(135deg, ${p.bgA} 0%, ${p.bgB} 25%, ${p.bgC} 50%, ${p.bgD} 75%, ${p.bgA} 100%)`,
                    backgroundSize: "400% 400%",
                    animation: isPaused ? "none" : "siteGradient 22s ease infinite",
                }}
            />

            {/* ── Floating Glow Blobs ── */}
            {!isPaused && (
                <>
                    <div
                        className="absolute rounded-full blur-[80px] mix-blend-screen"
                        style={{
                            width: "600px",
                            height: "600px",
                            backgroundImage: `radial-gradient(circle, ${p.glow1} 0%, transparent 60%)`,
                            opacity: p.blobOpacity,
                            top: "0%",
                            right: "5%",
                            animation: "siteBlob1 15s ease-in-out infinite",
                        }}
                    />
                    <div
                        className="absolute rounded-full blur-[100px] mix-blend-screen"
                        style={{
                            width: "800px",
                            height: "800px",
                            backgroundImage: `radial-gradient(circle, ${p.glow2} 0%, transparent 60%)`,
                            opacity: p.blobOpacity,
                            bottom: "-15%",
                            left: "-10%",
                            animation: "siteBlob2 18s ease-in-out infinite",
                        }}
                    />
                    <div
                        className="absolute rounded-full blur-[60px] mix-blend-screen"
                        style={{
                            width: "500px",
                            height: "500px",
                            backgroundImage: `radial-gradient(circle, ${p.glow1} 0%, transparent 60%)`,
                            opacity: p.blobOpacity * 0.8,
                            top: "30%",
                            left: "40%",
                            animation: "siteBlob1 22s ease-in-out infinite reverse",
                        }}
                    />
                </>
            )}

            {/* ── Dynamic Noise Overlay ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.055] mix-blend-overlay">
                <div
                    className="absolute inset-[-50px]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        backgroundSize: "200px 200px",
                        animation: isPaused ? "none" : "noiseDrift 8s linear infinite",
                    }}
                />
            </div>

            {/* ── Radial Vignette ── */}
            <div
                className="absolute inset-0"
                style={{
                    background: isDark
                        ? "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)"
                        : "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.04) 100%)",
                }}
            />
        </div>
    );
}
