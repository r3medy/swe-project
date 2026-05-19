import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./theme-context";

const AVAILABLE_THEMES = ["light", "dark"];

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (AVAILABLE_THEMES.includes(savedTheme)) return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...AVAILABLE_THEMES);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((previousTheme) =>
      previousTheme === "dark" ? "light" : "dark",
    );
  }, []);

  const setNewTheme = useCallback((newTheme) => {
    setTheme((previousTheme) =>
      AVAILABLE_THEMES.includes(newTheme) ? newTheme : previousTheme,
    );
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setNewTheme }),
    [theme, toggleTheme, setNewTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
