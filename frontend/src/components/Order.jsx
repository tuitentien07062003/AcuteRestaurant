import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import ApplyVoucherDialog from "./DiscountDialogPos.jsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, Plus, Minus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function Order({ items, setItems }) {
  const [payment, setPayment] = useState("Cash");   // Cash | Momo
  const [voucher, setVoucher] = useState(0);
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);

  // Tính tổng tiền
  const total = useMemo(() => {
    const sum = items.reduce((acc, i) => acc + i.price * i.qty, 0);
    
    if (!voucher) return sum;

    if (voucher.discount_value) {
      return Math.max(0, sum - voucher.discount_value);
    }

    if (voucher.discount_percent) {
      return sum - (sum * voucher.discount_percent) / 100;
    }
  }, [items, voucher]);

  const updateQty = (id, type) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, qty: type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error("Chưa có món nào");
      return;
    }

    try {
      const orderData = {
        store_id: 7062003,
        payment_method: payment,
        voucher_id: voucher ? voucher.id : null,
        items: items.map(i => ({
          menu_item_id: i.id,
          qty: i.qty,
        }))
      };

      const res = await axios.post(
        "https://acuterestaurant.onrender.com/acute/bill-orders",
        orderData,
        { withCredentials: true }
      );
      toast.success("Đặt món thành công!");
      setItems([]);
      setVoucher(null);
    } catch (err) {
      console.error(err);
      toast.error("Đặt món thất bại!");
    }
  };

  return (
    <>
    <div className="w-full h-screen max-w-md mx-auto bg-gray-100 shadow-lg rounded-lg flex flex-col">
      
      {/* Header */}
      <div className="bg-[#0077b6] text-white text-center py-4 text-lg font-bold">
        THÔNG TIN ĐẶT MÓN
      </div>

      {/* Order Items */}
      <div className="p-2 space-y-2 max-h-[500px] flex-1 overflow-y-auto">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="flex items-center justify-between border p-3 rounded-xl bg-white shadow-sm">
              <div className="flex gap-3">
                <img src={item.image_url} className="w-14 h-14 rounded-md object-contain border" />
                <div>
                    
                <Tooltip>
                    <TooltipTrigger asChild>
                    <p className="max-w-20 text-sm line-clamp-2 cursor-pointer">
                        {item.name}
                    </p>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs font-medium">
                    {item.name}
                    </TooltipContent>
                </Tooltip>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-600">x{item.qty}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQty(item.id, "dec")}> <Minus /> </Button>
                    <Button size="sm" variant="outline" onClick={() => updateQty(item.id, "inc")}> <Plus /> </Button>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <p className="font-semibold">{(item.price * item.qty).toLocaleString("vi-VN")} ₫</p>
                <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Chưa có món nào</p>
        )}
      </div>

      {/* Payment & Discount */}
      <div className="px-2 mt-2 ">
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border gap-2">
          <span>Phương thức</span>
          <Select 
            className="cursor-pointer"
            defaultValue={payment} 
            onValueChange={setPayment}
            >
            <SelectTrigger className="w-25">
              <SelectValue placeholder="Cash" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Momo">Momo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center bg-white p-3 rounded-xl border">
          <span>Giảm giá</span>

          <div className="flex items-center gap-2">
            {voucher && (
              <span className="text-sm text-green-700">
                {voucher.discount_value
                  ? `-${voucher.discount_value.toLocaleString()}₫`
                  : `-${voucher.discount_percent}%`}
              </span>
            )}

            <Button
              className="cursor-pointer w-25"
              size="sm"
              variant="outline"
              onClick={() => setOpenVoucherDialog(true)}
            >
              Áp dụng mã
            </Button>
          </div>
        </div>

      </div>

      {/* Total */}
      <div className="bg-white mx-2 mt-4 p-4 rounded-xl border flex justify-between text-base font-semibold">
        <span>Tổng tiền (VNĐ)</span>
        <span>{total.toLocaleString("vi-VN")}</span>
      </div>

      {/* Confirm Button */}
      <div className="px-2 mt-2">
        <Button 
          className="w-full cursor-pointer text-lg bg-[#0077b6] hover:bg-[#006699]"
          onClick={handleSubmitOrder}
          >
          XÁC NHẬN
        </Button>
      </div>
    </div>
    <ApplyVoucherDialog
      open={openVoucherDialog}
      setOpen={setOpenVoucherDialog}
      onApply={setVoucher}/>
      </>
  );
}
