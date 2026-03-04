import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner";

export default function RefundDialog({ open, setOpen, onDone }) {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckOrder = async () => {
    if (!orderId) {
      toast.error("Vui lòng nhập mã đơn");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `https://acuterestaurant.onrender.com/acute/refund/${orderId}`,
        { withCredentials: true }
      );

      setOrder(res.data);
      toast.success("Đơn hợp lệ");

    } catch (err) {
      setOrder(null);
      toast.error(
        err.response?.data?.message || "Không kiểm tra được đơn"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!reason) {
      toast.error("Vui lòng nhập lý do hoàn tiền");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `https://acuterestaurant.onrender.com/acute/refund/${order.id}`,
        { reason },
        { withCredentials: true }
      );

      toast.success("Hoàn tiền thành công");
      setOpen(false);
      setOrder(null);
      setOrderId("");
      setReason("");
      onDone?.();

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Hoàn tiền thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hoàn tiền đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            placeholder="Nhập mã đơn"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />

          <Button
            variant="outline"
            onClick={handleCheckOrder}
            disabled={loading}
            className="w-full bg-[#0077b6] cursor-pointer hover:bg-[#006699] duration-500"
          >
            Kiểm tra đơn
          </Button>
        </div>

        {order && (
          <div className="rounded-xl border shadow-sm p-4 space-y-3 bg-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm">Mã đơn</span>
              <span className="font-semibold text-[#0077b6]">
                {order.order_id}
              </span>
            </div>

            <div className="border-t"></div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Tổng tiền</span>
              <span className="text-lg font-bold text-red-500">
                {Number(order.total_amount).toLocaleString("vi-VN")} ₫
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Thanh toán</span>
              <Badge className={`px-2 py-1 rounded-full font-semibold w-20
                ${order.payment_method === "Momo"
                  ? "bg-[#a50064] text-white"
                  : "bg-black text-white"}
                `}>
                    {order.payment_method}
              </Badge>
            </div>

            <Textarea
              placeholder="Nhập lý do hoàn tiền"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <Button
              variant="destructive"
              className="w-full cursor-pointer"
              onClick={handleRefund}
              disabled={loading}
            >
              Xác nhận hoàn tiền
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
