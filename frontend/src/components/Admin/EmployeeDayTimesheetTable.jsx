import { useState } from 'react';
import { useEmployeeDayTimesheets } from '@/hooks/useEmployeeDayTimesheets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatHours, formatCurrency, formatTime } from '@/lib/formatters';

/**
 * Component danh sách check-in/out nhân viên part-time trong ngày
 * Có phân trang, cập nhật mỗi 30 phút
 */
export function EmployeeDayTimesheetTable({ date, storeId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data: result, isLoading, error, refetch } = useEmployeeDayTimesheets(
    date, 
    storeId, 
    currentPage, 
    limit
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giờ làm nhân viên (Part-time)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle size={18} />
            Lỗi tải danh sách
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const { timesheets = [], pagination } = result;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (timesheet) => {
    if (timesheet.check_out) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Đã ra ca
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-700">Đang làm việc</Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Danh sách giờ làm nhân viên (Part-time)</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refetch()}
        >
          Cập nhật
        </Button>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-12">STT</TableHead>
                <TableHead>Mã NV</TableHead>
                <TableHead>Tên nhân viên</TableHead>
                <TableHead>Vào ca</TableHead>
                <TableHead>Ra ca</TableHead>
                <TableHead>Tổng giờ</TableHead>
                <TableHead>Lương/giờ</TableHead>
                <TableHead>Tiền hôm nay</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="9" className="text-center py-6 text-gray-500">
                    Không có nhân viên check-in hôm nay
                  </TableCell>
                </TableRow>
              ) : (
                timesheets.map((timesheet, index) => (
                  <TableRow key={timesheet.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm font-medium">
                      {(pagination.page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="text-sm">{timesheet.employee_code}</TableCell>
                    <TableCell className="font-medium">{timesheet.full_name}</TableCell>
                    <TableCell className="text-sm">{formatTime(timesheet.check_in)}</TableCell>
                    <TableCell className="text-sm">
                      {timesheet.check_out ? formatTime(timesheet.check_out) : '-'}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatHours(timesheet.total_hours)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(parseFloat(timesheet.hourly_rate))}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-green-600">
                      {timesheet.daily_salary ? formatCurrency(parseFloat(timesheet.daily_salary)) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(timesheet)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages} 
              {' '}({pagination.total} nhân viên)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setCurrentPage(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setCurrentPage(pagination.page + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Auto-refresh info */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Cập nhật tự động mỗi 30 phút
        </p>
      </CardContent>
    </Card>
  );
}
