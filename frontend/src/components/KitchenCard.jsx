import { useState } from "react";
import useInit from "@/hooks/useInit";
import { fetchBillDetail, updateOrderStatus, completeOrder } from "@/api/billOrders";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function KitchenCard({ order, status, onReload }) {
  const [items, setItems] = useState([]);

  useInit(() => {
    async function load() {
      try {
        const res = await fetchBillDetail(order.id);
        setItems(res.details || res.data?.details || []);
      } catch (e) {
        console.error("[KitchenCard] Error loading details:", e);
      }
    }
    load();
  }, [order.id]);

  const handleNext = async () => {
    console.log("[KitchenCard] Current status:", status, "Order ID:", order.id);
    try {
      if (status === "Pending") {
        console.log("[KitchenCard] Updating to Cooking...");
        await updateOrderStatus(order.id, "Cooking");
        toast.success("Đơn hàng đang được nấu");
      } else if (status === "Cooking") {
        console.log("[KitchenCard] Updating to Ready...");
        await updateOrderStatus(order.id, "Ready");
        toast.success("Món đã sẵn sàng");
      } else if (status === "Ready") {
        console.log("[KitchenCard] Completing order...");
        await completeOrder(order.id);
        toast.success("Đơn hàng đã hoàn tất");
      }
      onReload();
    } catch (e) {
      console.error("[KitchenCard] Error updating status:", e);
      toast.error(e.response?.data?.message || "Cập nhật trạng thái thất bại");
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
            <span>{i.menu_item?.name || 'Unknown'}</span>
            <span>x{i.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
