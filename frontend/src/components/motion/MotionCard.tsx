"use client";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useState, useEffect } from "react";

interface MotionCardProps {
    children: React.ReactNode;
    className?: string;
}

export function MotionCard({ children, className = "" }: MotionCardProps) {
    const reduced = useReducedMotion();
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const update = () =>
            setIsDark(!document.documentElement.classList.contains("light-mode"));
        update();
        const obs = new MutationObserver(update);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => obs.disconnect();
    }, []);

    // Shadow adapts to theme
    const hoverShadow = isDark
        ? "0 12px 40px rgba(0, 212, 170, 0.25), 0 0 20px rgba(0, 212, 170, 0.1)"
        : "0 12px 40px rgba(14, 165, 233, 0.45), 0 4px 16px rgba(0, 0, 0, 0.15)";
    const hoverBorder = isDark
        ? "rgba(0, 212, 170, 0.4)"
        : "rgba(14, 165, 233, 0.6)";

    if (reduced) return <div className={className}>{children}</div>;
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: hoverShadow,
                borderColor: hoverBorder,
                transition: { duration: 0.2, ease: "easeOut" },
            }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.div>
    );
}
