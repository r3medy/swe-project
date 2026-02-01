import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  use,
} from "react";

const AVAILABLE_THEMES = ["light", "dark"];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    // Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setNewTheme = useCallback((newTheme) => {
    setTheme((prev) => (AVAILABLE_THEMES.includes(newTheme) ? newTheme : prev));
  }, []);

  return (
    <ThemeContext.Provider
      value={useMemo(
        () => ({ theme, toggleTheme, setNewTheme }),
        [theme, toggleTheme, setNewTheme],
      )}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
