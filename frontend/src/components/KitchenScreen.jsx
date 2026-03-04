import { useEffect, useState } from "react";
import axios from "axios";
import KitchenColumn from "./KitchenColumn";

export default function KitchenScreen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await axios.get(
      "http://localhost:3000/acute/bill-orders",
      { withCredentials: true }
    );
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen grid grid-cols-3 gap-3 p-3">
      <KitchenColumn
        title="Pending"
        orders={orders.filter(o => o.status === "Pending")}
        onReload={fetchOrders}
      />
      <KitchenColumn
        title="Cooking"
        orders={orders.filter(o => o.status === "Cooking")}
        onReload={fetchOrders}
      />
      <KitchenColumn
        title="Ready"
        orders={orders.filter(o => o.status === "Ready")}
        onReload={fetchOrders}
      />
    </div>
  );
}
