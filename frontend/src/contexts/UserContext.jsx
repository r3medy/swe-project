import { createContext, useContext } from "react";
import useSession from "@/hooks/useSession";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { user, login, logout, checkSession } = useSession();

  return (
    <UserContext.Provider value={{ user, login, logout, checkSession }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");

  return context;
}
