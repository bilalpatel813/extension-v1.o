"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "pursuit-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The blocking script in <head> (see layout.tsx) already sets
  // document.documentElement's data-theme before paint, so we just read
  // it back here to keep React state in sync — this never causes a flash.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // One-time sync from the attribute the blocking <head> script already set
    // before hydration — not a derived-state anti-pattern.
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (current) setTheme(current);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
