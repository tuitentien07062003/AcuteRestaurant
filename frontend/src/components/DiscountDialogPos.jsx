import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { checkVoucherCode } from "@/api/vouchers";
import { Tag, Search, CheckCircle2 } from "lucide-react";

export default function ApplyVoucherDialog({ open, setOpen, onApply }) {
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckCode = async () => {
    if (!code) return toast.error("Vui lòng nhập mã");
    setLoading(true);
    try {
      const data = await checkVoucherCode(code);
      setVoucher(data);
      toast.success("Mã hợp lệ!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Mã không hợp lệ hoặc đã hết hạn",
      );
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
      <DialogContent className="max-w-sm p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader className="items-center text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
            <Tag className="w-6 h-6 text-[#F97316]" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Mã giảm giá
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Nhập mã voucher để áp dụng ưu đãi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã voucher..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="bg-slate-50 border-slate-200 h-12 uppercase focus:ring-[#F97316]"
              onKeyDown={(e) => e.key === "Enter" && handleCheckCode()}
            />
            <Button
              onClick={handleCheckCode}
              disabled={loading || !code}
              className="h-12 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm shrink-0"
            >
              <Search size={18} />
            </Button>
          </div>

          {voucher && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">
                  Áp dụng thành công!
                </p>
                <p className="text-green-600 font-bold text-lg">
                  {voucher.discount_value
                    ? `Giảm ${voucher.discount_value.toLocaleString()} ₫`
                    : `Giảm ${voucher.discount_percent}%`}
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full h-12 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl text-base shadow-sm transition-all"
            disabled={!voucher || loading}
            onClick={handleApply}
          >
            Áp dụng ngay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
