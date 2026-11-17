import { useState } from "react";
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
import { Save, User, Briefcase, Key } from "lucide-react";
import { useAdminData } from "@/hooks/useAdmin";

const initialFormState = {
  full_name: "",
  phone: "",
  role: "CREW",
  type: "part-time",
  base_salary: "",
  hourly_rate: "",
  contract_end: "",
  username: "",
  password: "",
};

const EmployeeAddDialog = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const { addEmployee } = useAdminData();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      role: newType === "full-time" ? "CREW_LEADER" : prev.role,
      base_salary: "",
      hourly_rate: "",
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        base_salary: formData.base_salary
          ? parseFloat(formData.base_salary)
          : null,
        hourly_rate: formData.hourly_rate
          ? parseFloat(formData.hourly_rate)
          : null,
        contract_end: formData.contract_end || null,
      };
      await addEmployee(payload);
      toast.success("Thêm nhân viên thành công");
      onClose();
      setFormData(initialFormState);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể thêm nhân viên");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 rounded-2xl overflow-hidden border-slate-200 bg-white">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Thêm nhân viên mới
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Điền thông tin để tạo tài khoản nhân sự hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-8 max-h-[65vh] overflow-y-auto">
          {/* Section 1: Thông tin cơ bản */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <User size={18} className="text-[#F97316]" /> Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="VD: Nguyễn Văn A"
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
                  placeholder="VD: 0901234567"
                  className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Công việc */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Briefcase size={18} className="text-[#F97316]" /> Thông tin công
              việc
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Loại hợp đồng
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="part-time">Part-time (Theo giờ)</option>
                  <option value="full-time">Full-time (Cố định)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Chức vụ
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  {formData.type === "full-time" ? (
                    <>
                      <option value="CREW_LEADER">Cửa hàng phó (CL)</option>
                      <option value="SUP">Giám sát (SUP)</option>
                    </>
                  ) : (
                    <>
                      <option value="CREW">Nhân viên (CREW)</option>
                      <option value="CREW_TRAINER">Huấn luyện viên (CT)</option>
                      <option value="CREW_LEADER">Tổ trưởng (CL)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  {formData.type === "full-time"
                    ? "Lương cơ bản (VNĐ) *"
                    : "Lương/giờ (VNĐ) *"}
                </label>
                <Input
                  name={
                    formData.type === "full-time"
                      ? "base_salary"
                      : "hourly_rate"
                  }
                  type="number"
                  value={
                    formData.type === "full-time"
                      ? formData.base_salary
                      : formData.hourly_rate
                  }
                  onChange={handleInputChange}
                  placeholder={
                    formData.type === "full-time" ? "VD: 8000000" : "VD: 25000"
                  }
                  className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Ngày hết hạn hợp đồng
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

          {/* Section 3: Tài khoản */}
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
            <h3 className="text-sm font-bold text-[#F97316] flex items-center gap-2 mb-4">
              <Key size={18} /> Cấp tài khoản đăng nhập (Không bắt buộc)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Tên đăng nhập
                </label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="VD: nhanviena"
                  className="bg-white border-orange-200 rounded-xl focus:ring-[#F97316]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Mật khẩu
                </label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="******"
                  className="bg-white border-orange-200 rounded-xl focus:ring-[#F97316]"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.full_name}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl shadow-sm px-6"
          >
            <Save size={18} className="mr-2" />{" "}
            {submitting ? "Đang lưu..." : "Lưu nhân viên"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAddDialog;
