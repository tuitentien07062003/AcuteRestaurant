import { useState, useMemo, useContext } from "react";
import {
  Clock,
  Users,
  DollarSign,
  Search,
  FileSpreadsheet,
  Send,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlySalarySummary } from "@/hooks/useMonthlySalarySummary";
import { formatHours, formatCurrency } from "@/lib/formatters";
import { GlobalContext } from "@/context/GlobalContext";
import payrollApi from "@/api/payrollApi";

export const MonthlySalarySummary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState(null);

  const { user } = useContext(GlobalContext);
  const storeId = user?.store_id || 7062003;

  const {
    data: monthlyData,
    isLoading,
    error,
    refetch,
  } = useMonthlySalarySummary(selectedMonth, selectedYear, storeId);

  const stats = useMemo(() => {
    if (!monthlyData)
      return {
        totalHours: 0,
        totalSalary: 0,
        employeeCount: 0,
        partTimeSalary: 0,
        fullTimeSalary: 0,
      };
    return {
      totalHours: parseFloat(monthlyData.totalHours) || 0,
      totalSalary: parseFloat(monthlyData.totalSalary) || 0,
      employeeCount: monthlyData.employeeCount || 0,
      partTimeSalary: parseFloat(monthlyData.partTimeSalary) || 0,
      fullTimeSalary: parseFloat(monthlyData.fullTimeSalary) || 0,
      status: monthlyData.status || "CALCULATED",
    };
  }, [monthlyData]);

  const handleExportExcel = () => {
    if (!monthlyData?.employeeDetails) return;
    const headers = [
      "STT",
      "Nhân viên",
      "Loại hình",
      "Tổng giờ làm",
      "Lương/Giờ hoặc CB",
      "Thành tiền",
    ];
    const rows = monthlyData.employeeDetails.map((emp, index) => [
      index + 1,
      emp.employeeName || "Không rõ",
      emp.type === "full-time" ? "Full-time" : "Part-time",
      emp.totalHours,
      emp.hourlyRate,
      emp.salary,
    ]);
    const csvContent =
      "\uFEFF" + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Bang_Luong_Thang_${selectedMonth}_${selectedYear}.csv`;
    link.click();
  };

  const handleSendToHQ = async () => {
    setSending(true);
    setSendMessage(null);
    try {
      await payrollApi.sendToHQ(selectedMonth, selectedYear, storeId);
      setSendMessage({
        type: "success",
        text: "Bảng lương đã được gửi lên HQ thành công!",
      });
      refetch();
    } catch (err) {
      setSendMessage({
        type: "error",
        text: err?.response?.data?.message || "Lỗi gửi bảng lương lên HQ",
      });
    } finally {
      setSending(false);
    }
  };

  const filteredEmployees =
    monthlyData?.employeeDetails?.filter((emp) =>
      (emp.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const statusBadge = () => {
    const status = stats.status;
    if (status === "APPROVED")
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" /> Đã quyết toán
        </Badge>
      );
    if (status === "SENT")
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Send className="w-3 h-3 mr-1" /> Đã gửi HQ
        </Badge>
      );
    return (
      <Badge className="bg-slate-100 text-slate-600 border-slate-200">
        Chưa gửi HQ
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {statusBadge()}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSendToHQ}
            disabled={
              sending || stats.status === "SENT" || stats.status === "APPROVED"
            }
            className="bg-[#F97316] hover:bg-[#EA580C] rounded-xl shadow-sm font-semibold gap-2"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}{" "}
            Gửi HQ
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="rounded-xl border-slate-200 shadow-sm font-semibold gap-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#F97316]" /> Xuất Excel
          </Button>
        </div>
      </div>

      {sendMessage && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${sendMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {sendMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Tổng giờ làm
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {isLoading ? "..." : formatHours(stats.totalHours)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Clock className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Tổng lương
              </p>
              <h3 className="text-2xl font-bold text-green-600">
                {isLoading ? "..." : formatCurrency(stats.totalSalary)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Lương Part-time
              </p>
              <h3 className="text-2xl font-bold text-[#F97316]">
                {isLoading ? "..." : formatCurrency(stats.partTimeSalary)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <DollarSign className="text-[#F97316]" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Lương Full-time
              </p>
              <h3 className="text-2xl font-bold text-purple-600">
                {isLoading ? "..." : formatCurrency(stats.fullTimeSalary)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3 border-b border-slate-100">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
          />
        </CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12 text-center font-semibold text-slate-700">
                  STT
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Nhân viên
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Loại
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Giờ làm
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Lương/Giờ hoặc CB
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Thành tiền
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full bg-slate-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="text-center text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-slate-800">
                      {emp.employeeName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          emp.type === "full-time"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }
                      >
                        {emp.type === "full-time" ? "Full-time" : "Part-time"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {emp.totalHours}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatCurrency(emp.hourlyRate)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#F97316]">
                      {formatCurrency(emp.salary)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-slate-500"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
