
import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Receipt,
  Download,
  Calendar,
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { fetchBillOrders } from "@/api/billOrders"

// Mock data for demonstration
const mockBills = [
  { id: 1, order_id: "ORD001", total_amount: 150000, discount_amount: 15000, payment_method: "Cash", status: "Completed", created_at: "2024-01-15T10:30:00" },
  { id: 2, order_id: "ORD002", total_amount: 200000, discount_amount: 0, payment_method: "Momo", status: "Completed", created_at: "2024-01-15T11:00:00" },
  { id: 3, order_id: "ORD003", total_amount: 85000, discount_amount: 8500, payment_method: "Cash", status: "Completed", created_at: "2024-01-15T11:30:00" },
  { id: 4, order_id: "ORD004", total_amount: 320000, discount_amount: 32000, payment_method: "Cash", status: "Refund", created_at: "2024-01-15T12:00:00" },
  { id: 5, order_id: "ORD005", total_amount: 450000, discount_amount: 0, payment_method: "Momo", status: "Completed", created_at: "2024-01-15T12:30:00" },
]

const RevenueDashboard = () => {
  const [dateRange, setDateRange] = useState("today")
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBills()
  }, [dateRange])

  const loadBills = async () => {
    setLoading(true)
    try {
      const data = await fetchBillOrders()
      setBills(data || mockBills)
    } catch (error) {
      console.error("Error loading bills:", error)
      setBills(mockBills)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalRevenue = bills.reduce((sum, bill) => {
    if (bill.status === "Refund") return sum
    return sum + Number(bill.total_amount || 0)
  }, 0)

  const totalDiscount = bills.reduce((sum, bill) => {
    return sum + Number(bill.discount_amount || 0)
  }, 0)

  const totalRefund = bills.reduce((sum, bill) => {
    if (bill.status === "Refund") return sum + Number(bill.total_amount || 0)
    return sum
  }, 0)

  const vat = totalRevenue * 0.1 // 10% VAT
  const netRevenue = totalRevenue - vat

  const stats = [
    { 
      title: "Doanh thu thuần", 
      value: totalRevenue, 
      icon: DollarSign, 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "Giảm giá", 
      value: totalDiscount, 
      icon: Percent, 
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    { 
      title: "Hoàn đơn", 
      value: totalRefund, 
      icon: TrendingDown, 
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    { 
      title: "Sau VAT (10%)", 
      value: netRevenue, 
      icon: TrendingUp, 
      color: "text-[#0077b6]",
      bgColor: "bg-blue-50"
    },
  ]

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ"
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const handleExport = () => {
    // Generate CSV export
    const headers = ["Mã đơn", "Tổng tiền", "Giảm giá", "Thanh toán", "Trạng thái", "Ngày"]
    const rows = bills.map(bill => [
      bill.order_id,
      bill.total_amount,
      bill.discount_amount,
      bill.payment_method,
      bill.status,
      bill.created_at
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `DoanhThu_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Doanh thu</h2>
          <p className="text-gray-500">Theo dõi doanh thu cửa hàng</p>
        </div>
        
        <div className="flex gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
            <Calendar size={18} className="text-gray-500" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border-none outline-none text-sm bg-transparent"
            >
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {formatCurrency(stat.value)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Chi tiết doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Mã đơn</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Giảm giá</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{bill.order_id}</TableCell>
                  <TableCell>{formatCurrency(bill.total_amount)}</TableCell>
                  <TableCell className="text-green-600">
                    {bill.discount_amount > 0 ? `-${formatCurrency(bill.discount_amount)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={bill.payment_method === "Momo" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}>
                      {bill.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      bill.status === "Completed" ? "bg-green-100 text-green-700" :
                      bill.status === "Refund" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }>
                      {bill.status === "Completed" ? "Hoàn thành" : 
                       bill.status === "Refund" ? "Hoàn đơn" : 
                       bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{formatDate(bill.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default RevenueDashboard


