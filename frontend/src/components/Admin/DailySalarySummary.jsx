import { useDailySalarySummary } from "@/hooks/useDailySalarySummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DailySalarySummary({ date, storeId }) {
  const {
    data: summary,
    isLoading,
    error,
  } = useDailySalarySummary(date, storeId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="border-slate-200 shadow-sm rounded-2xl h-28 animate-pulse bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (error)
    return (
      <Card className="border-red-200 bg-red-50 rounded-2xl">
        <CardContent className="p-4 flex items-center gap-2 text-red-700">
          <AlertCircle size={18} /> Lỗi tải dữ liệu: {error.message}
        </CardContent>
      </Card>
    );
  if (!summary) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  const isOverBudget =
    parseFloat(summary.actualLaborPercent) > summary.expectedLaborPercent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-md transition-shadow border-slate-200 rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Tổng giờ làm hôm nay
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {summary.totalHours}{" "}
              <span className="text-sm font-normal text-slate-500">giờ</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {summary.employeeCount} nhân viên
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Clock className="text-blue-600" size={24} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border-slate-200 rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              Tổng lương dự kiến
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(parseFloat(summary.totalPartTimeSalary))}
            </p>
            <p className="text-xs text-slate-500 mt-1">Part-time</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
            <DollarSign className="text-green-600" size={24} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border-slate-200 rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              % Doanh thu thực tế
            </p>
            <p className="text-2xl font-bold text-[#F97316]">
              {summary.actualLaborPercent}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              DT: {formatCurrency(parseFloat(summary.netSales))}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="text-[#F97316]" size={24} />
          </div>
        </CardContent>
      </Card>

      <Card
        className={`rounded-2xl border ${isOverBudget ? "border-orange-200 bg-orange-50/50" : "border-green-200 bg-green-50/50"}`}
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              So sánh quy định
            </p>
            <p
              className={`text-2xl font-bold ${isOverBudget ? "text-[#F97316]" : "text-green-600"}`}
            >
              {summary.percentageDifference > 0 ? "+" : ""}
              {summary.percentageDifference}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Quy định: {summary.expectedLaborPercent}%{" "}
              {isOverBudget ? "(Vượt)" : "(Ok)"}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOverBudget ? "bg-orange-100" : "bg-green-100"}`}
          >
            <TrendingUp
              className={isOverBudget ? "text-[#F97316]" : "text-green-600"}
              size={24}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
