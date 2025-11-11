import { createContext, useContext } from "react";

// SYSTEM | DARK | LIGHT
export const ThemeContext = createContext("SYSTEM");
export const useThemeContext = () => useContext(ThemeContext);
