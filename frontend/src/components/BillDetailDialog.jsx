import { useState, useCallback } from "react";
import useInit from "@/hooks/useInit";
import { fetchBillDetail } from "@/api/billOrders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { createBillDocument } from "./BillPDF";
import { FileText, Download, Loader2, CreditCard, Clock } from "lucide-react";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-800",
  Cooking: "bg-orange-100 text-orange-800",
  Ready: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Refund: "bg-red-100 text-red-800",
};

const OrderDetailDialog = ({ open, onOpenChange, billId }) => {
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);
  const [details, setDetails] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useInit(() => {
    if (!billId || !open) return;
    async function load() {
      try {
        setLoading(true);
        const res = await fetchBillDetail(billId);
        setBill(res.bill || res.data?.bill || null);
        setDetails(res.details || res.data?.details || []);
      } catch (err) {
        console.error("Lỗi tải chi tiết đơn:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [billId, open]);

  const handleDownloadPDF = useCallback(async () => {
    if (!bill) return;
    try {
      setDownloading(true);
      const doc = createBillDocument(bill, details, "Acute Restaurant");
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `HoaDon_${bill.order_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Có lỗi khi tạo PDF.");
    } finally {
      setDownloading(false);
    }
  }, [bill, details]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center justify-between w-full pr-6">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F97316]" /> Chi tiết hóa đơn
            </span>
            {bill && (
              <Badge
                className={`${statusColor[bill.status]} border-none rounded-md`}
              >
                {bill.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 text-[#F97316] animate-spin mb-3" />
            <p className="text-slate-500">Đang tải...</p>
          </div>
        ) : bill ? (
          <div className="space-y-4">
            {/* Info Box */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Mã đơn
                </span>
                <div className="font-bold text-[#F97316] text-lg">
                  #{bill.order_id}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Thanh toán
                </span>
                <div className="flex items-center gap-1 font-semibold text-slate-800 mt-1">
                  <CreditCard size={14} className="text-slate-400" />{" "}
                  {bill.payment_method}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-500 font-medium block">
                  Thời gian tạo
                </span>
                <div className="font-medium text-slate-700 flex items-center gap-1 mt-1">
                  <Clock size={14} className="text-slate-400" />
                  {new Date(bill.created_at).toLocaleString("vi-VN")}
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {details.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 text-sm">
                      {item.menu_item?.name || "Món ăn"}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      SL: {item.quantity} x{" "}
                      {Number(item.total_price / item.quantity).toLocaleString(
                        "vi-VN",
                      )}{" "}
                      đ
                    </div>
                  </div>
                  <div className="font-bold text-slate-700">
                    {Number(item.total_price).toLocaleString("vi-VN")} đ
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {bill.discount_amount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Giảm giá</span>
                  <span className="font-semibold text-green-600">
                    -{Number(bill.discount_amount).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                <span className="font-bold text-slate-700">Tổng cộng</span>
                <span className="font-black text-[#F97316] text-2xl">
                  {Number(bill.total_amount).toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            <Button
              className="w-full h-11 bg-[#F97316] hover:bg-[#EA580C] rounded-xl font-bold text-white gap-2 shadow-sm"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download size={18} />
              )}
              Tải hóa đơn PDF
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <FileText size={48} className="mb-3 opacity-20" />
            <p>Không có dữ liệu</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
