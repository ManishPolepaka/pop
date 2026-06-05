import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppTheme = "modern" | "classic";

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const THEME_STORAGE_KEY = "app-theme-preference";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "classic" ? "classic" : "modern";
  });

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.body.classList.toggle("theme-classic", theme === "classic");
  }, [theme]);

  const setTheme = (nextTheme: AppTheme) => {
    setThemeState(nextTheme);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

