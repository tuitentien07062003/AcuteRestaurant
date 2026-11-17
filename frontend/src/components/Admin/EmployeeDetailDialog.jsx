import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Edit,
  Phone,
  Calendar,
  DollarSign,
  Briefcase,
  Fingerprint,
  Hash,
  CheckCircle,
} from "lucide-react";

const roleLabels = {
  SM: {
    label: "Store Manager",
    color: "bg-orange-100 text-[#F97316] border-orange-200",
  },
  SUP: { label: "Supervisor", color: "bg-red-100 text-red-700 border-red-200" },
  CREW: { label: "Crew", color: "bg-blue-100 text-blue-700 border-blue-200" },
  CREW_TRAINER: {
    label: "Trainer",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  CREW_LEADER: {
    label: "Leader",
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

const EmployeeDetailDialog = ({
  employee,
  isOpen,
  onClose,
  onToggleActive,
  onEdit,
}) => {
  if (!employee) return null;

  const role = roleLabels[employee.role] || {
    label: employee.role,
    color: "bg-slate-100 text-slate-700",
  };
  const type = typeLabels[employee.type] || {
    label: employee.type,
    color: "bg-slate-100 text-slate-700",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 rounded-2xl overflow-hidden border-slate-200 bg-white">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Thông tin nhân viên
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Top Profile Section */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-orange-100 flex items-center justify-center text-[#F97316] text-4xl font-bold border-4 border-white shadow-md">
              {employee.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                {employee.full_name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${role.color} border px-3 py-1 text-sm`}>
                  {role.label}
                </Badge>
                <Badge className={`${type.color} border px-3 py-1 text-sm`}>
                  {type.label}
                </Badge>
                <Badge
                  className={
                    employee.active
                      ? "bg-green-500 text-white"
                      : "bg-slate-400 text-white"
                  }
                >
                  {employee.active ? "Đang làm việc" : "Đã nghỉ việc"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Info Grid (Chia làm 3 cột) */}
          <div className="grid grid-cols-3 gap-4">
            {/* Ô Mã nội bộ (Mới thêm) */}
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Hash size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">
                  Mã chấm công
                </p>
                <p className="font-bold text-[#F97316] text-lg">
                  {employee.internal_id || "Chưa cấp"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Fingerprint size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">
                  Mã nhân viên
                </p>
                <p className="font-bold text-slate-800">
                  {employee.employee_id || "Chưa cấp"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Phone size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">
                  Số điện thoại
                </p>
                <p className="font-bold text-slate-800">
                  {employee.phone || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <DollarSign size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">
                  Mức lương
                </p>
                <p className="font-bold text-slate-800">
                  {formatCurrency(employee.base_salary || employee.hourly_rate)}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Calendar size={18} className="text-[#F97316]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">
                  Ngày vào làm
                </p>
                <p className="font-bold text-slate-800">
                  {formatDate(employee.created_at)}
                </p>
              </div>
            </div>

            {employee.contract_end && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Briefcase size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-0.5">
                    Hết hạn HĐ
                  </p>
                  <p className="font-bold text-red-500">
                    {formatDate(employee.contract_end)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex flex-row justify-between sm:justify-between items-center">
          <Button
            variant="outline"
            onClick={() => onToggleActive(employee)}
            className={`rounded-xl font-semibold shadow-sm ${employee.active ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}`}
          >
            {employee.active ? (
              <>
                <X size={16} className="mr-2" /> Vô hiệu hóa
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" /> Kích hoạt
              </>
            )}
          </Button>
          <Button
            onClick={() => onEdit(employee)}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-semibold shadow-sm"
          >
            <Edit size={16} className="mr-2" /> Sửa thông tin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailDialog;
