import { useState } from "react";
import { useEmployeeDayTimesheets } from "@/hooks/useEmployeeDayTimesheets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours, formatCurrency, formatTime } from "@/lib/formatters";

export function EmployeeDayTimesheetTable({ date, storeId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useEmployeeDayTimesheets(date, storeId, currentPage, limit);

  if (isLoading)
    return (
      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full bg-slate-100" />
          ))}
        </CardContent>
      </Card>
    );
  if (error)
    return (
      <Card className="border-red-200 bg-red-50 rounded-2xl">
        <CardContent className="p-5 flex items-center gap-2 text-red-700">
          <AlertCircle size={18} /> Lỗi tải danh sách
        </CardContent>
      </Card>
    );
  if (!result) return null;

  const { timesheets = [], pagination } = result;

  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-white border-b border-slate-100 p-5 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-slate-800">
          Chi tiết giờ làm (Part-time)
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl border-slate-200 shadow-sm"
        >
          <RefreshCw size={14} className="mr-2 text-slate-500" /> Cập nhật
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-12 text-center font-semibold text-slate-700">
                STT
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Mã NV
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Tên nhân viên
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Vào ca
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Ra ca
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Tổng giờ
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Lương/giờ
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">
                Tiền hôm nay
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">
                Trạng thái
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timesheets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="9"
                  className="text-center py-10 text-slate-500"
                >
                  Không có nhân viên check-in hôm nay
                </TableCell>
              </TableRow>
            ) : (
              timesheets.map((timesheet, index) => (
                <TableRow
                  key={timesheet.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="text-center text-slate-500 font-medium">
                    {(pagination.page - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    {timesheet.employee_code}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {timesheet.full_name}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatTime(timesheet.check_in)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {timesheet.check_out
                      ? formatTime(timesheet.check_out)
                      : "-"}
                  </TableCell>
                  <TableCell className="font-bold text-[#F97316]">
                    {formatHours(timesheet.total_hours)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatCurrency(parseFloat(timesheet.hourly_rate))}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {timesheet.daily_salary
                      ? formatCurrency(parseFloat(timesheet.daily_salary))
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {timesheet.check_out ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Đã ra ca
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        Đang làm
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Trang {pagination.page} / {pagination.totalPages} (
            {pagination.total} nhân viên)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setCurrentPage(pagination.page - 1)}
              className="rounded-lg border-slate-200"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setCurrentPage(pagination.page + 1)}
              className="rounded-lg border-slate-200"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
