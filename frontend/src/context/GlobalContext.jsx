import { createContext, useState, useMemo, useEffect } from "react";
import { getUser } from "@/api/auth";

export const GlobalContext = createContext(null);

export function GlobalProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuth = async () => {
      try {
        console.log("[GlobalProvider] Checking auth...");
        const userData = await getUser();
        console.log("[GlobalProvider] User data:", userData);
        setUser(userData.user);
      } catch (e) {
        console.log("[GlobalProvider] Auth check failed:", e);
        // Not logged in, stay null
      }
    };
    checkAuth();
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
  }), [user]);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}
