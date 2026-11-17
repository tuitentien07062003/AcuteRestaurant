import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ApplyVoucherDialog from "./DiscountDialogPos.jsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Receipt,
  CreditCard,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { createBillOrder } from "@/api/billOrders";

export default function Order({ items, setItems }) {
  const [payment, setPayment] = useState("Cash");
  const [voucher, setVoucher] = useState(0);
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: submitOrder, isPending } = useMutation({
    mutationFn: async (orderData) => {
      return await createBillOrder(orderData);
    },
    onSuccess: () => {
      toast.success("Đặt món thành công!");
      setItems([]);
      setVoucher(null);
      queryClient.invalidateQueries({ queryKey: ["billOrders"] });
    },
    onError: (err) => {
      console.error("[Order] Error:", err);
      toast.error("Đặt món thất bại!");
    },
  });

  const total = useMemo(() => {
    const sum = items.reduce((acc, i) => acc + i.price * i.qty, 0);
    if (!voucher) return sum;
    if (voucher.discount_value)
      return Math.max(0, sum - voucher.discount_value);
    if (voucher.discount_percent)
      return sum - (sum * voucher.discount_percent) / 100;
  }, [items, voucher]);

  const updateQty = (id, type) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1),
            }
          : item,
      ),
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmitOrder = () => {
    if (items.length === 0) {
      toast.error("Chưa có món nào");
      return;
    }
    const orderData = {
      store_id: 7062003,
      payment_method: payment,
      voucher_id: voucher ? voucher.id : null,
      items: items.map((i) => ({
        menu_item_id: i.id,
        qty: i.qty,
      })),
    };
    submitOrder(orderData);
  };

  return (
    <>
      <div className="w-[400px] h-full bg-white border-l border-slate-200 flex flex-col shadow-sm shrink-0">
        {/* Header */}
        <div className="bg-[#F97316] text-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              <h2 className="text-lg font-bold tracking-wide">GIỎ HÀNG</h2>
            </div>
            <div className="bg-white/20 px-2 py-1 rounded-md text-xs font-medium">
              {items.reduce((acc, i) => acc + i.qty, 0)} món
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-slate-200 p-2.5 rounded-xl bg-white shadow-sm hover:border-orange-200 transition-colors"
              >
                <div className="flex gap-3 flex-1 min-w-0">
                  <img
                    src={item.image_url}
                    className="w-14 h-14 rounded-lg object-cover border bg-slate-50"
                  />
                  <div className="flex-1 min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm font-semibold line-clamp-1 cursor-pointer hover:text-[#F97316] transition-colors">
                          {item.name}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs font-medium">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQty(item.id, "dec")}
                          className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center transition-colors"
                        >
                          <Minus size={14} className="text-slate-600" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-slate-800">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, "inc")}
                          className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center transition-colors text-[#F97316]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1 ml-2">
                  <p className="font-bold text-[#F97316] text-sm">
                    {(item.price * item.qty).toLocaleString("vi-VN")} ₫
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <ShoppingBag size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Giỏ hàng trống</p>
              <p className="text-xs mt-1">Chọn món để thêm vào</p>
            </div>
          )}
        </div>

        {/* Payment & Discount */}
        <div className="px-3 py-3 space-y-3 bg-white border-t border-slate-200">
          {/* Payment Method */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-700">
              <CreditCard size={18} className="text-slate-400" />
              <span className="text-sm font-medium">Thanh toán</span>
            </div>
            <Select defaultValue={payment} onValueChange={setPayment}>
              <SelectTrigger className="w-28 h-9 bg-slate-50 border-slate-200 font-medium">
                <SelectValue placeholder="Cash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Tiền mặt</SelectItem>
                <SelectItem value="Momo">Momo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Voucher */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-700">
              <Tag size={18} className="text-slate-400" />
              <span className="text-sm font-medium">Giảm giá</span>
            </div>
            <div className="flex items-center gap-2">
              {voucher && (
                <span className="text-sm font-bold text-green-600">
                  {voucher.discount_value
                    ? `-${voucher.discount_value.toLocaleString()}₫`
                    : `-${voucher.discount_percent}%`}
                </span>
              )}
              <Button
                className="cursor-pointer h-9 px-3 bg-orange-50 text-[#F97316] hover:bg-orange-100 border-none shadow-none font-semibold"
                size="sm"
                variant="outline"
                onClick={() => setOpenVoucherDialog(true)}
              >
                {voucher ? "Đổi mã" : "Nhập mã"}
              </Button>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-slate-50 mx-3 mb-3 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-slate-500 text-sm font-medium">
              Tổng thanh toán
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#F97316]">
              {total.toLocaleString("vi-VN")}
            </span>
            <span className="text-sm font-bold text-[#F97316] ml-1">₫</span>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="px-3 pb-4">
          <Button
            className="w-full cursor-pointer text-lg h-14 bg-[#F97316] hover:bg-[#EA580C] shadow-md transition-all active:scale-[0.98] font-bold text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmitOrder}
            disabled={isPending}
          >
            {isPending ? (
              <span className="animate-pulse">ĐANG XỬ LÝ...</span>
            ) : (
              <div className="flex items-center gap-2">
                <Receipt size={22} />
                <span>XÁC NHẬN ĐƠN</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      <ApplyVoucherDialog
        open={openVoucherDialog}
        setOpen={setOpenVoucherDialog}
        onApply={setVoucher}
      />
    </>
  );
}
