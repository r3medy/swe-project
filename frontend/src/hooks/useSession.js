import { useState, useCallback, useEffect } from "react";

const useSession = () => {
  const [user, setUser] = useState(null);

  const checkSession = useCallback(async () => {
    try {
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

  return { user, checkSession, login, logout };
};

export default useSession;
