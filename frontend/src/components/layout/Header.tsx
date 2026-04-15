"use client";

import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang, userPhotoUrl } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  if (pathname === "/login" || pathname === "/") return null;

  const pageNames: Record<string, string> = {
    "/dashboard": t("لوحة القيادة", "Dashboard"),
    "/ponds": t("الأحواض", "Ponds"),
    "/sensors": t("المستشعرات", "Sensors"),
    "/ai-center": t("مركز الذكاء الاصطناعي", "AI Center"),
    "/control": t("التحكم الذكي", "Smart Control"),
    "/reports": t("التقارير", "Reports"),
    "/alerts": t("التنبيهات", "Alerts"),
    "/market": t("السوق", "Market"),
    "/settings": t("الإعدادات", "Settings"),
  };

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let unsub: any;
    const loadNotifs = async () => {
      try {
        const { ref, onValue } = await import("firebase/database");
        const { database } = await import("@/lib/firebase");

        const historyRef = ref(database, "alerts_history");
        unsub = onValue(historyRef, (snap) => {
          const data = snap.val();
          if (!data) {
            setNotifications([]);
            return;
          }
          const notifs = Object.entries(data)
            .map(([id, val]: any) => ({
              id,
              ...val,
              text: lang === "ar" ? `${val?.title_ar || "تنبيه"}: ${val?.desc_ar || ""}` : `${val?.title_en || "Alert"}: ${val?.desc_en || ""}`,
              type: val.type || "info",
              time: new Date(val.timestamp || Date.now()).toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })
            }))
            .filter((n) => n.read === false)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          setNotifications(notifs.slice(0, 5));
        });
      } catch (err) {
        console.error("Error config notifs:", err);
      }
    };

    loadNotifs();

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [lang]);

  const markAsRead = async (id: string) => {
    if (!id) return;
    try {
      const { ref, update } = await import("firebase/database");
      const { database } = await import("@/lib/firebase");
      await update(ref(database, `alerts_history/${id}`), { read: true });
    } catch (e) {
      console.error("Error marking read", e);
    }
  };

  useEffect(() => {
    if (pageNames[pathname]) {
      document.title = `${pageNames[pathname]} | AquaSmart AI`;
    }
  }, [pathname, lang]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 md:h-16 glass border-b border-[var(--color-border)] flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onMenuToggle} className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Menu className="w-6 h-6" />
        </button>
        <GlobalSearchBar />
      </div>

      <div className="flex items-center gap-3">
        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-teal)] shadow-lg shadow-[var(--color-cyan)]/20">
          <h2 className="text-sm md:text-base font-bold text-white whitespace-nowrap">{pageNames[pathname] || ""}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full border border-[#10b981]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          {t("النظام متصل", "System Online")}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end">
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="w-9 h-9 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-all"
          title={lang === "ar" ? "Switch to English" : "تغيير للغة العربية"}
        >
          {lang === "ar" ? "EN" : "ع"}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              setShowProfile(false);
            }}
            className="relative w-9 h-9 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-cyan)] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 right-0 min-w-[16px] h-4 bg-[#ef4444] rounded-full text-[9px] text-white flex items-center justify-center font-bold px-1 z-10 shadow-sm border border-[var(--color-bg-card)]">{notifications.length}</span>
            )}
          </button>
          {showNotif && (
            <div className={`absolute top-12 w-72 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden ${lang === "ar" ? "left-0" : "right-0 md:left-auto"}`}>
              <div className="p-3 border-b border-[var(--color-border)]">
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{t("الإشعارات", "Notifications")}</p>
              </div>
              {notifications.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-[var(--color-text-muted)]">
                  {t("لا توجد إشعارات جديدة", "No new notifications")}
                </div>
              )}
              {notifications.map((n, i) => (
                <div key={n.id || i} onClick={() => markAsRead(n.id)} className="px-3 py-2.5 border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-card-hover)] cursor-pointer transition-colors">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "danger" ? "bg-[#ef4444]" : n.type === "info" ? "bg-[#3b82f6]" : "bg-[#10b981]"}`} />
                    <div>
                      <p className="text-xs text-[var(--color-text-primary)]">{n.text}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/alerts" onClick={() => setShowNotif(false)} className="block p-2.5 text-center text-xs text-[var(--color-cyan)] hover:bg-[var(--color-bg-card-hover)]">
                {t("عرض الكل", "View All")}
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotif(false);
            }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] flex items-center justify-center overflow-hidden">
              {userPhotoUrl ? (
                <img src={userPhotoUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)] hidden sm:block" />
          </button>
          {showProfile && (
            <div className={`absolute top-12 w-48 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden ${lang === "ar" ? "left-0" : "right-0 md:left-auto"}`}>
              <Link href="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-card-hover)] text-sm text-[var(--color-text-primary)]">
                <Settings className="w-4 h-4 text-[var(--color-text-muted)]" />
                {t("الإعدادات", "Settings")}
              </Link>
              <button
                onClick={async () => {
                  setShowProfile(false);
                  const { signOut } = await import("firebase/auth");
                  const { auth } = await import("@/lib/firebase");
                  await signOut(auth);
                  localStorage.removeItem("aquasmart_profile");
                  localStorage.removeItem("aquasmart_notifs");
                  router.push("/login");
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-card-hover)] text-sm text-[#ef4444] w-full border-t border-[var(--color-border)]"
              >
                <LogOut className="w-4 h-4" />
                {t("تسجيل الخروج", "Sign Out")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
