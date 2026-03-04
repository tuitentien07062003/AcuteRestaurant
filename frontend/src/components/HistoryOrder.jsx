import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import  OrderDetailDialog from "./BillDetailDialog.jsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

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

const HistoryOrder = () => {
  const [bill, setBill] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedBillId, setSelectedBillId] = useState(null)  
  const pageSize = 10
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBillOrders = async () => {
      try {
        const res = await axios.get(
          "https://acuterestaurant.onrender.com/acute/bill-orders",
          { withCredentials: true }
        )

        setBill(res.data);
      } catch (error) {
        navigate("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchBillOrders()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center items-center h-40 text-[#0077b6] font-semibold">
        Đang tải dữ liệu...
      </div>
    )

  const totalPages = Math.ceil(bill.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const currentBills = bill.slice(startIndex, startIndex + pageSize)

  const totalRevenue = bill.reduce((sum, order) => {
    const discount = Number(order.discount_amount || 0);
    let refundAmount = 0;
    if (order.status === "Refund") {
      refundAmount += Number(order.total_amount);
    }
    const netSales = Number(order.total_amount) - discount - refundAmount;
    return sum + netSales
  }, 0)

  return (
    <>
    <div className="p-6 space-y-6">
      <div className="">
        <h2 className="text-2xl font-bold text-[#0077b6]">
          Lịch sử đơn hàng hôm nay
        </h2>
      </div>

    <div className="flex justify-between items-center gap-6 text-sm bg-white border rounded-md px-4 py-2">
        <div>
            <span className="text-gray-500">Doanh thu:</span>{" "}
            <span className="font-semibold text-green-600">
            {totalRevenue.toLocaleString("vi-VN")} đ
            </span>
        </div>

        <div>
            <span className="text-gray-500">Số đơn:</span>{" "}
            <span className="font-semibold">{bill.length}</span>
        </div>

        <div>
            <span className="text-gray-500">TB / đơn:</span>{" "}
            <span className="font-semibold">
            {bill.length
                ? Math.round(totalRevenue / bill.length).toLocaleString("vi-VN")
                : 0} đ
            </span>
        </div>

        <div>
            <span className="font-semibold">
                {new Date().toLocaleDateString("vi-VN")}
            </span>
        </div>
    </div>

      <Card>
        <CardContent className="p-0">
          {bill.length === 0 ? (
            <p className="text-center py-6 text-gray-500">
              Chưa có đơn hàng nào hôm nay
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBills.map(order => (
                  <TableRow 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                        setSelectedBillId(order.id)
                        setOpenDetail(true)
                    }}
                    >
                    <TableCell className="font-medium">
                      {order.order_id}
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentMethod[order.payment_method]}>
                        {order.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {(() => {
                        const discount = Number(order.discount_amount || 0)
                        const netSales = Number(order.total_amount) - discount
                        return netSales.toLocaleString("vi-VN")
                      })()} đ
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage(p => Math.max(p - 1, 1))
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(p => Math.min(p + 1, totalPages))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>

    <OrderDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        billId={selectedBillId}
    />
    </>
  )
}

export default HistoryOrder
