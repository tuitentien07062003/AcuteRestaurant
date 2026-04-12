import { useContext } from "react";
import KitchenColumn from "./KitchenColumn";
import { useBillOrders } from "@/hooks/useBillOrders";

export default function KitchenScreen() {
  // Fetch bill orders with auto-refetch every 5 seconds for real-time updates
  const { data: orders = [], isLoading, refetch } = useBillOrders(5000);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-3 gap-3 p-3">
      <KitchenColumn
        title="Chờ xử lý"
        titleColor="text-yellow-600"
        bgColor="bg-yellow-50"
        orders={orders.filter(o => o.status === "Pending")}
        onReload={refetch}
      />
      <KitchenColumn
        title="Đang nấu"
        titleColor="text-blue-600"
        bgColor="bg-blue-50"
        orders={orders.filter(o => o.status === "Cooking")}
        onReload={refetch}
      />
      <KitchenColumn
        title="Hoàn thành"
        titleColor="text-green-600"
        bgColor="bg-green-50"
        orders={orders.filter(o => o.status === "Ready")}
        onReload={refetch}
      />
    </div>
  );
}

