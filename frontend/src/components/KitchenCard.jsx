import { useState } from "react";
import useInit from "@/hooks/useInit";
import { fetchBillDetail, updateOrderStatus, completeOrder } from "@/api/billOrders";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KitchenCard({ order, status, onReload }) {
  const [items, setItems] = useState([]);

  useInit(() => {
    async function load() {
      try {
        const res = await fetchBillDetail(order.id);
        setItems(res.details || res.data?.details || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [order.id]);

  const handleNext = async () => {
    try {
      if (status === "Pending") {
        await updateOrderStatus(order.id, "Cooking");
      }

      if (status === "Cooking") {
        await updateOrderStatus(order.id, "Ready");
      }

      if (status === "Ready") {
        await completeOrder(order.id);
      }
      onReload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-[#0077b6]">
          #{order.order_id}
        </span>
        <Button
            className="cursor-pointer bg-[#0077b6] hover:bg-green-500 duration-500"
            size="icon"
            variant="outline"
            onClick={handleNext}
        >
          <Check />
        </Button>
      </div>

      <ul className="text-sm space-y-1">
        {items.map(i => (
          <li key={i.id} className="flex justify-between">
            <span>{i.menu_item.name}</span>
            <span>x{i.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
