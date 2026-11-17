import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import InOut from "./InOut.jsx";
import RefundDialog from "./RefundDialog.jsx";
import {
  CalendarCheck,
  CalendarSync,
  UtensilsCrossed,
  Monitor,
  BarChart,
  LogOut,
} from "lucide-react";
import { GlobalContext } from "@/context/GlobalContext";
import { logout } from "@/api/auth";
import useInit from "@/hooks/useInit";
import { initLogin } from "@/init/loginInit";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LeftSidebar = ({ onSelect }) => {
  const ctx = useContext(GlobalContext);
  const { user } = ctx;
  const [openInOut, setOpenInOut] = useState(false);
  const [openRefund, setOpenRefund] = useState(false);
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("menu");

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
    {
      id: "inout",
      icon: CalendarCheck,
      label: "Vào/Ra ca",
      action: () => setOpenInOut(true),
    },
    {
      id: "menu",
      icon: UtensilsCrossed,
      label: "Thực đơn",
      action: () => {
        onSelect("menu");
        setActiveMenu("menu");
      },
    },
    {
      id: "refund",
      icon: CalendarSync,
      label: "Hoàn đơn",
      action: () => setOpenRefund(true),
    },
    {
      id: "kitchen",
      icon: Monitor,
      label: "Màn hình bếp",
      action: () => {
        onSelect("kitchen");
        setActiveMenu("kitchen");
      },
    },
    {
      id: "history",
      icon: BarChart,
      label: "Thống kê",
      action: () => {
        onSelect("history");
        setActiveMenu("history");
      },
    },
  ];

  return (
    <TooltipProvider>
      <>
        {/* Thu gọn chiều rộng xuống 72px */}
        <div className="w-[72px] h-screen bg-white border-r border-slate-200 flex flex-col items-center py-4 relative z-20 shadow-sm shrink-0">
          {/* Logo Icon */}
          <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center mb-6 shadow-md cursor-pointer">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>

          {/* Menu Items - Chỉ hiển thị Icon */}
          <div className="flex-1 w-full flex flex-col items-center gap-3 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={item.action}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-orange-100 text-[#F97316]"
                          : "text-slate-400 hover:bg-slate-50 hover:text-[#F97316]"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={isActive ? "text-[#F97316]" : ""}
                      />
                    </button>
                  </TooltipTrigger>
                  {/* Tooltip hiển thị chữ khi hover */}
                  <TooltipContent
                    side="right"
                    className="font-medium bg-slate-800 text-white"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* User & Logout */}
          <div className="mt-auto flex flex-col items-center gap-4 w-full px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-10 h-10 bg-orange-100 text-[#F97316] rounded-full flex items-center justify-center font-bold text-sm border border-orange-200 cursor-default">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="font-medium bg-slate-800 text-white"
              >
                {user?.full_name || "Người dùng"}
              </TooltipContent>
            </Tooltip>

            <div className="w-8 h-px bg-slate-100"></div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={22} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="font-medium bg-slate-800 text-white"
              >
                Đăng xuất
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <InOut open={openInOut} setOpen={setOpenInOut} />
        <RefundDialog open={openRefund} setOpen={setOpenRefund} />
      </>
    </TooltipProvider>
  );
};

export default LeftSidebar;
