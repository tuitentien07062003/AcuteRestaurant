import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PosHeader from "@/components/PosHeader";
import LeftSidebar from "@/components/LeftSidebar";
import Order from "@/components/Order";
import MenuOrder from "@/components/MenuOrder";
import KitchenScreen from "@/components/KitchenScreen";
import HistoryOrder from "@/components/HistoryOrder";
import { useCategories } from "@/hooks/useCategories";
import { GlobalContext } from "@/context/GlobalContext";

const Pos = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeComponent, setActiveComponent] = useState("menu");
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].code);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (ctx.user === null) {
      const timer = setTimeout(() => {
        if (!ctx.user) {
          navigate("/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ctx.user, navigate]);

  if (!ctx.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleToOrder = (item) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      return existingItem
        ? prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...item, qty: 1 }];
    });
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Left Sidebar - Thu gọn */}
      <LeftSidebar onSelect={setActiveComponent} />

      {/* Main Content Area - Mở rộng tối đa */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex flex-col min-h-0 px-3 pb-2">
          {activeComponent === "menu" && (
            <>
              <PosHeader
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                isLoading={categoriesLoading}
              />
              <div className="flex-1 min-h-0 overflow-y-auto py-2">
                <MenuOrder category={activeCategory} onAdd={handleToOrder} />
              </div>
            </>
          )}
          {activeComponent === "history" && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <HistoryOrder />
            </div>
          )}
          {activeComponent === "kitchen" && (
            <div className="flex-1 min-h-0">
              <KitchenScreen />
            </div>
          )}
        </div>
      </div>

      {/* Order Panel - Thanh toán */}
      <div className="h-full">
        {activeComponent === "menu" && (
          <Order items={orderItems} setItems={setOrderItems} />
        )}
      </div>
    </div>
  );
};
export default Pos;
