import { useState } from "react";
import { DailySalarySummary } from "./DailySalarySummary";
import { EmployeeDayTimesheetTable } from "./EmployeeDayTimesheetTable";
import { MonthlySalarySummary } from "./MonthlySalarySummary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText, Clock, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import payrollApi from "@/api/payrollApi";
import SalaryDashboard from "./SalaryDashboard";

export function SalaryCalculationPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [storeId] = useState(1);

  const handleExportDaily = async () => {
    try {
      const response = await payrollApi.getDailySalarySummary(
        selectedDate,
        storeId,
      );
      if (!response) return;
      const {
        employees = [],
        totalHours,
        totalPartTimeSalary,
        netSales,
        actualLaborPercent,
      } = response;
      const headers = [
        "STT",
        "Mã NV",
        "Tên nhân viên",
        "Loại",
        "Vào ca",
        "Ra ca",
        "Tổng giờ",
        "Lương/giờ",
        "Tiền hôm nay",
      ];
      const rows = employees.map((emp, index) => [
        index + 1,
        emp.employee_code || "-",
        emp.full_name,
        emp.type === "part-time" ? "Part-time" : "Full-time",
        emp.first_check_in
          ? new Date(emp.first_check_in).toLocaleTimeString("vi-VN")
          : "-",
        emp.last_check_out
          ? new Date(emp.last_check_out).toLocaleTimeString("vi-VN")
          : "-",
        emp.total_hours || 0,
        emp.hourly_rate || 0,
        emp.estimated_salary || 0,
      ]);
      rows.push([]);
      rows.push([
        "",
        "",
        "TỔNG CỘNG",
        "",
        "",
        "",
        totalHours,
        "",
        totalPartTimeSalary,
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
        .join("\n");
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `TinhLuong_${selectedDate}.csv`;
      link.click();
    } catch (error) {
      alert("Lỗi xuất file: " + error.message);
    }
  };

  const handleExportMonthly = async () => {
    try {
      const response = await payrollApi.getMonthlySalarySummary(
        selectedMonth,
        selectedYear,
        storeId,
      );
      if (!response) return;
      const { employeeDetails = [], totalSalary } = response;
      const headers = [
        "STT",
        "Tên nhân viên",
        "Loại",
        "Tổng giờ",
        "Lương/giờ hoặc CB",
        "Lương",
      ];
      const rows = employeeDetails.map((emp, index) => [
        index + 1,
        emp.employeeName,
        emp.type === "full-time" ? "Full-time" : "Part-time",
        emp.totalHours,
        emp.hourlyRate,
        emp.salary,
      ]);
      rows.push([]);
      rows.push(["", "", "TỔNG CỘNG", "", "", totalSalary]);
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
        .join("\n");
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `TinhLuong_Thang${selectedMonth}_${selectedYear}.csv`;
      link.click();
    } catch (error) {
      alert("Lỗi xuất file: " + error.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý Bảng lương
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi giờ làm và quyết toán chi phí nhân sự
          </p>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 w-full max-w-md grid grid-cols-3 rounded-xl">
          <TabsTrigger
            value="daily"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#F97316] data-[state=active]:shadow-sm"
          >
            <Clock size={16} /> Theo Ngày
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#F97316] data-[state=active]:shadow-sm"
          >
            <BarChart3 size={16} /> Theo Tháng
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#F97316] data-[state=active]:shadow-sm"
          >
            <FileText size={16} /> Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: QUYẾT TOÁN NGÀY */}
        <TabsContent value="daily" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <Calendar className="text-[#F97316]" size={20} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>
              <Button
                onClick={handleExportDaily}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl gap-2 shadow-sm font-semibold"
              >
                <Download size={16} /> Xuất báo cáo ngày
              </Button>
            </CardContent>
          </Card>
          <DailySalarySummary date={selectedDate} storeId={storeId} />
          <EmployeeDayTimesheetTable date={selectedDate} storeId={storeId} />
        </TabsContent>

        {/* TAB 2: TỔNG HỢP THÁNG */}
        <TabsContent value="monthly" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-[#F97316] outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-[#F97316] outline-none"
                >
                  {[2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleExportMonthly}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl gap-2 shadow-sm font-semibold"
              >
                <Download size={16} /> Xuất bảng lương tháng
              </Button>
            </CardContent>
          </Card>
          <MonthlySalarySummary
            month={selectedMonth}
            year={selectedYear}
            storeId={storeId}
          />
        </TabsContent>

        {/* TAB 3: LỊCH SỬ */}
        <TabsContent value="history" className="outline-none">
          <SalaryDashboard />
        </TabsContent>
      </Tabs>

      <Card className="bg-orange-50 border-orange-100 rounded-2xl shadow-none">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="mt-0.5 text-[#F97316]">💡</div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Dữ liệu giờ làm được đồng bộ từ máy chấm công mỗi 30 phút. Các khoản
            thưởng và phạt sẽ được cập nhật cuối cùng trước khi chốt lương vào
            ngày 30 hàng tháng.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SalaryCalculationPage;
