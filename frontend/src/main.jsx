import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionProvider } from "@/contexts/SessionContext";

import {
  Home,
  Login,
  Register,
  About,
  TermsandPolicies,
  Onboarding,
  Profile,
  Pending,
  UsersControlPanel,
  TagsControlPanel,
  Wall,
  NewPost,
  Chat,
  Proposals,
} from "@/pages";
import "./global.css";

/*
  TODO: Add ability to create an account as an admin

  // Login & Signup
  // Home
  // About
  // Terms & Conditions
  // Onboarding
  // Profile ( Client / Admin / Freelancer )
  // Users control panel ( Admin )
  // Pending posts ( Admin )
  // Tags control panel ( Admin )
  // The wall
  // Proposals
  * Chat
  
  -- Side drawer
  // Notifications
  -- Modals
  // Create job post
*/

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <SessionProvider>
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
            <Route path="terms-and-policies" element={<TermsandPolicies />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:profileQuery" element={<Profile />} />
            <Route path="pending" element={<Pending />} />
            <Route path="users-control-panel" element={<UsersControlPanel />} />
            <Route path="tags-control-panel" element={<TagsControlPanel />} />
            <Route path="wall" element={<Wall />} />
            <Route path="newpost" element={<NewPost />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:postId" element={<Chat />} />
            <Route path="proposals" element={<Proposals />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </ThemeProvider>
  </StrictMode>
);
