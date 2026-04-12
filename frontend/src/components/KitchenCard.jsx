import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBillDetail, updateOrderStatus, completeOrder } from "@/api/billOrders";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function KitchenCard({ order, status, onReload }) {
  const queryClient = useQueryClient();

  // Fetch bill details
  const { data: billDetail, isLoading } = useQuery({
    queryKey: ['billDetail', order.id],
    queryFn: () => fetchBillDetail(order.id),
    staleTime: 0, // Always refetch
  });

  const items = billDetail?.details || billDetail?.data?.details || [];

  // Mutation for updating order status
  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: async (newStatus) => {
      if (status === "Ready") {
        return await completeOrder(order.id);
      } else {
        return await updateOrderStatus(order.id, newStatus);
      }
    },
    onSuccess: () => {
      // Show success message
      if (status === "Pending") {
        toast.success("Đơn hàng đang được nấu");
      } else if (status === "Cooking") {
        toast.success("Món đã sẵn sàng");
      } else if (status === "Ready") {
        toast.success("Đơn hàng đã hoàn tất");
      }
      
      // Invalidate bill orders query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['billOrders'] });
      
      // Reload if callback provided
      if (onReload) {
        onReload();
      }
    },
    onError: (error) => {
      console.error("[KitchenCard] Error updating status:", error);
      toast.error(error?.response?.data?.message || "Cập nhật trạng thái thất bại");
    },
  });

  const handleNext = () => {
    console.log("[KitchenCard] Current status:", status, "Order ID:", order.id);
    
    if (status === "Pending") {
      console.log("[KitchenCard] Updating to Cooking...");
      changeStatus("Cooking");
    } else if (status === "Cooking") {
      console.log("[KitchenCard] Updating to Ready...");
      changeStatus("Ready");
    } else if (status === "Ready") {
      console.log("[KitchenCard] Completing order...");
      changeStatus("Completed");
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-[#0077b6]">
          #{order.order_id}
        </span>
        <Button
            className="cursor-pointer bg-[#0077b6] hover:bg-green-500 duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            size="icon"
            variant="outline"
            onClick={handleNext}
            disabled={isPending}
        >
          {isPending ? "..." : <Check />}
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
