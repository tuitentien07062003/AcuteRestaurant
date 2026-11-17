import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBillDetail, completeOrder } from "@/api/billOrders";
import { Check, Clock, CreditCard, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function KitchenCard({ order, status, onReload, onDragStart }) {
  const queryClient = useQueryClient();

  // Lấy chi tiết món ăn
  const { data: billDetail, isLoading } = useQuery({
    queryKey: ["billDetail", order.id],
    queryFn: () => fetchBillDetail(order.id),
    staleTime: 60000, // Cache trong 1 phút để tránh gọi API liên tục
  });

  const items = billDetail?.details || billDetail?.data?.details || [];

  // Xử lý khi bấm nút Xác nhận (Dấu tích) ở cột Hoàn thành
  const { mutate: handleComplete, isPending } = useMutation({
    mutationFn: () => completeOrder(order.id),
    onSuccess: () => {
      toast.success("Đã xác nhận giao món thành công!");
      queryClient.invalidateQueries({ queryKey: ["billOrders"] });
      if (onReload) onReload();
    },
    onError: () => toast.error("Lỗi khi hoàn tất đơn"),
  });

  // Format giờ tạo
  const timeString = new Date(order.created_at).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      draggable={status !== "Ready"} // Không cho phép kéo ở cột Hoàn thành
      onDragStart={status !== "Ready" ? onDragStart : undefined}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative overflow-hidden group ${status === "Ready" ? "cursor-default" : ""}`}
    >
      {/* Thanh màu bên trái thể hiện trạng thái */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${status === "Pending" ? "bg-yellow-400" : status === "Cooking" ? "bg-[#F97316]" : "bg-green-500"}`}
      ></div>

      {/* Header Thẻ */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-lg mb-1">
            <Hash size={16} className="text-slate-400" />
            {order.order_id}
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock size={12} />
            {timeString}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
            <CreditCard size={12} />
            {order.payment_method}
          </div>
        </div>
      </div>

      {/* Danh sách món */}
      <div className="space-y-2 mb-3">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center animate-pulse">
            Đang tải món...
          </p>
        ) : (
          items.map((i) => (
            <div
              key={i.id}
              className="flex justify-between items-center text-sm border-b border-slate-100 pb-1 last:border-0 last:pb-0"
            >
              <span className="font-medium text-slate-700 line-clamp-1">
                {i.menu_item?.name || "Món ăn"}
              </span>
              <span className="font-bold text-[#F97316] bg-orange-50 px-2 rounded-md">
                x{i.quantity}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Nút xác nhận ở cột Hoàn thành */}
      {status === "Ready" && (
        <Button
          onClick={() => handleComplete()}
          disabled={isPending}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-10 rounded-lg gap-2 transition-colors mt-2"
        >
          <Check size={18} />
          {isPending ? "Đang xử lý..." : "Hoàn tất & Giao món"}
        </Button>
      )}
    </div>
  );
}
