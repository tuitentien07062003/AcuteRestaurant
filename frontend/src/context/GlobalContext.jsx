import { createContext, useState, useMemo } from "react";

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
