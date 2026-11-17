import { useState, useEffect, useContext } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Download,
  Calendar,
  Loader2,
  AlertCircle,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchBillOrders } from "@/api/billOrders";
import { GlobalContext } from "@/context/GlobalContext";
import axiosClient from "@/api/axiosClient.js";

const mockBills = [
  {
    id: 1,
    order_id: "ORD001",
    total_amount: 150000,
    discount_amount: 15000,
    payment_method: "Cash",
    status: "Completed",
    created_at: "2024-01-15T10:30:00",
  },
  {
    id: 2,
    order_id: "ORD002",
    total_amount: 200000,
    discount_amount: 0,
    payment_method: "Momo",
    status: "Completed",
    created_at: "2024-01-15T11:00:00",
  },
];

const RevenueDashboard = () => {
  const [dateRange, setDateRange] = useState("today"); // ĐÃ KHÔI PHỤC STATE
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const [todayTarget, setTodayTarget] = useState(null);
  const storeId = "7062003";

  useEffect(() => {
    loadBills();
    loadTodayTarget();
  }, [dateRange]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await fetchBillOrders();
      setBills(data || mockBills);
    } catch (error) {
      console.error("Error loading bills:", error);
      setBills(mockBills);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayTarget = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await axiosClient.get(`/sales/daily`, {
        params: { store_id: storeId, date: today },
      });
      setTodayTarget(data);
    } catch (error) {
      console.error("Lỗi lấy chỉ tiêu HQ:", error);
    }
  };

  const totalRevenue = bills.reduce((sum, bill) => {
    if (bill.status === "Refund") return sum;
    return sum + Number(bill.total_amount || 0);
  }, 0);

  const totalDiscount = bills.reduce((sum, bill) => {
    return sum + Number(bill.discount_amount || 0);
  }, 0);

  const totalRefund = bills.reduce((sum, bill) => {
    if (bill.status === "Refund") return sum + Number(bill.total_amount || 0);
    return sum;
  }, 0);

  // LƯU Ý: Đã bỏ VAT 10% theo logic đúng của POS
  const netRevenue = totalRevenue - totalDiscount;

  const stats = [
    {
      title: "Doanh thu",
      value: totalRevenue,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Giảm giá",
      value: totalDiscount,
      icon: Percent,
      color: "text-[#F97316]",
      bgColor: "bg-orange-50",
    },
    {
      title: "Hoàn đơn",
      value: totalRefund,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Thực thu",
      value: netRevenue,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // HÀM XUẤT FILE ĐÃ ĐƯỢC KHÔI PHỤC
  const handleExport = () => {
    const headers = [
      "Mã đơn",
      "Tổng tiền",
      "Giảm giá",
      "Thanh toán",
      "Trạng thái",
      "Ngày",
    ];
    const rows = bills.map((bill) => [
      bill.order_id,
      bill.total_amount,
      bill.discount_amount,
      bill.payment_method,
      bill.status,
      bill.created_at,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `DoanhThu_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Quản lý doanh thu
          </h2>
          <p className="text-slate-500 mt-1">
            Theo dõi và phân tích dòng tiền của cửa hàng
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={18} className="text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border-none outline-none text-sm font-medium bg-transparent text-slate-700 cursor-pointer"
            >
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>

          <Button
            onClick={handleExport}
            className="bg-[#F97316] hover:bg-[#EA580C] rounded-xl shadow-sm font-semibold"
          >
            <Download size={18} className="mr-2" /> Xuất file
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow border-slate-200 rounded-2xl"
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {formatCurrency(stat.value)}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center`}
                >
                  <Icon className={stat.color} size={24} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chỉ tiêu HQ */}
      <Card className="border-orange-200 bg-orange-50/30 rounded-2xl shadow-sm">
        <CardHeader className="border-b pb-3 border-orange-100 p-5">
          <CardTitle className="text-base flex items-center gap-2 text-[#F97316]">
            <Target className="w-5 h-5" /> Chỉ tiêu HQ quy định (Hôm nay)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex gap-12">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">
                Dự báo doanh thu (Forecast)
              </p>
              <p className="text-2xl font-bold text-[#F97316]">
                {todayTarget?.forecast
                  ? formatCurrency(todayTarget.forecast)
                  : "Chưa có dữ liệu"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">
                Quỹ giờ làm (Total Hours)
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {todayTarget?.total_hours
                  ? `${todayTarget.total_hours} giờ`
                  : "Chưa có dữ liệu"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 p-5">
          <CardTitle className="text-lg font-bold text-slate-800">
            Chi tiết doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="animate-spin text-[#F97316]" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">
                    Mã đơn
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Giảm giá
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Thanh toán
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Ngày
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow
                    key={bill.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-bold text-slate-700">
                      {bill.order_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(bill.total_amount)}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {bill.discount_amount > 0
                        ? `-${formatCurrency(bill.discount_amount)}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${bill.payment_method === "Momo" ? "bg-[#a50064] text-white" : "bg-slate-800 text-white"} border-none rounded-md font-medium`}
                      >
                        {bill.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border-none rounded-md font-medium ${
                          bill.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : bill.status === "Refund"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {bill.status === "Completed"
                          ? "Hoàn thành"
                          : bill.status === "Refund"
                            ? "Hoàn đơn"
                            : bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm text-right">
                      {formatDate(bill.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueDashboard;
