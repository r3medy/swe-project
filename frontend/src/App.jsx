import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";

import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { SessionProvider } from "@/contexts/SessionProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { APP_ROUTES } from "@/routes";

const TOAST_OPTIONS = {
  style: {
    fontFamily: '"Geist", sans-serif',
  },
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SessionProvider>
          <BrowserRouter>
            <Toaster toastOptions={TOAST_OPTIONS} />
            <Routes>
              {APP_ROUTES.map((route) => (
                <Route key={route.path} {...route} />
              ))}
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
