import { useState, useCallback } from "react"
import useInit from "@/hooks/useInit"
import { fetchBillDetail } from "@/api/billOrders"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { pdf } from "@react-pdf/renderer"
import BillPDF, { createBillDocument } from "./BillPDF"
import { FileText, Download, Loader2 } from "lucide-react"

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Cooking: "bg-blue-100 text-blue-800 border-blue-200",
  Ready: "bg-green-100 text-green-800 border-green-200",
  Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Refund: "bg-red-100 text-red-800 border-red-200",
}

const paymentMethod = {
  Cash: "bg-gray-800 text-white border-gray-800",
  Momo: "bg-[#a50064] text-white border-[#a50064]"
}

const OrderDetailDialog = ({ open, onOpenChange, billId }) => {
  const [loading, setLoading] = useState(false)
  const [bill, setBill] = useState(null)
  const [details, setDetails] = useState([])
  const [downloading, setDownloading] = useState(false)

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
  }, [billId, open])

  // Generate dynamic filename based on order ID
  const getFileName = () => {
    if (bill?.order_id) {
      return `HoaDon_${bill.order_id}.pdf`;
    }
    return `Bill_Order.pdf`;
  };

  // Download PDF function
  const handleDownloadPDF = useCallback(async () => {
    if (!bill) return;
    
    try {
      setDownloading(true);
      
      // Create the document
      const doc = createBillDocument(bill, details, "Acute Restaurant");
      
      // Generate PDF blob
      const blob = await pdf(doc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Có lỗi khi tạo PDF. Vui lòng thử lại.");
    } finally {
      setDownloading(false);
    }
  }, [bill, details]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-[#0077b6] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Chi tiết đơn hàng
            </DialogTitle>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-10 h-10 text-[#0077b6] animate-spin mb-3" />
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : bill ? (
          <div className="space-y-4">
            {/* Bill info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-xs text-gray-500 block">Mã đơn</span>
                <div className="font-bold text-[#0077b6] text-lg">#{bill.order_id}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Thanh toán</span>
                <Badge className={`${paymentMethod[bill.payment_method]} border mt-1`}>
                  {bill.payment_method}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Ngày tạo</span>
                <div className="font-medium">
                  {new Date(bill.created_at).toLocaleString("vi-VN")}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Trạng thái</span>
                <Badge className={`${statusColor[bill.status]} border font-medium mt-1`}>
                  {bill.status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Order details */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Danh sách món</h4>
              <div className="space-y-3">
                {details.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{item.menu_item?.name}</div>
                      <div className="text-xs text-gray-500">
                        SL: {item.quantity} x {Number(item.total_price / item.quantity).toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#0077b6]">
                        {Number(item.total_price).toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Discount */}
            {bill.discount_amount > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-700 font-medium">Giảm giá</span>
                <span className="text-green-700 font-bold">
                  -{Number(bill.discount_amount).toLocaleString("vi-VN")} đ
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#0077b6] to-[#0096c7] rounded-xl text-white">
              <span className="font-semibold text-lg">Tổng tiền</span>
              <span className="font-bold text-2xl">
                {Number(bill.total_amount).toLocaleString("vi-VN")} đ
              </span>
            </div>

            {/* Export PDF Button */}
            <Button 
              className="w-full h-12 bg-gradient-to-r from-[#0077b6] to-[#0096c7] hover:from-[#006699] hover:to-[#0077b6] cursor-pointer font-semibold gap-2 shadow-lg"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tạo PDF...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Tải hóa đơn PDF</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <FileText size={48} className="mb-3 opacity-30" />
            <p>Không có dữ liệu đơn hàng</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default OrderDetailDialog

