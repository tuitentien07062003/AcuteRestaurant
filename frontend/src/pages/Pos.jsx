import { useState } from 'react'
import PosHeader from '@/components/PosHeader'
import LeftSidebar from '@/components/LeftSidebar'
import Order from '@/components/Order'
import MenuOrder from '@/components/MenuOrder'
import KitchenScreen from '@/components/KitchenScreen'
import HistoryOrder from '@/components/HistoryOrder'

const Pos = () => {
    const [orderItems, setOrderItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeComponent, setActiveComponent] = useState('menu'); 

    const handleToOrder = (item) => {
        setOrderItems(prev => {
            const existingItem = prev.find(i => i.id === item.id);
            return existingItem ? prev.map(i =>
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                ) : [...prev, { ...item, qty: 1 }];
        })
    }

    return (
    <div className="flex">
      <LeftSidebar onSelect={setActiveComponent} />
      
      {/* Phần nội dung bên phải */}
      <div className="flex-1 px-4">
        {activeComponent === 'menu' && (
          <>
            <PosHeader onCategoryChange={setActiveCategory}/>
            <MenuOrder
              category={activeCategory}
              onAdd={handleToOrder}/>
          </>
        )}
        {activeComponent === 'history' && (
          <HistoryOrder />
        )}
        {activeComponent === 'kitchen' && (
          <KitchenScreen />
        )}
      </div>
      <div>
        {activeComponent === 'menu' && <Order items={orderItems} setItems={setOrderItems} />}
      </div>
    </div>
)}

export default Pos