"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { auth, database } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { ref, get, update } from "firebase/database";

type Language = "ar" | "en";
type Theme = "dark" | "light";

interface AppContextType {
    lang: Language;
    setLang: (l: Language) => void;
    theme: Theme;
    setTheme: (t: Theme) => void;
    t: (ar: string, en: string) => string;
    dir: "rtl" | "ltr";
    userName: string;
    setUserName: (n: string) => void;
    userRole: string;
    userEmail: string;
    firebaseUser: FirebaseUser | null;
    isLoggedIn: boolean;
    lowPowerMode: boolean;
    setLowPowerMode: (mode: boolean) => void;
    pondCount: number;
    setPondCount: (count: number) => void;
    userPhotoUrl: string | null;
    setUserPhotoUrl: (url: string | null) => void;
}

const AppContext = createContext<AppContextType>({
    lang: "ar",
    setLang: () => { },
    theme: "dark",
    setTheme: () => { },
    t: (ar) => ar,
    dir: "rtl",
    userName: "",
    setUserName: () => { },
    userRole: "",
    userEmail: "",
    firebaseUser: null,
    isLoggedIn: false,
    lowPowerMode: false,
    setLowPowerMode: () => { },
    pondCount: 3,
    setPondCount: () => { },
    userPhotoUrl: null,
    setUserPhotoUrl: () => { },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>("ar");
    const [theme, setThemeState] = useState<Theme>("dark");
    const [userName, setUserNameState] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [lowPowerMode, setLowPowerModeState] = useState(false);
    const [pondCount, setPondCountState] = useState(3);
    const [userPhotoUrl, setUserPhotoUrlState] = useState<string | null>(null);
    const userRole = lang === "ar" ? "مدير المزرعة" : "Farm Manager";

    // Load persisted settings on mount
    useEffect(() => {
        const savedLang = localStorage.getItem("aquasmart_lang") as Language;
        if (savedLang) setLangState(savedLang);

        const savedTheme = localStorage.getItem("aquasmart_theme") as Theme;
        if (savedTheme) setThemeState(savedTheme);

        const savedPower = localStorage.getItem("aquasmart_power");
        if (savedPower === "true") setLowPowerModeState(true);

        const savedPonds = localStorage.getItem("aquasmart_pond_count");
        if (savedPonds) setPondCountState(parseInt(savedPonds));
    }, []);

    const setLang = useCallback(async (l: Language) => {
        setLangState(l);
        localStorage.setItem("aquasmart_lang", l);
        if (firebaseUser) {
            try {
                await update(ref(database, `users/${firebaseUser.uid}/settings/display`), { lang: l });
            } catch (err) { console.error("Error syncing lang:", err); }
        }
    }, [firebaseUser]);

    const setTheme = useCallback(async (t: Theme) => {
        setThemeState(t);
        localStorage.setItem("aquasmart_theme", t);
        if (firebaseUser) {
            try {
                await update(ref(database, `users/${firebaseUser.uid}/settings/display`), { theme: t });
            } catch (err) { console.error("Error syncing theme:", err); }
        }
    }, [firebaseUser]);

    const setLowPowerMode = useCallback(async (mode: boolean) => {
        setLowPowerModeState(mode);
        localStorage.setItem("aquasmart_power", mode ? "true" : "false");
        if (firebaseUser) {
            try {
                await update(ref(database, `users/${firebaseUser.uid}/settings/performance`), { lowPowerMode: mode });
            } catch (err) { console.error("Error syncing power mode:", err); }
        }
    }, [firebaseUser]);

    const setPondCount = useCallback(async (count: number) => {
        setPondCountState(count);
        localStorage.setItem("aquasmart_pond_count", count.toString());
        if (firebaseUser) {
            try {
                await update(ref(database, `users/${firebaseUser.uid}/settings/farm`), { activePonds: count });
            } catch (err) { console.error("Error syncing pond count:", err); }
        }
    }, [firebaseUser]);

    // Listen to Firebase auth state
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            if (user) {
                setIsLoggedIn(true);
                setUserEmail(user.email || "");

                // Load name and settings from Firebase RTDB
                try {
                    const userRef = ref(database, `users/${user.uid}`);
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setUserNameState(data.fullName || data.name || user.displayName || user.email || "");
                        if (data.photoURL || data.profilePic) setUserPhotoUrlState(data.photoURL || data.profilePic);
                        else setUserPhotoUrlState(user.photoURL);
                        
                        // Sync Display Settings
                        if (data.settings?.display?.lang) setLangState(data.settings.display.lang);
                        if (data.settings?.display?.theme) setThemeState(data.settings.display.theme);
                        if (data.settings?.performance?.lowPowerMode !== undefined) {
                            setLowPowerModeState(data.settings.performance.lowPowerMode);
                        }
                        if (data.settings?.farm?.activePonds !== undefined) {
                            setPondCountState(data.settings.farm.activePonds);
                        }
                    } else {
                        setUserNameState(user.displayName || user.email || "");
                    }
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                    setUserNameState(user.displayName || user.email || "");
                }
            } else {
                setIsLoggedIn(false);
                setUserNameState("");
                setUserEmail("");
                setUserPhotoUrlState(null);
            }
        });
        return () => unsub();
    }, []);

    const setUserName = useCallback(async (name: string) => {
        setUserNameState(name);
        if (firebaseUser) {
            try {
                const userRef = ref(database, `users/${firebaseUser.uid}`);
                await update(userRef, { name: name });
            } catch (err) {
                console.error("Error updating user name:", err);
            }
        }
    }, [firebaseUser]);

    const setUserPhotoUrl = useCallback(async (url: string | null) => {
        setUserPhotoUrlState(url);
        if (firebaseUser) {
            try {
                const userRef = ref(database, `users/${firebaseUser.uid}`);
                await update(userRef, { photoURL: url });
            } catch (err) {
                console.error("Error updating user photo:", err);
            }
        }
    }, [firebaseUser]);

    useEffect(() => {
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "light") {
            document.documentElement.classList.add("light-mode");
        } else {
            document.documentElement.classList.remove("light-mode");
        }
    }, [theme]);

    const t = useCallback((ar: string, en: string) => (lang === "ar" ? ar : en), [lang]);
    const dir = (lang === "ar" ? "rtl" : "ltr") as "rtl" | "ltr";

    const value = useMemo(() => ({
        lang, setLang, theme, setTheme, t, dir, userName, setUserName, userRole, userEmail, firebaseUser, isLoggedIn, lowPowerMode, setLowPowerMode, pondCount, setPondCount, userPhotoUrl, setUserPhotoUrl
    }), [lang, setLang, theme, setTheme, t, dir, userName, setUserName, userRole, userEmail, firebaseUser, isLoggedIn, lowPowerMode, setLowPowerMode, pondCount, setPondCount, userPhotoUrl, setUserPhotoUrl]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
