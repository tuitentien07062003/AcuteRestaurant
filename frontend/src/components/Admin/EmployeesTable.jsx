import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, X, RefreshCw, Edit, Search, Phone, Calendar } from "lucide-react"
import { useAdminData } from "@/hooks/useAdmin"
import EmployeesStats from './EmployeesStats'

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

const EmployeesTable = ({ 
  onEditClick, 
  onDetailClick, 
  onToggleActive 
}) => {
  const { employees, loading, loadEmployees } = useAdminData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredEmployees = employees.filter(emp => {
    if (emp.role === 'HQ') return false;
    
    const matchesSearch = 
      (emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.phone?.includes(searchTerm)) ||
      (emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.internal_id?.toString().includes(searchTerm))
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && emp.active) ||
      (filterStatus === "inactive" && !emp.active)
    
    return matchesSearch && matchesStatus
  })

  const activeCount = employees.filter(e => e.active && e.role !== 'HQ').length
  const inactiveCount = employees.filter(e => !e.active && e.role !== 'HQ').length

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

  return (
    <div className="space-y-6">

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang làm việc</option>
              <option value="inactive">Đã nghỉ việc</option>
            </select>

            <Button variant="outline" onClick={loadEmployees} disabled={loading}>
              <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>STT</TableHead>
                <TableHead>Mã NV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Lương/giờ</TableHead>
                <TableHead>Ngày vào làm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <RefreshCw className="animate-spin mx-auto" size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    Không có nhân viên nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const role = roleLabels[emp.role] || { label: emp.role, color: "bg-gray-100" }
                  const type = typeLabels[emp.type] || { label: emp.type, color: "bg-gray-100" }
                  
                  return (
                    <TableRow key={emp.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{emp.employee_id || `-`}</TableCell>
                      <TableCell className="font-medium">{emp.full_name}</TableCell>
                      <TableCell>
                        <Badge className={role.color}>{role.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={type.color}>{type.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />
                          {emp.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(emp.hourly_rate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(emp.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={emp.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                          {emp.active ? "Đang làm" : "Đã nghỉ"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => onDetailClick(emp)}
                            title="Xem chi tiết"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => onToggleActive(emp)}
                            title={emp.active ? "Vô hiệu hóa" : "Kích hoạt"}
                          >
                            {emp.active ? (
                              <X size={16} className="text-red-600" />
                            ) : (
                              <RefreshCw size={16} className="text-green-600" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => onEditClick(emp)}
                          >
                            <Edit size={16} className="text-orange-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeesTable

