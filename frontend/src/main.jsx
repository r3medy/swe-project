import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import Register from "@/pages/Register/Register";
import About from "@/pages/About/About";
import TermsandConditions from "@/pages/TermsandConditions/TermsandConditions";
import Onboarding from "@/pages/Onboarding/Onboarding";
import "./global.css";

/*
  ? Login & Signup
  ? Home
  ? About
  ? Terms & Conditions
  * Onboarding
  * Profile ( Client / Admin / Freelancer )
  * Chat
  * Pending posts ( Admin )
  * The wall
  * Proposals

  -- Modals
  * Job information
  * Notifications
  * Tell user about the contract
  * Create job post
*/

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
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<About />} />
          <Route path="terms-and-conditions" element={<TermsandConditions />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
