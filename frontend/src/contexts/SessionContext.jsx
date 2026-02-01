import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  use,
} from "react";
import { API_BASE_URL } from "@/config";

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isFetchingSession, setIsFetchingSession] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      setIsFetchingSession(true);
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: "GET",
        credentials: "include",
      });
      const { data } = await response.json();
      if (response.ok) {
        // Only update if user actually changes to avoid re-renders
        setUser((prev) =>
          JSON.stringify(prev) !== JSON.stringify(data) ? data : prev,
        );
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsFetchingSession(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <SessionContext.Provider
      value={useMemo(
        () => ({ user, isFetchingSession, checkSession, login, logout }),
        [user, isFetchingSession, checkSession, login, logout],
      )}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = use(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
