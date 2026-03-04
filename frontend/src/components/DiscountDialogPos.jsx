import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { checkVoucherCode } from "@/api/vouchers";

export default function ApplyVoucherDialog({ open, setOpen, onApply }) {
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckCode = async () => {
    setLoading(true);
    try {
      const data = await checkVoucherCode(code);
      setVoucher(data);
    } catch (err) {
      toast.error("Mã không hợp lệ");
      setVoucher(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApply(voucher);
    setOpen(false);
    setCode("");
    setVoucher(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Áp dụng mã giảm giá</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Nhập mã voucher"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

        <div className="flex justify-between items-center">
          <Button 
            className="bg-[#0077b6] hover:bg-[#006699] cursor-pointer"
            onClick={handleCheckCode} 
            disabled={loading || !code}
            >
            Kiểm tra
          </Button>

          {voucher && (
            <div className="text-sm text-green-700">
              {voucher.discount_value
                ? `Giảm ${voucher.discount_value.toLocaleString()} ₫`
                : `Giảm ${voucher.discount_percent}%`}
            </div>
          )}
        </div>

          <Button
            className="w-full bg-[#0077b6] hover:bg-[#006699] cursor-pointer"
            disabled={!voucher}
            onClick={handleApply}
          >
            Áp dụng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
