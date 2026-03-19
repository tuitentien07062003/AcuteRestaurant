import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Edit } from "lucide-react"

const roleLabels = {
  SM: { label: "SM", color: "bg-orange-100 text-orange-700" },
  SUP: { label: "SUP", color: "bg-red-100 text-red-700" },
  CREW: { label: "CREW", color: "bg-blue-100 text-blue-700" },
  CREW_TRAINER: { label: "CT", color: "bg-purple-100 text-purple-700" },
  CREW_LEADER: { label: "CL", color: "bg-green-100 text-green-700" },
  HQ: { label: "HQ", color: "bg-gray-100 text-gray-700" },
}

const typeLabels = {
  "full-time": { label: "full-time", color: "bg-green-100 text-green-700" },
  "part-time": { label: "part-time", color: "bg-yellow-100 text-yellow-700" },
}

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("vi-VN") + " đ"
}

const formatDate = (dateStr) => {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

const EmployeeDetailDialog = ({ employee, isOpen, onClose, onToggleActive, onEdit }) => {
  if (!employee) return null

  const role = roleLabels[employee.role] || { label: employee.role, color: "bg-gray-100" }
  const type = typeLabels[employee.type] || { label: employee.type, color: "bg-gray-100" }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết nhân viên</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 py-4">
          {/* Left side - Avatar */}
          <div className="flex flex-col items-center justify-center w-1/3">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 mb-3">
              <img 
                src={`https://randomuser.me/api/portraits/lego/${(employee.internal_id || 1) % 99}.jpg`}
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold text-center">{employee.full_name}</h3>
            <p className="text-sm text-gray-500">{employee.employee_id || '-'}</p>
          </div>
          
          {/* Right side - Info */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Internal ID</p>
              <p className="font-medium">#{employee.internal_id || '-'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Chức vụ</p>
              <Badge className={role.color}>
                {role.label}
              </Badge>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Loại</p>
              <Badge className={type.color}>
                {type.label}
              </Badge>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Trạng thái</p>
              <Badge className={employee.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                {employee.active ? "Đang làm" : "Đã nghỉ"}
              </Badge>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Số điện thoại</p>
              <p className="font-medium">{employee.phone || '-'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Lương/giờ</p>
              <p className="font-medium">{formatCurrency(employee.hourly_rate)}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Ngày vào làm</p>
              <p className="font-medium">{formatDate(employee.created_at)}</p>
            </div>
            
            {employee.contract_end && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Hết hạn hợp đồng</p>
                <p className="font-medium">{formatDate(employee.contract_end)}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="destructive"
            onClick={() => onToggleActive(employee)}
            className={employee.active ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}
          >
            <X size={18} className="mr-2" />
            {employee.active ? "Vô hiệu hóa" : "Kích hoạt"}
          </Button>
          <Button 
            onClick={() => onEdit(employee)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Edit size={18} className="mr-2" />
            Sửa thông tin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeDetailDialog

