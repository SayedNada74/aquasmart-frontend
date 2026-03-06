"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedContentProps {
    children: React.ReactNode;
    as?: React.ElementType;
    animation?: "fadeUp" | "fadeIn" | "scaleIn";
    durationMs?: number;
    delayMs?: number;
    once?: boolean;
    threshold?: number;
    className?: string;
}

export function AnimatedContent({
    children,
    as: Component = "div",
    animation = "fadeUp",
    durationMs = 600,
    delayMs = 0,
    once = true,
    threshold = 0.15,
    className = "",
}: AnimatedContentProps) {
    const mountRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        // Check for prefers-reduced-motion
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mq.matches) {
            setReducedMotion(true);
            return;
        }

        const currentRef = mountRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && currentRef) {
                        observer.unobserve(currentRef);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin: "0px 0px -50px 0px", // triggers slightly before purely coming into view
            }
        );

        observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [once, threshold]);

    // If reduced motion, just render normally without styles
    if (reducedMotion) {
        return (
            <Component ref={mountRef} className={className}>
                {children}
            </Component>
        );
    }

    // Animation Maps
    const baseStyle: React.CSSProperties = {
        transition: `opacity ${durationMs}ms ease-out, transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delayMs}ms`,
        opacity: isVisible ? 1 : 0,
        willChange: "opacity, transform",
    };

    const animations: Record<string, React.CSSProperties> = {
        fadeUp: {
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
        },
        fadeIn: {
            transform: "none",
        },
        scaleIn: {
            transform: isVisible ? "scale(1)" : "scale(0.95)",
        },
    };

    const combinedStyles = {
        ...baseStyle,
        ...(animations[animation] || animations.fadeUp),
    };

    return (
        <Component ref={mountRef} className={className} style={combinedStyles}>
            {children}
        </Component>
    );
}
