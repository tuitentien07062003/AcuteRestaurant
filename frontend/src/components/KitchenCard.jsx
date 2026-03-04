import { useEffect, useState } from "react";
import axios from "axios";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KitchenCard({ order, status, onReload }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await axios.get(
        `http://localhost:3000/acute/bill-orders/${order.id}`,
        { withCredentials: true }
      );
      setItems(res.data.details);
    };
    fetchDetails();
  }, [order.id]);

  const handleNext = async () => {
    if (status === "Pending") {
      await axios.patch(
        `http://localhost:3000/acute/bill-orders/${order.id}/status`,
        { status: "Cooking" },
        { withCredentials: true }
      );
    }

    if (status === "Cooking") {
      await axios.patch(
        `http://localhost:3000/acute/bill-orders/${order.id}/status`,
        { status: "Ready" },
        { withCredentials: true }
      );
    }

    if (status === "Ready") {
      await axios.patch(
        `http://localhost:3000/acute/bill-orders/${order.id}/complete`,
        {},
        { withCredentials: true }
      );
    }

    onReload();
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
