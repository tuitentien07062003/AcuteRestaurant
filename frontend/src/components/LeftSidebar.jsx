import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import InOut from "./InOut.jsx"
import RefundDialog from './RefundDialog.jsx'
import { CalendarCheck, CalendarSync, UtensilsCrossed, Monitor, BarChart, LogOut, Clock } from "lucide-react"
import logo from "../assets/logo.png"
import { GlobalContext } from "@/context/GlobalContext"
import { logout } from "@/api/auth"
import useInit from "@/hooks/useInit"
import { initLogin } from "@/init/loginInit"

const LeftSidebar = ({ onSelect }) => {
  const ctx = useContext(GlobalContext);
  const { user } = ctx;
  const [openInOut, setOpenInOut] = useState(false);
  const [openRefund, setOpenRefund] = useState(false);
  const navigate = useNavigate();
  
  // Track active menu item
  const [activeMenu, setActiveMenu] = useState('menu');

  useInit(() => initLogin(ctx), []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const menuItems = [
    { id: 'inout', icon: CalendarCheck, label: 'Ra/vào ca', action: () => setOpenInOut(true) },
    { id: 'menu', icon: UtensilsCrossed, label: 'Thực đơn', action: () => { onSelect('menu'); setActiveMenu('menu'); } },
    { id: 'refund', icon: CalendarSync, label: 'Hoàn đơn', action: () => setOpenRefund(true) },
    { id: 'kitchen', icon: Monitor, label: 'Màn hình bếp', action: () => { onSelect('kitchen'); setActiveMenu('kitchen'); } },
    { id: 'history', icon: BarChart, label: 'Thống kê', action: () => { onSelect('history'); setActiveMenu('history'); } },
  ];

  return (
    <>
    <div className="w-60 h-screen bg-white shadow-xl border-r flex flex-col relative z-20">
      {/* Header with Logo */}
      <div className="p-4 border-b bg-gradient-to-r from-[#0077b6] to-[#0096c7]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-white tracking-tight">Acute</h2>
            <p className="text-white/70 text-xs">Restaurant System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0077b6] to-[#00b4d8] rounded-full flex items-center justify-center text-white font-semibold">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">
              {user?.full_name || "Đang tải..."}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-gradient-to-r from-[#0077b6] to-[#0096c7] text-white shadow-lg shadow-[#0077b6]/25" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-[#0077b6]"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-[#0077b6]/10'}`}>
                <Icon size={20} className={isActive ? 'text-white' : ''} />
              </div>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer - Logout */}
      <div className="p-3 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-red-100">
            <LogOut size={20} />
          </div>
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>

    <InOut open={openInOut} setOpen={setOpenInOut} />
    <RefundDialog open={openRefund} setOpen={setOpenRefund} />
    </>
  );
};

export default LeftSidebar;

