"use client";

import { Bell, LayoutGrid, Radio, Search, Waves } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { database } from "@/lib/firebase";
import { buildSearchIndex, getSearchResults, type SearchPond, type SearchResult, type SearchResultType } from "@/lib/search";

const resultIcons = {
  pond: <Waves className="h-4 w-4" />,
  sensor: <Radio className="h-4 w-4" />,
  page: <LayoutGrid className="h-4 w-4" />,
  action: <LayoutGrid className="h-4 w-4" />,
  section: <LayoutGrid className="h-4 w-4" />,
} as const;

const RESULT_LABELS: Record<SearchResultType, { ar: string; en: string }> = {
  page: { ar: "صفحة", en: "Page" },
  pond: { ar: "حوض", en: "Pond" },
  sensor: { ar: "مستشعر", en: "Sensor" },
  action: { ar: "إجراء", en: "Action" },
  section: { ar: "قسم", en: "Section" },
};

export function GlobalSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { dir, lang, t } = useApp();
  const [query, setQuery] = useState("");
  const [ponds, setPonds] = useState<SearchPond[]>([]);
  const [loadingPonds, setLoadingPonds] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pondsRef = ref(database, "ponds");
    const unsubscribe = onValue(pondsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setPonds([]);
        setLoadingPonds(false);
        return;
      }

      setPonds(
        Object.keys(data).map((key, index) => ({
          id: key,
          number: index + 1,
          label_ar: `حوض ${index + 1}`,
          label_en: `Pond ${index + 1}`,
        })),
      );
      setLoadingPonds(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  }, [pathname]);

  const searchIndex = useMemo(() => buildSearchIndex(ponds), [ponds]);
  const results = useMemo(() => getSearchResults(query, searchIndex), [query, searchIndex]);
  const groupedResults = useMemo(() => {
    const order: SearchResultType[] = ["page", "pond", "sensor", "action", "section"];
    return order
      .map((type) => ({
        type,
        items: results.filter((result) => result.type === type),
      }))
      .filter((group) => group.items.length > 0);
  }, [results]);

  const selectResult = (result: SearchResult) => {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    router.push(result.href);
  };

  const submitSearch = () => {
    if (!query.trim()) {
      return;
    }

    const selected = activeIndex >= 0 ? results[activeIndex] : results[0];
    if (selected) {
      selectResult(selected);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="relative hidden sm:block max-w-xs w-full" ref={rootRef}>
      <Search className={`absolute top-2.5 w-4 h-4 text-[var(--color-text-muted)] ${dir === "rtl" ? "right-3" : "left-3"}`} />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (query.trim()) {
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => (results.length ? Math.min(current + 1, results.length - 1) : -1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
          } else if (event.key === "Enter") {
            event.preventDefault();
            submitSearch();
          } else if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        placeholder={t("ابحث عن صفحة أو حوض أو ميزة...", "Search pages, ponds, or features...")}
        className={`w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-cyan)] focus:ring-1 focus:ring-[var(--color-cyan)]/30 transition-shadow ${dir === "rtl" ? "pr-9 pl-4 text-right" : "pl-9 pr-4 text-left"}`}
      />

      {open && query.trim() && (
        <div className="absolute inset-x-0 top-11 z-50 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/95 backdrop-blur-xl shadow-xl">
          <div className="max-h-80 overflow-y-auto py-2">
            {results.length > 0 ? (
              groupedResults.map((group) => (
                <div key={group.type} className="py-1">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {lang === "ar" ? RESULT_LABELS[group.type].ar : RESULT_LABELS[group.type].en}
                  </div>
                  {group.items.map((result) => {
                    const resultIndex = results.findIndex((item) => item.id === result.id);
                    return (
                      <button
                        key={result.id}
                        onMouseEnter={() => setActiveIndex(resultIndex)}
                        onClick={() => selectResult(result)}
                        className={`flex w-full items-start gap-3 px-3 py-2.5 transition-colors ${dir === "rtl" ? "text-right" : "text-left"} ${activeIndex === resultIndex ? "bg-[var(--color-cyan)]/10" : "hover:bg-[var(--color-bg-card-hover)]"}`}
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                            result.type === "pond"
                              ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                              : result.type === "sensor"
                                ? "bg-[#3b82f6]/10 text-[#3b82f6]"
                                : result.id === "page_alerts"
                                  ? "bg-[#ef4444]/10 text-[#ef4444]"
                                  : result.type === "action"
                                    ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                                    : "bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]"
                          }`}
                        >
                          {result.id === "page_alerts" ? <Bell className="h-4 w-4" /> : resultIcons[result.type]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                              {lang === "ar" ? result.title_ar : result.title_en}
                            </p>
                            <span className="rounded-full bg-[var(--color-bg-input)] px-2 py-0.5 text-[9px] font-bold text-[var(--color-text-muted)]">
                              {lang === "ar" ? RESULT_LABELS[result.type].ar : RESULT_LABELS[result.type].en}
                            </span>
                          </div>
                          <p className="truncate text-[11px] text-[var(--color-text-muted)]">
                            {lang === "ar" ? result.subtitle_ar : result.subtitle_en}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-[var(--color-text-muted)]">
                {loadingPonds ? t("جاري تجهيز نتائج البحث...", "Preparing search results...") : t("لا توجد نتائج مطابقة", "No matching results")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
