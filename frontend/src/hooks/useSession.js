import { useState, useEffect, useCallback } from "react";

// TODO: Fix the file

const useSession = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request("http://localhost:8000/auth/session");
      setUser(data.user);
    } catch (err) {
      // Session check failed, user is not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [request]);

  const login = useCallback(
    async (credentials) => {
      const data = await request(
        "http://localhost:8000/auth/login",
        "POST",
        credentials
      );
      setUser(data.user);
      return data;
    },
    [request]
  );

  const logout = useCallback(async () => {
    try {
      await request("http://localhost:8000/auth/logout", "POST");
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
  }, [request]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return { user, loading, login, logout, checkSession };
};

export default useSession;
