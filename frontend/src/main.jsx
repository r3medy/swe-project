import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import Register from "@/pages/Register/Register";
import About from "@/pages/About/About";
import TermsandConditions from "@/pages/TermsandConditions/TermsandConditions";
import Onboarding from "@/pages/Onboarding/Onboarding";
import Profile from "@/pages/Profile/Profile";
import "./global.css";

/*
  TODO: add ability to change title

  ? Login & Signup
  ? Home
  ? About
  ? Terms & Conditions
  ? Onboarding
  * Profile ( Client / Admin / Freelancer )
  * Chat
  * Users control panel ( Admin )
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
      <UserProvider>
        <BrowserRouter>
          <Toaster
            toastOptions={{
              style: {
                fontFamily: '"Geist", sans-serif',
              },
            }}
          />
          <Routes>
            <Route path="/" index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="about" element={<About />} />
            <Route
              path="terms-and-conditions"
              element={<TermsandConditions />}
            />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:profileQuery" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>
);
