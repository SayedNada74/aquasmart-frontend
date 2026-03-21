"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { FishSpecies } from "@/app/data/fishGuideData";
import { useApp } from "@/lib/AppContext";
import Image from "next/image";
import { useRef } from "react";

interface InfiniteMenuProps {
    data: FishSpecies[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export function InfiniteMenu({ data, selectedId, onSelect }: InfiniteMenuProps) {
    const { t, lang } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);

    // Duplicate data to create infinite effect
    const menuItems = [...data, ...data, ...data, ...data];
    const itemWidth = 184; // w-40 (160px) + gap-6 (24px)
    const fullSetWidth = data.length * itemWidth;

    const isRtl = lang === 'ar';

    return (
        <div className="relative w-full overflow-hidden py-10 bg-[var(--color-bg-base)]/50 border-y border-[var(--color-border)]" dir="ltr">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--color-bg-base)] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--color-bg-base)] to-transparent z-10 pointer-events-none" />

            <motion.div 
                className="flex gap-6 px-10 items-center cursor-grab active:cursor-grabbing"
                initial={{ x: 0 }}
                animate={{ x: -fullSetWidth }}
                transition={{ 
                    duration: data.length * 4, // Smooth professional speed
                    repeat: Infinity, 
                    ease: "linear",
                }}
            >
                {menuItems.map((item, idx) => (
                    <button
                        key={`${item.id}-${idx}`}
                        onClick={() => onSelect(item.id)}
                        className={`group relative flex-shrink-0 transition-all duration-500 ${
                            selectedId === item.id 
                            ? "scale-110 opacity-100" 
                            : "scale-90 opacity-40 hover:opacity-100 hover:scale-100"
                        }`}
                        style={{ width: 160 }}
                    >
                        <div className={`relative w-40 h-40 rounded-full overflow-hidden border-4 transition-all duration-500 ${
                            selectedId === item.id ? "border-[var(--color-cyan)] shadow-[0_0_30px_rgba(34,211,238,0.4)]" : "border-[var(--color-border)]"
                        }`}>
                            <img 
                                src={item.image} 
                                alt={item.nameEn} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                            />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                                <span className="text-white font-black text-sm drop-shadow-lg leading-tight" dir={isRtl ? 'rtl' : 'ltr'}>
                                    {isRtl ? item.nameAr : item.nameEn}
                                </span>
                            </div>
                        </div>
                        
                        {selectedId === item.id && (
                            <motion.div 
                                layoutId="active-indicator"
                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_var(--color-cyan)]"
                            />
                        )}
                    </button>
                ))}
            </motion.div>
        </div>
    );
}
