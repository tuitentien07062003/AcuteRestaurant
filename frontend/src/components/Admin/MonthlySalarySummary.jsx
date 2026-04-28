import { useState, useMemo, useContext } from "react"
import { 
  Clock, 
  Users, 
  DollarSign,
  Search,
  FileSpreadsheet,
  Send,
  CheckCircle,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import payrollApi from "@/api/payrollApi"

export const MonthlySalarySummary = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [sending, setSending] = useState(false)
  const [sendMessage, setSendMessage] = useState(null)

  const { user } = useContext(GlobalContext)
  const storeId = user?.store_id || 7062003

  const { 
    data: monthlyData, 
    isLoading, 
    error,
    refetch
  } = useMonthlySalarySummary(selectedMonth, selectedYear, storeId)

  const stats = useMemo(() => {
    if (!monthlyData) return { totalHours: 0, totalSalary: 0, employeeCount: 0, partTimeSalary: 0, fullTimeSalary: 0 }
    
    return {
      totalHours: parseFloat(monthlyData.totalHours) || 0,
      totalSalary: parseFloat(monthlyData.totalSalary) || 0,
      employeeCount: monthlyData.employeeCount || 0,
      partTimeSalary: parseFloat(monthlyData.partTimeSalary) || 0,
      fullTimeSalary: parseFloat(monthlyData.fullTimeSalary) || 0,
      status: monthlyData.status || 'CALCULATED'
    }
  }, [monthlyData])

  const handleExportExcel = () => {
    if (!monthlyData?.employeeDetails) return

    const headers = ["STT", "Nhân viên", "Loại hình", "Tổng giờ làm", "Lương/Giờ hoặc CB", "Thành tiền"]
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

  const handleSendToHQ = async () => {
    setSending(true)
    setSendMessage(null)
    try {
      await payrollApi.sendToHQ(selectedMonth, selectedYear, storeId)
      setSendMessage({ type: 'success', text: 'Bảng lương đã được gửi lên HQ thành công!' })
      refetch()
    } catch (err) {
      setSendMessage({ type: 'error', text: err?.response?.data?.message || 'Lỗi gửi bảng lương lên HQ' })
    } finally {
      setSending(false)
    }
  }

  const filteredEmployees = monthlyData?.employeeDetails?.filter(emp => 
    (emp.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const statusBadge = () => {
    const status = stats.status
    if (status === 'APPROVED') return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Đã quyết toán HQ</Badge>
    if (status === 'SENT') return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Send className="w-3 h-3 mr-1" /> Đã gửi HQ</Badge>
    return <Badge variant="outline">Chưa gửi HQ</Badge>
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center">
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

          {statusBadge()}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSendToHQ} 
            disabled={sending || stats.status === 'SENT' || stats.status === 'APPROVED'}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Gửi HQ
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {sendMessage && (
        <div className={`p-3 rounded-lg text-sm ${sendMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {sendMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-gray-500 text-sm font-medium">Lương Part-time</p>
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold mt-2 text-gray-800">
              {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(stats.partTimeSalary)}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-gray-500 text-sm font-medium">Lương Full-time</p>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mt-2 text-gray-800">
              {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(stats.fullTimeSalary)}
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
                <TableHead>Lương/Giờ hoặc CB</TableHead>
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
                    <TableCell>
                      <Badge variant={emp.type === 'full-time' ? 'secondary' : 'default'}>
                        {emp.type === 'full-time' ? 'Full-time' : 'Part-time'}
                      </Badge>
                    </TableCell>
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

