import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Eye,
  X,
  RefreshCw,
  Edit,
  Search,
  Phone,
  Calendar,
  Hash,
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdmin";

const roleLabels = {
  SM: { label: "SM", color: "bg-orange-100 text-[#F97316] border-orange-200" },
  SUP: { label: "SUP", color: "bg-red-100 text-red-700 border-red-200" },
  CREW: { label: "CREW", color: "bg-blue-100 text-blue-700 border-blue-200" },
  CREW_TRAINER: {
    label: "CT",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  CREW_LEADER: {
    label: "CL",
    color: "bg-green-100 text-green-700 border-green-200",
  },
};

const typeLabels = {
  "full-time": {
    label: "Full-time",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  "part-time": {
    label: "Part-time",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
};

const EmployeesTable = ({ onEditClick, onDetailClick, onToggleActive }) => {
  const { employees, loading, loadEmployees } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredEmployees = employees.filter((emp) => {
    if (emp.role === "HQ") return false;
    const matchesSearch =
      emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone?.includes(searchTerm) ||
      emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.internal_id?.toString().includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && emp.active) ||
      (filterStatus === "inactive" && !emp.active);
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("vi-VN") + " đ";
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                placeholder="Tìm theo tên, SĐT, mã NV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#F97316] w-full md:w-auto"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang làm việc</option>
                <option value="inactive">Đã nghỉ việc</option>
              </select>

              <Button
                variant="outline"
                onClick={loadEmployees}
                disabled={loading}
                className="rounded-xl border-slate-200 shadow-sm shrink-0"
              >
                <RefreshCw
                  size={18}
                  className={`mr-2 text-slate-500 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 text-center w-12">
                  STT
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Mã NV
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">
                  Mã nội bộ
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Họ tên
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Chức vụ
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Loại
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Số điện thoại
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Lương/Giờ
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">
                  Trạng thái
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center w-28">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <RefreshCw
                      className="animate-spin mx-auto text-[#F97316]"
                      size={24}
                    />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-10 text-slate-500"
                  >
                    Không có nhân viên nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const role = roleLabels[emp.role] || {
                    label: emp.role,
                    color: "bg-slate-100",
                  };
                  const type = typeLabels[emp.type] || {
                    label: emp.type,
                    color: "bg-slate-100",
                  };

                  return (
                    <TableRow
                      key={emp.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="text-center text-slate-500 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">
                        {emp.employee_id || `-`}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md text-sm border border-slate-200">
                          <Hash size={14} className="mr-1 text-slate-400" />{" "}
                          {emp.internal_id || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {emp.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${role.color} border rounded-md`}>
                          {role.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${type.color} border rounded-md`}>
                          {type.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={14} className="text-slate-400" />{" "}
                          {emp.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {formatCurrency(emp.hourly_rate)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            emp.active
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }
                        >
                          {emp.active ? "Đang làm" : "Đã nghỉ"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => onDetailClick(emp)}
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-[#F97316] hover:text-[#EA580C] hover:bg-orange-50"
                            onClick={() => onToggleActive(emp)}
                            title={emp.active ? "Vô hiệu hóa" : "Kích hoạt"}
                          >
                            {emp.active ? (
                              <X size={16} />
                            ) : (
                              <RefreshCw size={16} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                            onClick={() => onEditClick(emp)}
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesTable;
