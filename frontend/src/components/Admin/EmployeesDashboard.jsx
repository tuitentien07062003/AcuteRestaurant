
import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Eye,
  MoreVertical,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { fetchEmployees } from "@/api/employees"

// Mock employee data
const mockEmployees = [
  { 
    id: 1, 
    full_name: "Nguyễn Văn A", 
    position: "CREW", 
    phone: "0123456789",
    email: "nguyenvana@email.com",
    hourly_rate: 25000,
    is_active: true,
    created_at: "2024-01-01"
  },
  { 
    id: 2, 
    full_name: "Trần Thị B", 
    position: "CT", 
    phone: "0123456788",
    email: "tranthib@email.com",
    hourly_rate: 30000,
    is_active: true,
    created_at: "2024-01-05"
  },
  { 
    id: 3, 
    full_name: "Lê Văn C", 
    position: "CL", 
    phone: "0123456787",
    email: "levanc@email.com",
    hourly_rate: 35000,
    is_active: true,
    created_at: "2024-01-10"
  },
  { 
    id: 4, 
    full_name: "Phạm Thị D", 
    position: "CREW", 
    phone: "0123456786",
    email: "phamthid@email.com",
    hourly_rate: 25000,
    is_active: true,
    created_at: "2024-01-15"
  },
  { 
    id: 5, 
    full_name: "Hoàng Văn E", 
    position: "SM", 
    phone: "0123456785",
    email: "hoangvane@email.com",
    hourly_rate: 50000,
    is_active: false,
    created_at: "2023-12-01"
  },
]

const positionLabels = {
  CREW: { label: "Nhân viên", color: "bg-blue-100 text-blue-700" },
  CT: { label: "CTV", color: "bg-purple-100 text-purple-700" },
  CL: { label: "Cộng tác viên", color: "bg-green-100 text-green-700" },
  SM: { label: "Quản lý", color: "bg-orange-100 text-orange-700" },
  SUP: { label: "Giám sát", color: "bg-red-100 text-red-700" },
}

const EmployeesDashboard = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const data = await fetchEmployees()
      setEmployees(data || mockEmployees)
    } catch (error) {
      console.error("Error loading employees:", error)
      setEmployees(mockEmployees)
    } finally {
      setLoading(false)
    }
  }

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.phone.includes(searchTerm) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && emp.is_active) ||
                         (filterStatus === "inactive" && !emp.is_active)
    return matchesSearch && matchesStatus
  })

  const activeCount = employees.filter(e => e.is_active).length
  const inactiveCount = employees.filter(e => !e.is_active).length

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ"
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Nhân viên</h2>
          <p className="text-gray-500">Quản lý thông tin nhân viên</p>
        </div>
        
        <Button className="bg-[#0077b6] hover:bg-[#006699]">
          <Plus size={18} className="mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng nhân viên</p>
                <p className="text-2xl font-bold text-[#0077b6]">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="text-[#0077b6]" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang làm việc</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã nghỉ việc</p>
                <p className="text-2xl font-bold text-gray-400">{inactiveCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                <Users className="text-gray-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang làm việc</option>
              <option value="inactive">Đã nghỉ việc</option>
            </select>

            <Button variant="outline" onClick={loadEmployees}>
              <RefreshCw size={18} className="mr-2" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>STT</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Lương/giờ</TableHead>
                <TableHead>Ngày vào làm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp, index) => {
                const position = positionLabels[emp.position] || { label: emp.position, color: "bg-gray-100" }
                return (
                  <TableRow key={emp.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{emp.full_name}</TableCell>
                    <TableCell>
                      <Badge className={position.color}>{position.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone size={14} className="text-gray-400" />
                        {emp.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail size={14} className="text-gray-400" />
                        <span className="truncate max-w-[150px]">{emp.email}</span>
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
                      <Badge className={emp.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                        {emp.is_active ? "Đang làm" : "Đã nghỉ"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye size={16} className="text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit size={16} className="text-orange-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeesDashboard


