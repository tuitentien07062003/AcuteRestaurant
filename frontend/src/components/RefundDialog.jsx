import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { checkRefundOrder, submitRefund } from "@/api/refund";
import { RotateCcw, Search, AlertTriangle } from "lucide-react";

export default function RefundDialog({ open, setOpen, onDone }) {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckOrder = async () => {
    if (!orderId) return toast.error("Vui lòng nhập mã đơn");
    setLoading(true);
    try {
      const data = await checkRefundOrder(orderId);
      setOrder(data);
      toast.success("Đơn hợp lệ, có thể hoàn tiền");
    } catch (err) {
      setOrder(null);
      toast.error(err.response?.data?.message || "Không kiểm tra được đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!reason) return toast.error("Vui lòng nhập lý do hoàn tiền");
    setLoading(true);
    try {
      await submitRefund(order.id, reason);
      toast.success("Hoàn tiền thành công");
      setOpen(false);
      setOrder(null);
      setOrderId("");
      setReason("");
      onDone?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Hoàn tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader className="items-center text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <RotateCcw className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Hoàn tiền đơn hàng
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Nhập mã đơn để kiểm tra và thực hiện hoàn tiền
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã đơn (VD: ORD240101...)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="bg-slate-50 border-slate-200 h-12 focus:ring-[#F97316]"
            />
            <Button
              onClick={handleCheckOrder}
              disabled={loading}
              className="h-12 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm shrink-0"
            >
              <Search size={18} />
            </Button>
          </div>

          {order && (
            <div className="rounded-xl border border-red-200 p-4 space-y-3 bg-red-50/50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-2 border-b border-red-100">
                <span className="text-sm text-slate-500">Mã đơn</span>
                <span className="font-bold text-[#F97316]">
                  {order.order_id}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-red-100">
                <span className="text-sm text-slate-500">Tổng tiền</span>
                <span className="text-lg font-black text-red-600">
                  {Number(order.total_amount).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Thanh toán</span>
                <Badge
                  className={`px-2 py-0.5 rounded-md font-semibold ${order.payment_method === "Momo" ? "bg-[#a50064] text-white" : "bg-slate-800 text-white"}`}
                >
                  {order.payment_method}
                </Badge>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Lý do hoàn tiền <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Nhập chi tiết lý do..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-white border-slate-200 focus:ring-red-500 min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleRefund}
                disabled={loading || !reason}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl gap-2 shadow-sm mt-2"
              >
                <AlertTriangle size={18} />
                {loading ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
