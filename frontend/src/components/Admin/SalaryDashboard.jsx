
import { useState, useEffect } from "react"
import { 
  CreditCard, 
  Clock, 
  Users, 
  DollarSign,
  Calendar,
  Search,
  Download,
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
import payrollApi from "@/api/payrollApi"
import { fetchEmployees } from "@/api/employees"
import { fetchTimesheets } from "@/api/timesheet"

// Mock employee salary data
const mockEmployees = [
  { id: 1, full_name: "Nguyễn Văn A", position: "CREW", hourly_rate: 25000, is_active: true },
  { id: 2, full_name: "Trần Thị B", position: "CT", hourly_rate: 30000, is_active: true },
  { id: 3, full_name: "Lê Văn C", position: "CL", hourly_rate: 35000, is_active: true },
  { id: 4, full_name: "Phạm Thị D", position: "CREW", hourly_rate: 25000, is_active: true },
  { id: 5, full_name: "Hoàng Văn E", position: "CREW", hourly_rate: 25000, is_active: false },
]

const mockTimesheets = [
  { id: 1, employee_id: 1, date: "2024-01-15", check_in: "08:00", check_out: "17:00", hours: 8 },
  { id: 2, employee_id: 1, date: "2024-01-14", check_in: "08:00", check_out: "17:00", hours: 8 },
  { id: 3, employee_id: 2, date: "2024-01-15", check_in: "09:00", check_out: "18:00", hours: 8 },
  { id: 4, employee_id: 2, date: "2024-01-14", check_in: "09:00", check_out: "18:00", hours: 8 },
  { id: 5, employee_id: 3, date: "2024-01-15", check_in: "10:00", check_out: "19:00", hours: 8 },
  { id: 6, employee_id: 3, date: "2024-01-14", check_in: "10:00", check_out: "19:00", hours: 8 },
  { id: 7, employee_id: 4, date: "2024-01-15", check_in: "08:00", check_out: "16:00", hours: 7 },
]

const positionLabels = {
  CREW: { label: "Nhân viên", color: "bg-blue-100 text-blue-700" },
  CT: { label: "CTV", color: "bg-purple-100 text-purple-700" },
  CL: { label: "Cộng tác viên", color: "bg-green-100 text-green-700" },
  SM: { label: "Quản lý", color: "bg-orange-100 text-orange-700" },
  SUP: { label: "Giám sát", color: "bg-red-100 text-red-700" },
}

const SalaryDashboard = () => {
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [storeId] = useState(1) // Mock

  useEffect(() => {
    loadPayrolls()
    loadData()
  }, [selectedMonth, selectedYear])

  const loadPayrolls = async () => {
    setLoading(true)
    try {
      const params = { store_id: storeId, month: selectedMonth, year: selectedYear }
      const data = await payrollApi.getAll(params)
      setPayrolls(data || [])
    } catch (error) {
      console.error("Error loading payrolls:", error)
      setPayrolls([])
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [empData, timesheetData] = await Promise.all([
        fetchEmployees().catch(() => []),
        fetchTimesheets().catch(() => [])
      ])
      setEmployees(empData)
      setTimesheets(timesheetData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Get timesheets for selected date
  const getEmployeeTimesheet = (employeeId) => {
    return timesheets.filter(t => 
      t.employee_id === employeeId && 
      t.date === selectedDate
    )
  }

  // Calculate total hours for an employee
  const calculateTotalHours = (employeeId) => {
    const employeeTimesheets = getEmployeeTimesheet(employeeId)
    return employeeTimesheets.reduce((sum, t) => sum + (t.hours || 0), 0)
  }

  // Calculate salary for an employee
  const calculateSalary = (employee) => {
    const hours = calculateTotalHours(employee.id)
    return hours * employee.hourly_rate
  }

  // Filter active employees
  const activeEmployees = employees.filter(e => e.is_active)

  // Calculate total salary for the day
  const totalSalary = activeEmployees.reduce((sum, emp) => sum + calculateSalary(emp), 0)

  // Filter employees by search
  const filteredEmployees = activeEmployees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ"
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const handleExport = () => {
    const headers = ["STT", "Tên nhân viên", "Chức vụ", "Giờ vào", "Giờ ra", "Số giờ", "Lương/giờ", "Tổng lương"]
    const rows = filteredEmployees.map((emp, index) => {
      const timesheet = getEmployeeTimesheet(emp.id)[0]
      return [
        index + 1,
        emp.full_name,
        positionLabels[emp.position]?.label || emp.position,
        timesheet?.check_in || "-",
        timesheet?.check_out || "-",
        calculateTotalHours(emp.id),
        emp.hourly_rate,
        calculateSalary(emp)
      ]
    })
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `BangLuong_${selectedDate}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Tính lương</h2>
          <p className="text-gray-500">Tính lương nhân viên part-time</p>
        </div>
        
        <div className="flex gap-3 items-center">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none outline-none text-sm"
            />
          </div>

          <Button variant="outline" onClick={loadData}>
            <RefreshCw size={18} className="mr-2" />
            Làm mới
          </Button>

          <Button 
            onClick={handleExport}
            className="bg-[#0077b6] hover:bg-[#006699]"
          >
            <Download size={18} className="mr-2" />
            Xuất file
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ngày chấm công</p>
                <p className="text-2xl font-bold text-[#0077b6]">{formatDate(selectedDate)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="text-[#0077b6]" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nhân viên làm việc</p>
                <p className="text-2xl font-bold text-green-600">{activeEmployees.length}</p>
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
                <p className="text-sm text-gray-500">Tổng lương ngày</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalSalary)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <DollarSign className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Bảng lương nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>STT</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Giờ vào</TableHead>
                <TableHead>Giờ ra</TableHead>
                <TableHead>Số giờ</TableHead>
                <TableHead>Lương/giờ</TableHead>
                <TableHead>Tổng lương</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp, index) => {
                const timesheet = getEmployeeTimesheet(emp.id)[0]
                const hours = calculateTotalHours(emp.id)
                const salary = calculateSalary(emp)
                const position = positionLabels[emp.position] || { label: emp.position, color: "bg-gray-100" }
                
                return (
                  <TableRow key={emp.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{emp.full_name}</TableCell>
                    <TableCell>
                      <Badge className={position.color}>{position.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {timesheet ? (
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-green-600" />
                          {timesheet.check_in}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {timesheet ? (
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-red-600" />
                          {timesheet.check_out}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={hours > 0 ? "font-medium text-[#0077b6]" : "text-gray-400"}>
                        {hours} giờ
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(emp.hourly_rate)}</TableCell>
                    <TableCell className="font-bold text-green-600">{formatCurrency(salary)}</TableCell>
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

export default SalaryDashboard


