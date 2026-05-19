import { useCallback, useEffect, useMemo, useState } from "react";
import { get, post } from "@/utils/request";
import { SessionContext } from "./session-context";

const isSameUser = (previousUser, nextUser) => {
  if (previousUser === null && nextUser === null) return true;
  if (previousUser === null || nextUser === null) return false;

  return (
    previousUser.userId === nextUser.userId &&
    previousUser.role === nextUser.role &&
    previousUser.username === nextUser.username &&
    previousUser.email === nextUser.email
  );
};

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isFetchingSession, setIsFetchingSession] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      setIsFetchingSession(true);
      const { data } = await get("/auth/session");
      setUser((previousUser) =>
        isSameUser(previousUser, data) ? previousUser : data,
      );
    } catch {
      setUser(null);
    } finally {
      setIsFetchingSession(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await post("/auth/login", credentials);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value = useMemo(
    () => ({ user, isFetchingSession, checkSession, login, logout }),
    [user, isFetchingSession, checkSession, login, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
