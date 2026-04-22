import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"
import RevenueDashboard from "./RevenueDashboard"
import InventoryDashboard from "./InventoryDashboard"
import SalaryCalculationPage from "./SalaryCalculationPage"
import EmployeesDashboard from "./EmployeesDashboard"
import DocumentsDashboard from "./DocumentsDashboard"
import PaymentRequestDashboard from "./PaymentRequestDashboard"
import { 
  LayoutDashboard, 
  BarChart3 
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Simple Dashboard Overview Component
const DashboardOverview = () => {
  const stats = [
    { label: "Doanh thu hôm nay", value: "5,250,000 đ", icon: "💰", color: "bg-green-50" },
    { label: "Đơn hàng hôm nay", value: "42", icon: "📋", color: "bg-blue-50" },
    { label: "Nhân viên đang làm", value: "8", icon: "👥", color: "bg-purple-50" },
    { label: "Món bán chạy", value: "Burger Bò", icon: "🍔", color: "bg-orange-50" },
  ]

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
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Hoạt động gần đây</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">🧾</span>
                <div>
                  <p className="font-medium">Đơn hàng mới #ORD042</p>
                  <p className="text-sm text-gray-500">2 phút trước</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">👤</span>
                <div>
                  <p className="font-medium">Nhân viên check-in</p>
                  <p className="text-sm text-gray-500">15 phút trước</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📦</span>
                <div>
                  <p className="font-medium">Cập nhật tồn kho</p>
                  <p className="text-sm text-gray-500">30 phút trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Cảnh báo</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-medium text-red-700">3 món sắp hết hàng</p>
                  <p className="text-sm text-red-500">Cần nhập thêm</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-xl">⏰</span>
                <div>
                  <p className="font-medium text-yellow-700">2 phiếu chờ duyệt</p>
                  <p className="text-sm text-yellow-500">Cần xử lý</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">📅</span>
                <div>
                  <p className="font-medium text-blue-700">Chấm công hôm nay</p>
                  <p className="text-sm text-blue-500">8 nhân viên</p>
                </div>
              </div>
            </div>
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
}

const Admin = () => {
  const { tab } = useParams()
  const navigate = useNavigate()
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
    }
    navigate(pathMap[componentId] || '/admin')
  }

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardOverview />
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
      default:
        return <DashboardOverview />
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

