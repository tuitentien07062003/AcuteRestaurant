import { useDailySalarySummary } from '@/hooks/useDailySalarySummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Component hiển thị tóm tắt lương ngày
 * Hiển thị: tổng giờ, tiền ước tính, % doanh thu, so sánh với quy định
 */
export function DailySalarySummary({ date, storeId }) {
  const { data: summary, isLoading, error } = useDailySalarySummary(date, storeId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 flex items-center gap-2 text-red-700">
          <AlertCircle size={18} />
          <span>Lỗi tải dữ liệu: {error.message}</span>
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
    }).format(value);
  };

  const isOverBudget = parseFloat(summary.actualLaborPercent) > summary.expectedLaborPercent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tổng giờ làm */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng giờ làm hôm nay</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalHours}</div>
          <p className="text-xs text-gray-500 mt-1">{summary.employeeCount} nhân viên</p>
        </CardContent>
      </Card>

      {/* Tổng lương part-time */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng lương dự kiến</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(parseFloat(summary.totalPartTimeSalary))}</div>
          <p className="text-xs text-gray-500 mt-1">Part-time</p>
        </CardContent>
      </Card>

      {/* % Doanh thu thực tế */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">% Doanh thu thực tế</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{summary.actualLaborPercent}%</div>
          <p className="text-xs text-gray-500 mt-1">Doanh thu: {formatCurrency(parseFloat(summary.netSales))}</p>
        </CardContent>
      </Card>

      {/* So sánh với quy định */}
      <Card className={isOverBudget ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">So sánh quy định</CardTitle>
          <TrendingUp className="h-4 w-4" style={{ color: isOverBudget ? '#ea580c' : '#16a34a' }} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isOverBudget ? 'text-orange-600' : 'text-green-600'}`}>
            {summary.percentageDifference > 0 ? '+' : ''}{summary.percentageDifference}%
          </div>
          <p className="text-xs mt-1" style={{ color: isOverBudget ? '#ea580c' : '#16a34a' }}>
            Quy định: {summary.expectedLaborPercent}%
            {isOverBudget ? ' (Vượt)' : ' (Ok)'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
