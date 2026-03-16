"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-[var(--color-bg-input)] rounded-lg";
  const variantClasses = {
    rect: "",
    circle: "rounded-full",
    text: "h-4 w-3/4 mb-2",
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-6 flex flex-col gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function PondCardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function AlertsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-4 flex gap-4 items-center">
          <Skeleton className="h-10 w-10 circle" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
