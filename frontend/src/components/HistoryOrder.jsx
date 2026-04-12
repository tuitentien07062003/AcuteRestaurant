import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import OrderDetailDialog from "./BillDetailDialog.jsx"
import { useBillOrders } from "@/hooks/useBillOrders"
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
import { Button } from "@/components/ui/button"
import { pdf } from "@react-pdf/renderer"
import RevenuePDF, { createRevenueDocument } from "./RevenuePDF"
import { Loader2, Receipt, DollarSign, ShoppingBag, TrendingUp, FileDown } from "lucide-react"

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

const HistoryOrder = () => {
  // Fetch bill orders with React Query (no auto-refetch for history)
  const { data: bills = [], isLoading } = useBillOrders(0);
  
  const [currentPage, setCurrentPage] = useState(1)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedBillId, setSelectedBillId] = useState(null)  
  const [downloading, setDownloading] = useState(false)
  const pageSize = 10
  const navigate = useNavigate()

  // --- TẤT CẢ HOOKS (USEMEMO) PHẢI ĐẶT TRƯỚC IF (LOADING) ---
  // Đảm bảo bill luôn là mảng để không bị lỗi khi dữ liệu chưa có
  const bill = bills || [];

  const totalRevenue = useMemo(() => bill.reduce((sum, order) => {
    const discount = Number(order.discount_amount || 0);
    let refundAmount = 0;
    if (order.status === "Refund") {
      refundAmount += Number(order.total_amount);
    }
    const netSales = Number(order.total_amount) - discount - refundAmount;
    return sum + netSales
  }, 0), [bill]);

  const stats = useMemo(() => [
    {
      label: "Doanh thu hôm nay",
      value: totalRevenue.toLocaleString("vi-VN") + " ₫",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Số đơn hàng",
      value: bill.length,
      icon: Receipt,
      color: "text-[#0077b6]",
      bg: "bg-blue-50"
    },
    {
      label: "Trung bình/đơn",
      value: bill.length ? Math.round(totalRevenue / bill.length).toLocaleString("vi-VN") + " ₫" : "0 ₫",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ], [totalRevenue, bill]);

  // Các hàm xử lý sự kiện
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0].replace(/-/g, '');
  }

  const getRevenueFileName = () => {
    return `DoanhThuNgay_${getTodayDate()}.pdf`;
  }

  const handleDownloadRevenuePDF = async () => {
    if (bill.length === 0) {
      alert("Chưa có đơn hàng nào để xuất PDF");
      return;
    }
    
    try {
      setDownloading(true);
      
      const doc = createRevenueDocument(bill, "Acute Restaurant", new Date());
      const blob = await pdf(doc).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getRevenueFileName();
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
  }

  // --- EARLY RETURN (IF LOADING) ĐƯỢC CHUYỂN XUỐNG DƯỚI CÙNG ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-[#0077b6] animate-spin mb-3" />
        <p className="text-[#0077b6] font-medium">Đang tải dữ liệu...</p>
      </div>
    )
  }

  // Tính toán phân trang sau khi đã load xong dữ liệu
  const totalPages = Math.ceil(bill.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const currentBills = bill.slice(startIndex, startIndex + pageSize)

  return (
    <>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0077b6]" />
            Lịch sử đơn hàng hôm nay
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {/* Export Revenue PDF Button */}
        {bill.length > 0 && (
          <Button 
            className="bg-gradient-to-r from-[#0077b6] to-[#0096c7] hover:from-[#006699] hover:to-[#0077b6] gap-2 shadow-lg"
            onClick={handleDownloadRevenuePDF}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Xuất Doanh Thu</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className={`${stat.bg} border border-gray-200 rounded-xl p-4 flex items-center gap-4`}
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <Card className="border-gray-200 shadow-md">
        <CardContent className="p-0">
          {bill.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ShoppingBag size={48} className="mb-3 opacity-30" />
              <p className="text-lg">Chưa có đơn hàng nào hôm nay</p>
              <p className="text-sm mt-1">Đơn hàng sẽ hiển thị ở đây</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Mã đơn</TableHead>
                  <TableHead className="font-semibold text-gray-700">Thanh toán</TableHead>
                  <TableHead className="font-semibold text-gray-700">Ngày</TableHead>
                  <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBills.map(order => (
                  <TableRow 
                    key={order.id} 
                    className="hover:bg-[#0077b6]/5 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedBillId(order.id)
                      setOpenDetail(true)
                    }}
                  >
                    <TableCell className="font-medium">
                      <span className="bg-[#0077b6]/10 text-[#0077b6] px-2 py-1 rounded-lg text-sm">
                        #{order.order_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${paymentMethod[order.payment_method]} border`}>
                        {order.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColor[order.status]} border font-medium`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#0077b6]">
                      {(() => {
                        const discount = Number(order.discount_amount || 0)
                        const netSales = Number(order.total_amount) - discount
                        return netSales.toLocaleString("vi-VN")
                      })()} ₫
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
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="cursor-pointer"
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="cursor-pointer"
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