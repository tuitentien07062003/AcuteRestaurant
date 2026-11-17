import { useContext, useState } from "react";
import KitchenColumn from "./KitchenColumn";
import { useBillOrders } from "@/hooks/useBillOrders";
import { toast } from "sonner";
import { updateOrderStatus } from "@/api/billOrders";
import { Loader2 } from "lucide-react";

export default function KitchenScreen() {
  const { data: orders = [], isLoading, refetch } = useBillOrders(5000);
  const [draggedOrderId, setDraggedOrderId] = useState(null);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#F97316] animate-spin mb-3" />
        <p className="text-slate-500 font-medium">Đang tải đơn hàng...</p>
      </div>
    );
  }

  // Hàm xử lý logic kéo thả (Chỉ cho phép kéo 1 chiều)
  const handleDrop = async (targetStatus) => {
    if (!draggedOrderId) return;

    const order = orders.find((o) => o.id === draggedOrderId);
    if (!order) return;

    // Kiểm tra logic 1 chiều: Pending -> Cooking -> Ready
    let isValidDrop = false;

    if (order.status === "Pending" && targetStatus === "Cooking")
      isValidDrop = true;
    if (order.status === "Cooking" && targetStatus === "Ready")
      isValidDrop = true;

    if (isValidDrop) {
      try {
        await updateOrderStatus(order.id, targetStatus);
        toast.success(
          `Đã chuyển đơn #${order.order_id} sang ${targetStatus === "Cooking" ? "Đang nấu" : "Hoàn thành"}`,
        );
        refetch();
      } catch (error) {
        toast.error("Lỗi khi cập nhật trạng thái đơn hàng");
      }
    } else {
      toast.error("Không thể kéo ngược hoặc nhảy cóc trạng thái!");
    }

    setDraggedOrderId(null);
  };

  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const cookingOrders = orders.filter((o) => o.status === "Cooking");
  const readyOrders = orders.filter((o) => o.status === "Ready");

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
      <KitchenColumn
        title="Chờ xử lý"
        count={pendingOrders.length}
        statusColor="bg-yellow-500"
        bgColor="bg-yellow-50/50"
        borderColor="border-yellow-200"
        orders={pendingOrders}
        onReload={refetch}
        onDragStart={(id) => setDraggedOrderId(id)}
        onDrop={() => handleDrop("Cooking")} // Kéo sang Đang nấu
        allowDrop={true}
      />
      <KitchenColumn
        title="Đang nấu"
        count={cookingOrders.length}
        statusColor="bg-[#F97316]"
        bgColor="bg-orange-50/50"
        borderColor="border-orange-200"
        orders={cookingOrders}
        onReload={refetch}
        onDragStart={(id) => setDraggedOrderId(id)}
        onDrop={() => handleDrop("Ready")} // Kéo sang Hoàn thành
        allowDrop={true}
      />
      <KitchenColumn
        title="Hoàn thành"
        count={readyOrders.length}
        statusColor="bg-green-500"
        bgColor="bg-green-50/50"
        borderColor="border-green-200"
        orders={readyOrders}
        onReload={refetch}
        onDragStart={(id) => setDraggedOrderId(id)}
        onDrop={() => {}} // Không cho phép kéo vào đây từ bên ngoài
        allowDrop={false}
      />
    </div>
  );
}
