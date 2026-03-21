"use client";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SplitTextProps {
    text: string;
    className?: string;
    as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function SplitText({ text, className = "", as: Tag = "h1" }: SplitTextProps) {
    const reduced = useReducedMotion();
    if (reduced) return <Tag className={className}>{text}</Tag>;

    const chars = text.split("");
    return (
        <Tag className={className} aria-label={text}>
            {chars.map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3, ease: "easeOut" }}
                    style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : undefined }}
                    aria-hidden
                >
                    {char}
                </motion.span>
            ))}
        </Tag>
    );
}
