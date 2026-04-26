import { useState, useMemo, useContext } from "react"
import { 
  Clock, 
  Users, 
  DollarSign,
  Search,
  FileSpreadsheet
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useMonthlySalarySummary } from '@/hooks/useMonthlySalarySummary'
import { formatHours, formatCurrency } from '@/lib/formatters'
import { GlobalContext } from "@/context/GlobalContext"

export const MonthlySalarySummary = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { user } = useContext(GlobalContext)
  const storeId = user?.store_id || 7062003

  const { 
    data: monthlyData, 
    isLoading, 
    error 
  } = useMonthlySalarySummary(selectedMonth, selectedYear, storeId)

  const stats = useMemo(() => {
    if (!monthlyData) return { totalHours: 0, totalSalary: 0, employeeCount: 0 }
    
    return {
      totalHours: parseFloat(monthlyData.totalHours) || 0,
      totalSalary: parseFloat(monthlyData.totalSalary) || 0,
      employeeCount: monthlyData.employeeCount || 0,
    }
  }, [monthlyData])

  const handleExportExcel = () => {
    if (!monthlyData?.employeeDetails) return

    const headers = ["STT", "Nhân viên", "Loại hình", "Tổng giờ làm", "Lương/Giờ", "Thành tiền"]
    const rows = monthlyData.employeeDetails.map((emp, index) => [
      index + 1,
      emp.employeeName || 'Không rõ',
      emp.type === 'full-time' ? 'Full-time' : 'Part-time',
      emp.totalHours,
      emp.hourlyRate,
      emp.salary
    ])

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Bang_Luong_Thang_${selectedMonth}_${selectedYear}.csv`
    link.click()
  }

  const filteredEmployees = monthlyData?.employeeDetails?.filter(emp => 
    (emp.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i
              return <option key={year} value={year}>{year}</option>
            })}
          </select>
        </div>

        <Button onClick={handleExportExcel} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start opacity-90">
              <p className="text-sm font-medium">Tổng giờ làm</p>
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-3xl font-bold mt-2">
              {isLoading ? <Skeleton className="h-8 w-20 bg-blue-400" /> : formatHours(stats.totalHours)}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-gray-500 text-sm font-medium">Tổng lương</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mt-2 text-gray-800">
              {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(stats.totalSalary)}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-gray-500 text-sm font-medium">Nhân viên</p>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mt-2 text-gray-800">
              {isLoading ? <Skeleton className="h-8 w-12" /> : stats.employeeCount}
            </h3>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm nhân viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giờ làm</TableHead>
                <TableHead>Lương/Giờ</TableHead>
                <TableHead>Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{emp.employeeName}</TableCell>
                    <TableCell>{emp.type}</TableCell>
                    <TableCell>{emp.totalHours}</TableCell>
                    <TableCell>{formatCurrency(emp.hourlyRate)}</TableCell>
                    <TableCell>{formatCurrency(emp.salary)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}