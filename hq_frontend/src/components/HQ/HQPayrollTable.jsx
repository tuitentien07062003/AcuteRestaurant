import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("vi-VN") + " đ";
};

export default function HQPayrollTable({ payroll, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!payroll || !payroll.details) {
    return (
      <div className="text-center py-8 text-gray-400">Chưa chọn bảng lương để xem chi tiết</div>
    );
  }

  const details = payroll.details;
  const partTimeDetails = details.filter((d) => !d.is_fulltime);
  const fullTimeDetails = details.filter((d) => d.is_fulltime);

  const totalPartTimeSalary = partTimeDetails.reduce(
    (sum, d) => sum + (parseFloat(d.salary) || 0),
    0
  );
  const totalFullTimeSalary = fullTimeDetails.reduce(
    (sum, d) => sum + (parseFloat(d.salary) || 0),
    0
  );
  const totalSalary = totalPartTimeSalary + totalFullTimeSalary;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Chi tiết bảng lương - {payroll.store?.name_store || `CN #${payroll.store_id}`}
        </h3>
        <Badge
          variant={payroll.status === "APPROVED" ? "success" : "default"}
          className={
            payroll.status === "APPROVED"
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-blue-100 text-blue-700 border-blue-200"
          }
        >
          {payroll.status === "APPROVED" ? "Đã quyết toán" : "Chờ quyết toán"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Tổng lương</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(totalSalary)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Lương Part-time</p>
          <p className="text-xl font-bold text-orange-600">{formatCurrency(totalPartTimeSalary)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Lương Full-time</p>
          <p className="text-xl font-bold text-purple-600">{formatCurrency(totalFullTimeSalary)}</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>STT</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giờ làm</TableHead>
              <TableHead>Lương/Giờ hoặc CB</TableHead>
              <TableHead>Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((d, index) => (
              <TableRow key={d.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{d.employee?.full_name || "-"}</TableCell>
                <TableCell>
                  <Badge variant={d.is_fulltime ? "secondary" : "default"}>
                    {d.is_fulltime ? "Full-time" : "Part-time"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {d.is_fulltime ? "-" : parseFloat(d.total_hours || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    d.is_fulltime
                      ? d.employee?.base_salary
                      : d.hourly_rate
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(d.salary)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}