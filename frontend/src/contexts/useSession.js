import { use } from "react";
import { SessionContext } from "./session-context";

export function useSession() {
  const context = use(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
