import { useMonthlySalarySummary } from '@/hooks/useMonthlySalarySummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatHours, formatCurrency } from '@/lib/formatters';

/**
 * Component hiển thị tóm tắt lương toàn bộ nhân viên trong tháng
 */
export function MonthlySalarySummary({ month, year, storeId }) {
  const { data: summary, isLoading, error } = useMonthlySalarySummary(month, year, storeId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt lương tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
            Lỗi tải dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'OPEN': { label: 'Mở', className: 'bg-blue-100 text-blue-700' },
      'CALCULATED': { label: 'Đã tính', className: 'bg-yellow-100 text-yellow-700' },
      'SENT': { label: 'Đã gửi', className: 'bg-purple-100 text-purple-700' },
      'APPROVED': { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tóm tắt lương tháng {month}/{year}</CardTitle>
            <p className="text-sm text-gray-500 mt-2">Trạng thái: {getStatusBadge(summary.status)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">Tổng lương</p>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {formatCurrency(parseFloat(summary.totalSalary))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Full-time + Part-time</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Lương part-time</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              {formatCurrency(parseFloat(summary.partTimeSalary))}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.partTimeCount} nhân viên
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600">Nhân viên full-time</p>
            <p className="text-2xl font-bold text-purple-700 mt-2">
              {summary.fullTimeCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tổng {summary.fullTimeCount + summary.partTimeCount} nhân viên
            </p>
          </div>
        </div>

        {/* Employee Details Table */}
        <div>
          <h4 className="font-semibold mb-3">Chi tiết lương từng nhân viên</h4>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Tên nhân viên</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tổng giờ</TableHead>
                  <TableHead>Lương/giờ</TableHead>
                  <TableHead>Lương</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.employeeDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-6 text-gray-500">
                      Chưa tính lương nhân viên
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.employeeDetails.map((employee, index) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{employee.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={employee.type === 'full-time' ? 'bg-purple-50' : 'bg-blue-50'}>
                          {employee.type === 'full-time' ? 'Full-time' : 'Part-time'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatHours(employee.totalHours)}</TableCell>
                      <TableCell className="text-sm">{formatCurrency(parseFloat(employee.hourlyRate))}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(parseFloat(employee.salary))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
