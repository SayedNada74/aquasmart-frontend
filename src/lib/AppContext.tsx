"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

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
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>("ar");
    const [theme, setThemeState] = useState<Theme>("dark");
    const [userName, setUserNameState] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [lowPowerMode, setLowPowerModeState] = useState(false);
    const userRole = lang === "ar" ? "مدير المزرعة" : "Farm Manager";

    // Load persisted settings on mount
    useEffect(() => {
        const savedLang = localStorage.getItem("aquasmart_lang") as Language;
        if (savedLang) setLangState(savedLang);

        const savedTheme = localStorage.getItem("aquasmart_theme") as Theme;
        if (savedTheme) setThemeState(savedTheme);

        const savedPower = localStorage.getItem("aquasmart_power");
        if (savedPower === "true") setLowPowerModeState(true);
    }, []);

    const setLang = (l: Language) => {
        setLangState(l);
        localStorage.setItem("aquasmart_lang", l);
    };

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem("aquasmart_theme", t);
    };

    const setLowPowerMode = (mode: boolean) => {
        setLowPowerModeState(mode);
        localStorage.setItem("aquasmart_power", mode ? "true" : "false");
    };

    // Listen to Firebase auth state
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            if (user) {
                setIsLoggedIn(true);
                setUserEmail(user.email || "");

                // Load name from Firebase RTDB
                try {
                    const { ref, get } = await import("firebase/database");
                    const { database } = await import("@/lib/firebase");
                    const userRef = ref(database, `users/${user.uid}`);
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setUserNameState(data.name || user.displayName || user.email || "");
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
            }
        });
        return () => unsub();
    }, []);

    const setUserName = async (name: string) => {
        setUserNameState(name);
        if (firebaseUser) {
            try {
                const { ref, update } = await import("firebase/database");
                const { database } = await import("@/lib/firebase");
                const userRef = ref(database, `users/${firebaseUser.uid}`);
                await update(userRef, { name: name });
            } catch (err) {
                console.error("Error updating user name:", err);
            }
        }
    };

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

    const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
    const dir = lang === "ar" ? "rtl" : "ltr";

    return (
        <AppContext.Provider value={{ lang, setLang, theme, setTheme, t, dir, userName, setUserName, userRole, userEmail, firebaseUser, isLoggedIn, lowPowerMode, setLowPowerMode }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
