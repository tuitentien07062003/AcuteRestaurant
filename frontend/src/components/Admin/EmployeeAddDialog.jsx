import { useState } from 'react';
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Users } from "lucide-react"
import { useAdminData } from "@/hooks/useAdmin"

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
}

const EmployeeAddDialog = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const { addEmployee } = useAdminData()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: newType,
      role: newType === "full-time" ? "CREW_LEADER" : prev.role,
      base_salary: "",
      hourly_rate: "",
    }));
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        base_salary: formData.base_salary ? parseFloat(formData.base_salary) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        contract_end: formData.contract_end || null,
      }
      
      await addEmployee(payload)
      toast.success("Thêm nhân viên thành công")
      onClose()
      setFormData(initialFormState)
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể thêm nhân viên")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin nhân viên để thêm vào hệ thống
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Avatar Section - Static */}
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-3">
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Users className="text-gray-400" size={40} />
              </div>
            </div>
            <label className="text-sm font-medium mb-1">Hình mặc định</label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Họ tên *</label>
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Nguyễn Văn A"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Số điện thoại</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0123456789"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Tên đăng nhập</label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mật khẩu</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="******"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Loại</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="part-time">part-time</option>
                  <option value="full-time">full-time</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Chức vụ</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {formData.type === "full-time" ? (
                    <>
                      <option value="CREW_LEADER">CL</option>
                      <option value="SUP">SUP</option>
                    </>
                  ) : (
                    <>
                      <option value="CREW">CREW</option>
                      <option value="CREW_TRAINER">CT</option>
                      <option value="CREW_LEADER">CL</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            
            {formData.type === "full-time" ? (
              <div>
                <label className="text-sm font-medium mb-1 block">Lương cơ bản (VNĐ) *</label>
                <Input
                  name="base_salary"
                  type="number"
                  value={formData.base_salary}
                  onChange={handleInputChange}
                  placeholder="5000000"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1 block">Lương/giờ (VNĐ) *</label>
                <Input
                  name="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  placeholder="25000"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1 block">Ngày hết hạn hợp đồng</label>
              <Input
                name="contract_end"
                type="date"
                value={formData.contract_end}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !formData.full_name}>
            <Save size={18} className="mr-2" />
            {submitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeAddDialog

