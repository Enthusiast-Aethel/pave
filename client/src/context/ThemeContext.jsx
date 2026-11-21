import { createContext, useContext, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

const ThemeContext = createContext(null);
const STORAGE_KEY = "pave_theme";

function getInitialTheme() {
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("theme-dark", isDark);
    localStorage.setItem(STORAGE_KEY, theme);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", "#10233a");
  }, [theme]);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    StatusBar.setOverlaysWebView({ overlay: true })
      .then(() => StatusBar.setStyle({ style: Style.Light }))
      .catch((error) => console.error("Could not configure Android status bar", error));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {Capacitor.getPlatform() === "android" && (
        <div className="status-bar-backdrop" aria-hidden="true" />
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
