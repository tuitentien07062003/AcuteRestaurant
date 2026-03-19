import { useState, useEffect } from 'react';
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"
import { useAdminData } from "@/hooks/useAdmin"

const EmployeeEditDialog = ({ employee, isOpen, onClose }) => {
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { editEmployee } = useAdminData()

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || "",
        phone: employee.phone || "",
        role: employee.role || "CREW",
        type: employee.type || "part-time",
        base_salary: employee.base_salary || "",
        hourly_rate: employee.hourly_rate || "",
        contract_end: employee.contract_end ? employee.contract_end.split('T')[0] : "",
      })
    }
  }, [employee])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        type: formData.type,
        base_salary: formData.base_salary ? parseFloat(formData.base_salary) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        contract_end: formData.contract_end || null,
      }
      
      await editEmployee(employee.id, payload)
      toast.success("Cập nhật nhân viên thành công")
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật nhân viên")
    } finally {
      setSubmitting(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật nhân viên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin nhân viên (không thể sửa chức vụ)
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Chức vụ</label>
              <div className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600">
                {employee.role || 'CREW'}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Loại</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="part-time">part-time</option>
                <option value="full-time">full-time</option>
              </select>
            </div>
          </div>
          
          {formData.type === "full-time" ? (
            <div>
              <label className="text-sm font-medium mb-1 block">Lương cơ bản (VNĐ)</label>
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
              <label className="text-sm font-medium mb-1 block">Lương/giờ (VNĐ)</label>
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

export default EmployeeEditDialog

