import { createContext, useState, useMemo, useEffect } from "react";
import { getUser } from "@/api/auth";

export const GlobalContext = createContext(null);

export function GlobalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [menu, setMenu] = useState([]);
  const [bills, setBills] = useState([]);
  const [foods, setFoods] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [timesheets, setTimesheets] = useState([]);

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
    categories,
    setCategories,
    activeCategory,
    setActiveCategory,
    menu,
    setMenu,
    bills,
    setBills,
    foods,
    setFoods,
    vouchers,
    setVouchers,
    timesheets,
    setTimesheets,
  }), [user, categories, activeCategory, menu, bills, foods, vouchers, timesheets]);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}
