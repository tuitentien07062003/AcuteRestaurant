import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  DollarSign,
  Calendar,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import payrollApi from "@/api/payrollApi";
import { fetchEmployees } from "@/api/employees";
import { fetchTimesheets } from "@/api/timesheet";

const positionLabels = {
  CREW: {
    label: "Nhân viên",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  CT: {
    label: "CTV",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  CL: {
    label: "Cộng tác viên",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  SM: {
    label: "Quản lý",
    color: "bg-orange-100 text-[#F97316] border-orange-200",
  },
  SUP: { label: "Giám sát", color: "bg-red-100 text-red-700 border-red-200" },
};

const SalaryDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, timesheetData] = await Promise.all([
        fetchEmployees().catch(() => []),
        fetchTimesheets().catch(() => []),
      ]);
      setEmployees(empData);
      setTimesheets(timesheetData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeTimesheet = (employeeId) =>
    timesheets.filter(
      (t) => t.employee_id === employeeId && t.date === selectedDate,
    );

  const calculateTotalHours = (employeeId) => {
    const employeeTimesheets = getEmployeeTimesheet(employeeId);
    return employeeTimesheets.reduce((sum, t) => sum + (t.hours || 0), 0);
  };

  const calculateSalary = (employee) =>
    calculateTotalHours(employee.id) * employee.hourly_rate;
  const activeEmployees = employees.filter((e) => e.is_active);

  const filteredEmployees = activeEmployees.filter((emp) =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("vi-VN") + " đ";
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Lịch sử chấm công & tính lương
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Tra cứu bảng lương theo ngày
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={18} className="text-[#F97316]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none outline-none text-sm font-semibold text-slate-700 bg-transparent"
            />
          </div>
          <Button
            variant="outline"
            onClick={loadData}
            className="rounded-xl border-slate-200 shadow-sm"
          >
            <RefreshCw
              size={18}
              className={`text-slate-500 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
            />
          </div>
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
                  Chức vụ
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Giờ vào
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Giờ ra
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Số giờ
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Lương/giờ
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Tổng lương
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw
                      className="animate-spin mx-auto text-[#F97316]"
                      size={24}
                    />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-slate-500"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const timesheet = getEmployeeTimesheet(emp.id)[0];
                  const hours = calculateTotalHours(emp.id);
                  const salary = calculateSalary(emp);
                  const position = positionLabels[emp.position] || {
                    label: emp.position,
                    color: "bg-slate-100 text-slate-700 border-slate-200",
                  };

                  return (
                    <TableRow
                      key={emp.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="text-center text-slate-500 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {emp.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${position.color} border`}>
                          {position.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {timesheet ? (
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-green-500" />{" "}
                            {timesheet.check_in}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {timesheet ? (
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-red-500" />{" "}
                            {timesheet.check_out}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            hours > 0
                              ? "font-bold text-[#F97316]"
                              : "text-slate-400"
                          }
                        >
                          {hours} giờ
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatCurrency(emp.hourly_rate)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(salary)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default SalaryDashboard;
