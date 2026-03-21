"use client";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div className={`animate-pulse rounded-xl bg-[var(--color-bg-card)] ${className}`} />
    );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
    return (
        <div className={`card animate-pulse ${className}`}>
            <div className="h-4 w-2/3 bg-[var(--color-border)] rounded mb-3" />
            <div className="h-8 w-1/2 bg-[var(--color-border)] rounded mb-2" />
            <div className="h-3 w-full bg-[var(--color-border)] rounded" />
        </div>
    );
}

export function SkeletonSensor({ className = "" }: SkeletonProps) {
    return (
        <div className={`card animate-pulse ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-16 bg-[var(--color-border)] rounded" />
                <div className="h-4 w-32 bg-[var(--color-border)] rounded" />
            </div>
            <div className="h-12 w-24 bg-[var(--color-border)] rounded mb-2" />
            <div className="h-16 w-full bg-[var(--color-border)] rounded" />
        </div>
    );
}
