import { useAdminData } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserCheck, UserMinus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const EmployeesStats = ({ onAddClick }) => {
  const { employees, loading } = useAdminData();

  const filteredEmployees = employees.filter((emp) => emp.role !== "HQ");
  const activeCount = filteredEmployees.filter((e) => e.active).length;
  const inactiveCount = filteredEmployees.filter((e) => !e.active).length;

  const stats = [
    {
      label: "Tổng nhân viên",
      value: filteredEmployees.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Đang làm việc",
      value: activeCount,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Đã nghỉ việc",
      value: inactiveCount,
      icon: UserMinus,
      color: "text-slate-400",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý nhân sự</h2>
          <p className="text-slate-500 mt-1">
            Danh sách và thông tin chi tiết của nhân viên
          </p>
        </div>
        <Button
          className="bg-[#F97316] hover:bg-[#EA580C] rounded-xl shadow-sm font-semibold"
          onClick={onAddClick}
        >
          <Plus size={18} className="mr-2" /> Thêm nhân viên
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow border-slate-200 rounded-2xl"
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {loading ? "—" : stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeesStats;
