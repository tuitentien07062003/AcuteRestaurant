import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PosHeader from '@/components/PosHeader'
import LeftSidebar from '@/components/LeftSidebar'
import Order from '@/components/Order'
import MenuOrder from '@/components/MenuOrder'
import KitchenScreen from '@/components/KitchenScreen'
import HistoryOrder from '@/components/HistoryOrder'
import useInit from '@/hooks/useInit'
import { initPos } from '@/init/posInit'
import { GlobalContext } from '@/context/GlobalContext'

const Pos = () => {
  const ctx = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[Pos] user:", ctx.user);
    if (ctx.user === null) {
      // Wait a bit for auth check
      const timer = setTimeout(() => {
        console.log("[Pos] after timeout, user:", ctx.user);
        if (!ctx.user) {
          console.log("[Pos] redirecting to login");
          navigate('/login');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ctx.user, navigate]);

  useInit(() => initPos(ctx), []);

  const [orderItems, setOrderItems] = useState([]);
  const { activeCategory } = ctx;
  const [activeComponent, setActiveComponent] = useState('menu');

  if (!ctx.user) {
    return <div>Loading...</div>; // Or a spinner
  }

  const handleToOrder = (item) => {
    setOrderItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      return existingItem 
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
    })
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar - Fixed width */}
      <LeftSidebar onSelect={setActiveComponent} />
      
      {/* Main Content Area - Flexible */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header & Menu or Other Components */}
        <div className="flex-1 flex flex-col min-h-0 px-4 pb-2">
          {activeComponent === 'menu' && (
            <>
              <PosHeader onCategoryChange={ctx.setActiveCategory} />
              <div className="flex-1 min-h-0 overflow-y-auto py-3">
                <MenuOrder
                  category={activeCategory}
                  onAdd={handleToOrder}
                />
              </div>
            </>
          )}
          {activeComponent === 'history' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <HistoryOrder />
            </div>
          )}
          {activeComponent === 'kitchen' && (
            <div className="flex-1 min-h-0">
              <KitchenScreen />
            </div>
          )}
        </div>
      </div>
      
      {/* Order Panel - Fixed width, full height */}
      <div className="h-full">
        {activeComponent === 'menu' && (
          <Order items={orderItems} setItems={setOrderItems} />
        )}
      </div>
    </div>
  )
}
export default Pos
