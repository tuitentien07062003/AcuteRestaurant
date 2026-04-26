import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useContext } from "react"
import { GlobalContext } from "@/context/GlobalContext"
import { 
  LayoutDashboard, 
  DollarSign, 
  Package, 
  Users, 
  FileText, 
  CreditCard, 
  LogOut,
  ChevronRight,
  BarChart3,
  CheckCircle
} from "lucide-react"

const AdminSidebar = ({ activeMenu, onSelect }) => {
  const navigate = useNavigate()
  const { tab } = useParams()
  const { user } = useContext(GlobalContext)
  const [hoveredItem, setHoveredItem] = useState(null)

  // Get current active tab from URL
  const currentTab = tab || 'dashboard'

  const baseMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { id: 'revenue', icon: DollarSign, label: 'Doanh thu', path: '/admin/doanhthu' },
    { id: 'inventory', icon: Package, label: 'Kiểm kho', path: '/admin/kiemkho' },
    { id: 'salary', icon: CreditCard, label: 'Tính lương', path: '/admin/tinhluong' },
    { id: 'employees', icon: Users, label: 'Nhân viên', path: '/admin/nhanvien' },
    { id: 'documents', icon: FileText, label: 'Hồ sơ', path: '/admin/hoso' },
    { id: 'payment', icon: CreditCard, label: 'Phiếu thanh toán', path: '/admin/phie_thanhtoan' },
  ]

  const smMenuItems = [
    { id: 'approval', icon: CheckCircle, label: 'Xét duyệt yêu cầu', path: '/admin/xetduyet' },
  ]

  const menuItems = user?.role === 'SM' ? [...baseMenuItems, ...smMenuItems] : baseMenuItems

  const handleLogout = () => {
    navigate("/login")
  }

  const handleClick = (item) => {
    if (onSelect) {
      onSelect(item.id)
    }
    navigate(item.path)
  }

  return (
    <div className="w-64 h-screen bg-white shadow-xl border-r flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#0077b6] to-[#0096c7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">Admin</h2>
            <p className="text-white/70 text-xs">Quản trị hệ thống</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id || (item.id === 'dashboard' && !tab)
          
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-gradient-to-r from-[#0077b6] to-[#0096c7] text-white shadow-lg" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-gray-500 group-hover:text-[#0077b6]"} />
              <span className="font-medium flex-1 text-left">{item.label}</span>
              {isActive && (
                <ChevronRight size={16} className="text-white/80" />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut size={20} />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar

