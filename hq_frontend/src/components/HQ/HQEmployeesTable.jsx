import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Search, Phone, Calendar, Loader2, AlertCircle } from "lucide-react";

const roleLabels = {
  SM: { label: "SM", color: "bg-orange-100 text-orange-700 border-orange-200" },
  SUP: { label: "SUP", color: "bg-red-100 text-red-700 border-red-200" },
  CREW: { label: "CREW", color: "bg-blue-100 text-blue-700 border-blue-200" },
  CREW_TRAINER: { label: "CT", color: "bg-purple-100 text-purple-700 border-purple-200" },
  CREW_LEADER: { label: "CL", color: "bg-green-100 text-green-700 border-green-200" },
  HQ: { label: "HQ", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const typeLabels = {
  "full-time": { label: "full-time", color: "bg-green-100 text-green-700 border-green-200" },
  "part-time": { label: "part-time", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + " đ";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function HQEmployeesTable({ employees, loading, error }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const kw = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        (emp.full_name || "").toLowerCase().includes(kw) ||
        (emp.phone || "").includes(kw) ||
        (emp.employee_id || "").toLowerCase().includes(kw) ||
        (emp.internal_id || "").toString().includes(kw)
    );
  }, [employees, searchTerm]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-red-600 flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, SĐT, mã NV..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className="py-3 px-4 text-left font-medium">STT</th>
                  <th className="py-3 px-4 text-left font-medium">Mã NV</th>
                  <th className="py-3 px-4 text-left font-medium">Họ tên</th>
                  <th className="py-3 px-4 text-left font-medium">Chức vụ</th>
                  <th className="py-3 px-4 text-left font-medium">Loại</th>
                  <th className="py-3 px-4 text-left font-medium">Số điện thoại</th>
                  <th className="py-3 px-4 text-right font-medium">Lương/giờ</th>
                  <th className="py-3 px-4 text-left font-medium">Ngày vào làm</th>
                  <th className="py-3 px-4 text-left font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-500">
                      Không có nhân viên nào
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => {
                    const role = roleLabels[emp.role] || { label: emp.role, color: "bg-gray-100 text-gray-700 border-gray-200" };
                    const type = typeLabels[emp.type] || { label: emp.type, color: "bg-gray-100 text-gray-700 border-gray-200" };

                    return (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{emp.employee_id || "—"}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900">{emp.full_name}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${role.color} border`} variant="outline">
                            {role.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${type.color} border`} variant="outline">
                            {type.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Phone size={14} className="text-gray-400" />
                            {emp.phone || "—"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(emp.hourly_rate)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(emp.created_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              emp.active
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }
                            variant="outline"
                          >
                            {emp.active ? "Đang làm" : "Đã nghỉ"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

