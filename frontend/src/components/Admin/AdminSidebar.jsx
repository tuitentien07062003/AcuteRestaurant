import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GlobalContext } from "@/context/GlobalContext";
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
  CheckCircle,
} from "lucide-react";

const AdminSidebar = ({ activeMenu, onSelect }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Sửa lỗi: Dùng useLocation thay vì useParams
  const { user } = useContext(GlobalContext);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Map URL hiện tại ra ID của tab để highlight
  const pathMap = {
    "/admin": "dashboard",
    "/admin/doanhthu": "revenue",
    "/admin/kiemkho": "inventory",
    "/admin/tinhluong": "salary",
    "/admin/nhanvien": "employees",
    "/admin/hoso": "documents",
    "/admin/phie_thanhtoan": "payment",
    "/admin/xetduyet": "approval",
  };

  const currentTab = pathMap[location.pathname] || "dashboard";

  const baseMenuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Tổng quan",
      path: "/admin",
    },
    {
      id: "revenue",
      icon: DollarSign,
      label: "Doanh thu",
      path: "/admin/doanhthu",
    },
    {
      id: "inventory",
      icon: Package,
      label: "Kiểm kho",
      path: "/admin/kiemkho",
    },
    {
      id: "salary",
      icon: CreditCard,
      label: "Tính lương",
      path: "/admin/tinhluong",
    },
    {
      id: "employees",
      icon: Users,
      label: "Nhân viên",
      path: "/admin/nhanvien",
    },
    { id: "documents", icon: FileText, label: "Hồ sơ", path: "/admin/hoso" },
    {
      id: "payment",
      icon: CreditCard,
      label: "Phiếu thanh toán",
      path: "/admin/phie_thanhtoan",
    },
  ];

  const smMenuItems = [
    {
      id: "approval",
      icon: CheckCircle,
      label: "Xét duyệt yêu cầu",
      path: "/admin/xetduyet",
    },
  ];

  const menuItems =
    user?.role === "SM" ? [...baseMenuItems, ...smMenuItems] : baseMenuItems;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleClick = (item) => {
    if (onSelect) onSelect(item.id);
    navigate(item.path);
  };

  return (
    <div className="w-[260px] h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-20">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center shadow-sm">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg leading-tight">
            Acute Admin
          </h2>
          <p className="text-slate-500 text-xs font-medium">
            Quản trị hệ thống
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">
          Menu chính
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-[#F97316] text-white shadow-md shadow-orange-500/20"
                  : "text-slate-600 hover:bg-orange-50 hover:text-[#F97316]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-[#F97316]"
                  }
                />
                <span
                  className={`font-medium text-sm ${isActive ? "text-white" : "text-slate-700 group-hover:text-[#F97316]"}`}
                >
                  {item.label}
                </span>
              </div>
              {isActive && <ChevronRight size={16} className="text-white/80" />}
            </button>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-[#F97316] flex items-center justify-center font-bold border border-orange-200">
            {user?.full_name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.full_name || "Quản trị viên"}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Vai trò: {user?.role || "SM"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-200 bg-white"
        >
          <LogOut size={18} />
          <span className="font-semibold text-sm">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
