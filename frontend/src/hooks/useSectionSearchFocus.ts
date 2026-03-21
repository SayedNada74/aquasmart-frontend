"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";

export function useSectionSearchFocus(searchParams: ReadonlyURLSearchParams, allowedSections: readonly string[]) {
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const allowedKey = allowedSections.join("|");
  const allowedSectionSet = useMemo(() => new Set(allowedSections), [allowedKey]);

  useEffect(() => {
    const rawSection = searchParams.get("section");
    if (!rawSection) return;

    const section = allowedSectionSet.has(rawSection) ? rawSection : null;
    if (!section) return;

    setHighlightedSection(section);

    const scrollTimer = window.setTimeout(() => {
      sectionRefs.current[section]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 120);

    const clearTimer = window.setTimeout(() => {
      setHighlightedSection((current) => (current === section ? null : current));
    }, 2600);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [allowedKey, allowedSectionSet, searchParams]);

  const registerSectionRef =
    (section: string) =>
    (node: HTMLDivElement | null) => {
      sectionRefs.current[section] = node;
    };

  const getSectionHighlightClass = (section: string) =>
    highlightedSection === section ? "border-[var(--color-cyan)] shadow-lg shadow-[var(--color-cyan)]/15 transition-all duration-300" : "";

  return {
    highlightedSection,
    registerSectionRef,
    getSectionHighlightClass,
  };
}
