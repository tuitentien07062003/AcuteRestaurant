import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"
import RevenueDashboard from "./RevenueDashboard"
import InventoryDashboard from "./InventoryDashboard"
import SalaryCalculationPage from "./SalaryCalculationPage"
import EmployeesDashboard from "./EmployeesDashboard"
import DocumentsDashboard from "./DocumentsDashboard"
import PaymentRequestDashboard from "./PaymentRequestDashboard"
import ApprovalDashboard from "./ApprovalDashboard"
import { GlobalContext } from "@/context/GlobalContext"
import { 
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
  Utensils,
  AlertTriangle,
  Clock,
  FileText,
  CheckCircle
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchEmployees } from "@/api/employees.js"
import { fetchTimesheets } from "@/api/timesheet.js"
import { fetchBillOrders, fetchBillDetail } from "@/api/billOrders.js"
import inventoryApi from "@/api/inventoryApi.js"
import { fetchMenu } from "@/api/menu.js"
import payrollApi from "@/api/payrollApi.js"

const DashboardOverview = ({ user }) => {
  const [stats, setStats] = useState([
    { label: "Doanh thu hôm nay", value: "0 đ", icon: DollarSign, color: "bg-green-50", iconColor: "text-green-600" },
    { label: "Đơn hàng hôm nay", value: "0", icon: ShoppingCart, color: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Nhân viên đang làm", value: "0", icon: Users, color: "bg-purple-50", iconColor: "text-purple-600" },
    { label: "Món bán chạy", value: "Chưa có", icon: Utensils, color: "bg-orange-50", iconColor: "text-orange-600" },
  ])
  const [recentActivities, setRecentActivities] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: contextUser } = useContext(GlobalContext)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const storeId = contextUser?.store_id || 7062003
        
        // Lấy dữ liệu song song
        const [ordersDataRaw, employeesData, timesheetsData, inventoryDataRaw, menuData, salarySummary] = await Promise.all([
          fetchBillOrders().catch(() => []),
          fetchEmployees().catch(() => []),
          fetchTimesheets().catch(() => []),
          inventoryApi.getAll().catch(() => []),
          fetchMenu().catch(() => []),
          payrollApi.getDailySalarySummary(today, storeId).catch(() => null)
        ])

        const ordersData = Array.isArray(ordersDataRaw) ? ordersDataRaw : (ordersDataRaw?.data || []);
        const inventoryData = Array.isArray(inventoryDataRaw) ? inventoryDataRaw : (inventoryDataRaw?.data || []);

        const todayAllOrders = ordersData.filter(order => {
          if (!order || !order.created_at) return false;
          const orderDate = new Date(order.created_at).toISOString().split('T')[0]
          return orderDate === today
        })

        // 1. Doanh thu hôm nay (Giống logic RevenueDashboard.jsx: Tổng tiền - Đơn Refund - 10% VAT)
        const totalRevenue = todayAllOrders.reduce((sum, order) => {
          if (order.status === "Refund") return sum
          return sum + (Number(order.total_amount) || 0)
        }, 0)
        const netRevenue = totalRevenue - (totalRevenue * 0.1) // Trừ 10% VAT

        // 2. Đơn hàng hôm nay (Tính tổng tất cả đơn hàng trong ngày)
        const todayOrderCount = todayAllOrders.length

        // 3. Nhân viên đang làm (Lấy từ DailySalarySummary)
        const employeeCount = salarySummary?.employeeCount || 0

        // 4. Món bán chạy (Đếm từ chi tiết các đơn hàng KHÔNG bị Refund)
        const validTodayOrders = todayAllOrders.filter(o => o.status !== "Refund")
        const menuItemCounts = {}
        
        const detailPromises = validTodayOrders
          .filter(order => order.id)
          .map(order => fetchBillDetail(order.id).catch(() => null))
        
        const orderDetails = await Promise.all(detailPromises)
        
        orderDetails.forEach(detail => {
          if (detail && detail.items) {
            detail.items.forEach(item => {
              menuItemCounts[item.menu_item_id] = (menuItemCounts[item.menu_item_id] || 0) + item.quantity
            })
          }
        })

        let topMenuItem = "Chưa có"
        if (Object.keys(menuItemCounts).length > 0) {
          // Tìm ID món có số lượng cao nhất
          const topItemId = Object.keys(menuItemCounts).reduce((a, b) => menuItemCounts[a] > menuItemCounts[b] ? a : b)
          // Tìm tên món trong menuData (Lưu ý: ép kiểu topItemId về Number nếu id trong menuData là số)
          const topMenu = menuData.find(m => m.id === Number(topItemId) || m.id === topItemId)
          topMenuItem = topMenu?.name || "Chưa có"
        }

        // Cập nhật State Stats
        setStats([
          { label: "Doanh thu hôm nay", value: netRevenue.toLocaleString('vi-VN') + " đ", icon: DollarSign, color: "bg-green-50", iconColor: "text-green-600" },
          { label: "Đơn hàng hôm nay", value: todayOrderCount.toString(), icon: ShoppingCart, color: "bg-blue-50", iconColor: "text-blue-600" },
          { label: "Nhân viên đang làm", value: employeeCount.toString(), icon: Users, color: "bg-purple-50", iconColor: "text-purple-600" },
          { label: "Món bán chạy", value: topMenuItem, icon: Utensils, color: "bg-orange-50", iconColor: "text-orange-600" },
        ])

        // --- HOẠT ĐỘNG GẦN ĐÂY ---
        const recentOrders = ordersData.slice(0, 3).map(order => ({
          type: 'order',
          title: `Đơn hàng #${order.order_id || order.id?.toString().slice(0, 8)}`,
          time: getTimeAgo(order.created_at),
          icon: FileText
        }))
        setRecentActivities(recentOrders)

        // --- CẢNH BÁO ---
        const newAlerts = []
        
        // Tồn kho thấp
        const lowStockItems = inventoryData.filter(item => {
          const quantity = Number(item.quantity) || 0
          const minQuantity = Number(item.min_quantity) || 0
          return minQuantity > 0 && quantity <= minQuantity
        })
        if (lowStockItems.length > 0) {
          newAlerts.push({
            type: 'inventory',
            title: `${lowStockItems.length} món sắp hết hàng`,
            description: "Cần nhập thêm",
            icon: AlertTriangle,
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            descColor: "text-red-500"
          })
        }

        // Nhân viên chưa check-out (Đã sửa lỗi biến todayTimesheets thành timesheetsData)
        const todayTimesheets = timesheetsData.filter(ts => {
            const tsDate = new Date(ts.created_at || ts.check_in).toISOString().split('T')[0];
            return tsDate === today;
        });
        const notCheckedOut = todayTimesheets.filter(ts => ts.check_in && !ts.check_out).length
        if (notCheckedOut > 0) {
          newAlerts.push({
            type: 'timesheet',
            title: `${notCheckedOut} nhân viên đang làm việc`,
            description: "Đang hoạt động",
            icon: Clock,
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-700",
            descColor: "text-yellow-500"
          })
        }

        // Đơn hàng pending
        const pendingOrders = todayAllOrders.filter(o => o.status === 'Pending').length
        if (pendingOrders > 0) {
          newAlerts.push({
            type: 'pending',
            title: `${pendingOrders} đơn hàng chờ xử lý`,
            description: "Cần xác nhận",
            icon: ShoppingCart,
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
            descColor: "text-blue-500"
          })
        }

        setAlerts(newAlerts)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Vừa xong"
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    return `${diffDays} ngày trước`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Tổng quan</h2>
          <p className="text-gray-500">Chào mừng đến với trang quản trị</p>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-[#0077b6] to-[#0096c7] text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Bảng điều khiển</h3>
              <p className="text-white/80">Theo dõi hoạt động cửa hàng trong thời gian thực</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Hoạt động gần đây</h3>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const ActivityIcon = activity.icon
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <ActivityIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Cảnh báo</h3>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert, index) => {
                  const AlertIcon = alert.icon
                  return (
                    <div key={index} className={`flex items-center gap-3 p-3 ${alert.bgColor} rounded-lg`}>
                      <AlertIcon className={`w-5 h-5 ${alert.textColor}`} />
                      <div>
                        <p className={`font-medium ${alert.textColor}`}>{alert.title}</p>
                        <p className={`text-sm ${alert.descColor}`}>{alert.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">Tất cả ổn định</p>
                  <p className="text-sm text-green-500">Không có cảnh báo nào</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Map Vietnamese paths to component IDs
const pathToComponentMap = {
  'doanhthu': 'revenue',
  'kiemkho': 'inventory',
  'tinhluong': 'salary',
  'nhanvien': 'employees',
  'hoso': 'documents',
  'phie_thanhtoan': 'payment',
  'xetduyet': 'approval',
}

const Admin = () => {
  const { tab } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(GlobalContext)
  const [activeComponent, setActiveComponent] = useState("dashboard")

  // Update active component based on URL
  useEffect(() => {
    if (!tab) {
      setActiveComponent("dashboard")
    } else if (pathToComponentMap[tab]) {
      setActiveComponent(pathToComponentMap[tab])
    } else {
      setActiveComponent("dashboard")
    }
  }, [tab])

  const handleSelect = (componentId) => {
    setActiveComponent(componentId)
    // Map component ID back to Vietnamese path
    const pathMap = {
      'dashboard': '/admin',
      'revenue': '/admin/doanhthu',
      'inventory': '/admin/kiemkho',
      'salary': '/admin/tinhluong',
      'employees': '/admin/nhanvien',
      'documents': '/admin/hoso',
      'payment': '/admin/phie_thanhtoan',
      'approval': '/admin/xetduyet',
    }
    navigate(pathMap[componentId] || '/admin')
  }

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardOverview user={user} />
      case "revenue":
        return <RevenueDashboard />
      case "inventory":
        return <InventoryDashboard />
      case "salary":
        return <SalaryCalculationPage />
      case "employees":
        return <EmployeesDashboard />
      case "documents":
        return <DocumentsDashboard />
      case "payment":
        return <PaymentRequestDashboard />
      case "approval":
        return user?.role === 'SM' ? <ApprovalDashboard /> : <DashboardOverview user={user} />
      default:
        return <DashboardOverview user={user} />
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar */}
      <AdminSidebar 
        activeMenu={activeComponent} 
        onSelect={handleSelect} 
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderComponent()}
        </div>
      </div>
    </div>
  )
}

export default Admin

