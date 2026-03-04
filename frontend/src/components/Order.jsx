import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import ApplyVoucherDialog from "./DiscountDialogPos.jsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, Plus, Minus, ShoppingBag, Receipt, CreditCard, Tag } from "lucide-react";
import { toast } from "sonner";
import { createBillOrder } from "@/api/billOrders";

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
      toast.error("Chưa có món nào");
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

      await createBillOrder(orderData);
      toast.success("Đặt món thành công!");
      setItems([]);
      setVoucher(null);
    } catch (err) {
      console.error(err);
      toast.error("Đặt món thất bại!");
    }
  };

  return (
    <>
    <div className="w-[380px] h-full bg-white shadow-xl border-l flex flex-col">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0077b6] to-[#0096c7] text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <Receipt className="w-5 h-5" />
          <h2 className="text-lg font-bold tracking-wide">THÔNG TIN ĐẶT MÓN</h2>
        </div>
        <div className="text-center text-white/80 text-sm mt-1">
          {items.length} món • {items.reduce((acc, i) => acc + i.qty, 0)} sản phẩm
        </div>
      </div>

      {/* Order Items - Flexible height, scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="flex items-center justify-between border border-gray-200 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-3 flex-1 min-w-0">
                <img src={item.image_url} className="w-14 h-14 rounded-lg object-contain border bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm font-medium line-clamp-2 cursor-pointer hover:text-[#0077b6] transition-colors">
                        {item.name}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-500 text-xs">x{item.qty}</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => updateQty(item.id, "dec")}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, "inc")}
                        className="w-6 h-6 rounded-full bg-[#0077b6] text-white hover:bg-[#006699] flex items-center justify-center transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2 ml-2">
                <p className="font-bold text-[#0077b6] text-sm">
                  {(item.price * item.qty).toLocaleString("vi-VN")} ₫
                </p>
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <ShoppingBag size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Chưa có món nào</p>
            <p className="text-xs mt-1">Nhấn vào món để thêm</p>
          </div>
        )}
      </div>

      {/* Payment & Discount */}
      <div className="px-3 py-2 space-y-2 bg-white border-t">
        {/* Payment Method */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <CreditCard size={18} className="text-[#0077b6]" />
            <span className="text-sm font-medium">Thanh toán</span>
          </div>
          <Select 
            className="cursor-pointer"
            defaultValue={payment} 
            onValueChange={setPayment}
          >
            <SelectTrigger className="w-28 h-9 bg-white border-gray-200">
              <SelectValue placeholder="Cash" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">
                <div className="flex items-center gap-2">
                  <span>💵</span> Cash
                </div>
              </SelectItem>
              <SelectItem value="Momo">
                <div className="flex items-center gap-2">
                  <span>📱</span> Momo
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voucher */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <Tag size={18} className="text-[#0077b6]" />
            <span className="text-sm font-medium">Giảm giá</span>
          </div>

          <div className="flex items-center gap-2">
            {voucher && (
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                {voucher.discount_value
                  ? `-${voucher.discount_value.toLocaleString()}₫`
                  : `-${voucher.discount_percent}%`}
              </span>
            )}

            <Button
              className="cursor-pointer h-9 px-3 bg-[#0077b6] hover:bg-[#006699]"
              size="sm"
              variant="outline"
              onClick={() => setOpenVoucherDialog(true)}
            >
              {voucher ? "Đổi" : "Mã giảm"}
            </Button>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-[#0077b6] to-[#0096c7] mx-3 mb-2 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
        <div>
          <span className="text-white/80 text-sm">Tổng tiền</span>
          <p className="text-xs text-white/60">VNĐ</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{total.toLocaleString("vi-VN")}</span>
          <span className="text-lg"> ₫</span>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="px-3 pb-3">
        <Button 
          className="w-full cursor-pointer text-lg h-14 bg-gradient-to-r from-[#0077b6] to-[#0096c7] hover:from-[#006699] hover:to-[#0077b6] shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold"
          onClick={handleSubmitOrder}
        >
          <div className="flex items-center gap-2">
            <Receipt size={20} />
            <span>XÁC NHẬN ĐƠN</span>
          </div>
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

