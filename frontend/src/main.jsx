import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home/Home";
import "./global.css";

// Color Scheme
const colorScheme = {
  background: "#08090B", // Black
  whites: "#EEF1F9", // White
  accent: "#FF6B53", // Orange
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" index element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
