import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useAdminData } from "@/hooks/useAdmin";

const EmployeeEditDialog = ({ employee, isOpen, onClose }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { editEmployee } = useAdminData();

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || "",
        phone: employee.phone || "",
        role: employee.role || "CREW",
        type: employee.type || "part-time",
        base_salary: employee.base_salary || "",
        hourly_rate: employee.hourly_rate || "",
        contract_end: employee.contract_end
          ? employee.contract_end.split("T")[0]
          : "",
      });
    }
  }, [employee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        type: formData.type,
        base_salary: formData.base_salary
          ? parseFloat(formData.base_salary)
          : null,
        hourly_rate: formData.hourly_rate
          ? parseFloat(formData.hourly_rate)
          : null,
        contract_end: formData.contract_end || null,
      };
      await editEmployee(employee.id, payload);
      toast.success("Cập nhật nhân viên thành công");
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật nhân viên",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 rounded-2xl overflow-hidden border-slate-200 bg-white">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Cập nhật nhân viên
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Chỉnh sửa thông tin cá nhân và mức lương (Không thể đổi chức vụ).
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Số điện thoại
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Chức vụ (Khóa)
              </label>
              <div className="w-full border border-slate-200 bg-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 cursor-not-allowed">
                {formData.role}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Loại hợp đồng
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
              >
                <option value="part-time">Part-time</option>
                <option value="full-time">Full-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                {formData.type === "full-time"
                  ? "Lương cơ bản (VNĐ)"
                  : "Lương/giờ (VNĐ)"}
              </label>
              <Input
                name={
                  formData.type === "full-time" ? "base_salary" : "hourly_rate"
                }
                type="number"
                value={
                  formData.type === "full-time"
                    ? formData.base_salary
                    : formData.hourly_rate
                }
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Ngày hết hạn HĐ
              </label>
              <Input
                name="contract_end"
                type="date"
                value={formData.contract_end}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.full_name}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl shadow-sm px-6"
          >
            <Save size={18} className="mr-2" />{" "}
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeEditDialog;
