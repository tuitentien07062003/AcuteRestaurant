import { useState } from "react"
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
import { PDFDownloadLink } from "@react-pdf/renderer"
import BillPDF from "./BillPDF"

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-800 w-20",
  Cooking: "bg-blue-100 text-blue-800 w-20",
  Ready: "bg-green-100 text-green-800 w-20",
  Completed: "bg-emerald-100 text-emerald-800 w-20",
  Refund: "bg-red-100 text-red-800 w-20",
}

const paymentMethod = {
  Cash: "bg-black text-white w-20",
  Momo: "bg-[#a50064] text-white w-20"
}

const OrderDetailDialog = ({ open, onOpenChange, billId }) => {
  const [loading, setLoading] = useState(false)
  const [bill, setBill] = useState(null)
  const [details, setDetails] = useState([])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-6">Đang tải...</div>
        ) : bill ? (
          <div className="space-y-4 text-sm">
            {/* Bill info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Mã đơn</span>
                <div className="font-semibold">{bill.order_id}</div>
              </div>
              <div>
                <span className="text-gray-500">Thanh toán</span>
                <div>
                  <Badge className={paymentMethod[bill.payment_method]}>
                    {bill.payment_method}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Ngày tạo</span>
                <div>
                  {new Date(bill.created_at).toLocaleString("vi-VN")}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Trạng thái</span>
                <div>
                  <Badge className={statusColor[bill.status]}>
                    {bill.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order details */}
            <div>
              <div className="space-y-2">
                {details.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <div className="text-xs font-semibold">{item.menu_item?.name}</div>
                      <div className="text-xs text-gray-500">
                        SL: {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      {Number(item.total_price).toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between font-semibold">
              <span>Tổng tiền</span>
              <span className="text-green-600">
                {Number(bill.total_amount).toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Không có dữ liệu đơn hàng
          </p>
        )}
      <PDFDownloadLink document={<BillPDF bill={bill} details={details} />}
        fileName="Bill_Order.pdf"
      >
        {({ loading }) => (
          <Button className="bg-[#0077b6] hover:bg-[#006699] cursor-pointer">
            {loading ? "Đang tạo PDF..." : "Xuất PDF"}
          </Button>
        )}
      </PDFDownloadLink>
      </DialogContent>
    </Dialog>
  )
}

export default OrderDetailDialog
