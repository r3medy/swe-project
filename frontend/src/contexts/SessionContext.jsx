import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isFetchingSession, setIsFetchingSession] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      setIsFetchingSession(true);
      const response = await fetch("http://localhost:8000/auth/session", {
        method: "GET",
        credentials: "include",
      });
      const { data } = await response.json();
      if (response.ok) {
        setUser(data);
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
      const response = await fetch("http://localhost:8000/auth/login", {
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
      await fetch("http://localhost:8000/auth/logout", {
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
      value={{ user, isFetchingSession, checkSession, login, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
