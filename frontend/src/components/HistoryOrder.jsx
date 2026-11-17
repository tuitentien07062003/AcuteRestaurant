import { useState, useMemo } from "react";
import OrderDetailDialog from "./BillDetailDialog.jsx";
import { useBillOrders } from "@/hooks/useBillOrders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { createRevenueDocument } from "./RevenuePDF";
import {
  Loader2,
  Receipt,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  FileDown,
} from "lucide-react";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Cooking: "bg-orange-100 text-orange-800 border-orange-200",
  Ready: "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
  Refund: "bg-red-100 text-red-800 border-red-200",
};

const paymentMethod = {
  Cash: "bg-slate-800 text-white border-slate-800",
  Momo: "bg-[#a50064] text-white border-[#a50064]",
};

const HistoryOrder = () => {
  const { data: bills = [], isLoading } = useBillOrders(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const pageSize = 10;

  const bill = bills || [];

  const totalRevenue = useMemo(
    () =>
      bill.reduce((sum, order) => {
        const discount = Number(order.discount_amount || 0);
        let refundAmount =
          order.status === "Refund" ? Number(order.total_amount) : 0;
        return sum + (Number(order.total_amount) - discount - refundAmount);
      }, 0),
    [bill],
  );

  const stats = useMemo(
    () => [
      {
        label: "Doanh thu hôm nay",
        value: totalRevenue.toLocaleString("vi-VN") + " ₫",
        icon: DollarSign,
        color: "text-[#F97316]",
        bg: "bg-orange-50",
        border: "border-orange-100",
      },
      {
        label: "Số đơn hàng",
        value: bill.length,
        icon: Receipt,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
      },
      {
        label: "Trung bình/đơn",
        value: bill.length
          ? Math.round(totalRevenue / bill.length).toLocaleString("vi-VN") +
            " ₫"
          : "0 ₫",
        icon: TrendingUp,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-100",
      },
    ],
    [totalRevenue, bill],
  );

  const handleDownloadRevenuePDF = async () => {
    if (bill.length === 0) return alert("Chưa có đơn hàng nào");
    try {
      setDownloading(true);
      const doc = createRevenueDocument(bill, "Acute Restaurant", new Date());
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Format ngày bằng JS thuần cho tên file
      const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
      link.download = `DoanhThuNgay_${dateStr}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Có lỗi khi tạo PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin mb-3" />
        <p className="text-slate-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(bill.length / pageSize);
  const currentBills = bill.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Format ngày hiển thị
  const todayString = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-[#F97316]" /> Lịch sử đơn hàng
            </h2>
            <p className="text-slate-500 text-sm mt-1 capitalize">
              {todayString}
            </p>
          </div>
          <Button
            className="bg-[#F97316] hover:bg-[#EA580C] gap-2 shadow-sm rounded-xl font-semibold text-white"
            onClick={handleDownloadRevenuePDF}
            disabled={downloading || bill.length === 0}
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Xuất báo cáo PDF
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bg} border ${stat.border} rounded-xl p-4 flex items-center gap-4`}
              >
                <div
                  className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {bill.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <ShoppingBag size={48} className="mb-3 opacity-20" />
                <p>Chưa có đơn hàng nào hôm nay</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">
                      Mã đơn
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Thanh toán
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Thời gian
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      Tổng tiền
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBills.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-orange-50/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedBillId(order.id);
                        setOpenDetail(true);
                      }}
                    >
                      <TableCell className="font-bold text-slate-700">
                        #{order.order_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${paymentMethod[order.payment_method]} border-none rounded-md`}
                        >
                          {order.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(order.created_at).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColor[order.status]} border rounded-md font-medium`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#F97316] text-base">
                        {(() => {
                          const discount = Number(order.discount_amount || 0);
                          return (
                            Number(order.total_amount) - discount
                          ).toLocaleString("vi-VN");
                        })()}{" "}
                        ₫
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="cursor-pointer hover:bg-orange-50 hover:text-[#F97316]"
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`cursor-pointer ${currentPage === i + 1 ? "bg-[#F97316] text-white hover:bg-[#EA580C] hover:text-white" : "hover:bg-orange-50"}`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    className="cursor-pointer hover:bg-orange-50 hover:text-[#F97316]"
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
  );
};

export default HistoryOrder;
