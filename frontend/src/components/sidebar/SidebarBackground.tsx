"use client";

import { useEffect, useState } from "react";

export function SidebarBackground() {
    const [reduced, setReduced] = useState(false);
    const [isDark, setIsDark] = useState(true);

    // Detect prefers-reduced-motion
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Detect theme from <html class="light-mode">
    useEffect(() => {
        const html = document.documentElement;
        const check = () => setIsDark(!html.classList.contains("light-mode"));
        check();

        const observer = new MutationObserver(() => check());
        observer.observe(html, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    // Properties for dark mode elements
    const darkP = {
        bgA: "#020617", // slate-950
        bgB: "#0f172a", // slate-900
        bgC: "#1e293b", // slate-800
        bgD: "#0b3d5e", // custom deep blue
        glow1: "rgba(14,165,233,0.8)", // sky-500
        glow2: "rgba(0,212,170,0.7)", // teal-400
        glow3: "rgba(59,130,246,0.6)", // blue-500
        blobOpacity: 0.15,
        noiseOpacity: 0.04,
        vignetteOpacity: 0.5,
    };

    // Properties for light mode elements (vibrant but clean)
    const lightP = {
        bgA: "#f8fafc", // slate-50
        bgB: "#f1f5f9", // slate-100
        bgC: "#e2e8f0", // slate-200
        bgD: "#f0fdfa", // teal-50
        glow1: "rgba(14,165,233,0.4)", // sky-500 light
        glow2: "rgba(0,212,170,0.3)", // teal-400 light
        glow3: "rgba(186,230,253,0.5)", // light sky
        blobOpacity: 0.8, // higher opacity for light colors
        noiseOpacity: 0.02,
        vignetteOpacity: 0.05,
    };

    const p = isDark ? darkP : lightP;

    return (
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
            {/* ── Animated Gradient (Active in both modes) ── */}
            <div
                className="absolute inset-0 transition-colors duration-700"
                style={{
                    backgroundImage: `linear-gradient(135deg, ${p.bgA} 0%, ${p.bgB} 25%, ${p.bgC} 50%, ${p.bgD} 75%, ${p.bgA} 100%)`,
                    backgroundSize: "400% 400%",
                    animation: reduced ? "none" : "siteGradient 22s ease infinite",
                }}
            />

            {/* ── Floating Glow Blobs (Active in both modes) ── */}
            {!reduced && (
                <>
                    <div
                        className={`absolute rounded-full blur-3xl ${isDark ? "mix-blend-screen" : "mix-blend-multiply"}`}
                        style={{
                            width: "420px",
                            height: "420px",
                            backgroundImage: `radial-gradient(circle, ${p.glow1} 0%, transparent 70%)`,
                            opacity: p.blobOpacity,
                            top: "5%",
                            right: "10%",
                            animation: "blobFloat1 25s ease-in-out infinite",
                        }}
                    />
                    <div
                        className={`absolute rounded-full blur-3xl ${isDark ? "mix-blend-screen" : "mix-blend-multiply"}`}
                        style={{
                            width: "350px",
                            height: "350px",
                            backgroundImage: `radial-gradient(circle, ${p.glow2} 0%, transparent 70%)`,
                            opacity: p.blobOpacity,
                            top: "40%",
                            left: "5%",
                            animation: "blobFloat2 20s ease-in-out infinite",
                        }}
                    />
                    <div
                        className={`absolute rounded-full blur-3xl ${isDark ? "mix-blend-screen" : "mix-blend-multiply"}`}
                        style={{
                            width: "300px",
                            height: "300px",
                            backgroundImage: `radial-gradient(circle, ${p.glow3} 0%, transparent 70%)`,
                            opacity: p.blobOpacity,
                            bottom: "10%",
                            right: "25%",
                            animation: "blobFloat3 18s ease-in-out infinite",
                        }}
                    />
                </>
            )}

            {/* ── Noise Texture (Both Modes) ── */}
            <div
                className="absolute inset-0"
                style={{
                    opacity: p.noiseOpacity,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "200px 200px",
                }}
            />

            {/* ── Depth Vignette (Active in both modes) ── */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: isDark
                        ? "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,1) 100%)"
                        : "radial-gradient(ellipse at center, transparent 40%, rgba(200,200,200,0.1) 100%)",
                    opacity: p.vignetteOpacity,
                }}
            />
            {/* Keyframes injected via style tag */}
            <style jsx>{`
        @keyframes siteGradient {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 50% 100%; }
          75% { background-position: 0% 50%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-15px, 30px) scale(1.15); }
          50% { transform: translate(10px, -20px) scale(0.9); }
          75% { transform: translate(-8px, 15px) scale(1.1); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -25px) scale(1.2); }
          66% { transform: translate(-10px, 20px) scale(0.85); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(12px, -18px) scale(1.1); }
          40% { transform: translate(-15px, 10px) scale(0.95); }
          60% { transform: translate(8px, 20px) scale(1.15); }
          80% { transform: translate(-5px, -12px) scale(0.9); }
        }
      `}</style>
        </div>
    );
}
