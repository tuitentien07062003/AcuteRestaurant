import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import InOut from "./InOut.jsx"
import RefundDialog from './RefundDialog.jsx'
import { CalendarCheck, CalendarSync, UtensilsCrossed, Monitor, BarChart, LogOut } from "lucide-react";
import logo from "../assets/logo.png";
import { GlobalContext } from "@/context/GlobalContext";
import { logout } from "@/api/auth";
import useInit from "@/hooks/useInit";
import { initLogin } from "@/init/loginInit";

const LeftSidebar = ( onSelect ) => {
  const ctx = useContext(GlobalContext);
  const { user } = ctx;
  const [openInOut, setOpenInOut] = useState(false);
  const [openRefund, setOpenRefund] = useState(false);
  const navigate = useNavigate();

  useInit(() => initLogin(ctx), []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
    <div className="w-50 h-screen bg-gray-50 shadow-sm border-r flex flex-col justify-between">
      
      <div>
        {/* Tên thương hiệu */}
        <div className="px-2 min-h-15 flex items-center gap-3">
            <img
              src={logo}
              alt="logo"
              className="w-12 h-12 object-contain rounded-full"
            />
          <div className="wrap-anywhere">
            <h2 className="font-semibold text-lg text-[#0077b6]">Acute</h2>
            <p className="text-gray-500 text-sm">
              {user?.full_name || "Đang tải..."}
            </p>
          </div>
        </div>

        <div className="border-t my-2"></div>

        {/* Menu */}
        <ul className="px-4 space-y-4 text-base">
          <li
            onClick={( ) => setOpenInOut(true)}
            className="flex items-center gap-3 cursor-pointer hover:text-[#0077b6] hover:font-semibold">
            <CalendarCheck size={20}/>
            Ra/vào ca
          </li>
          <li 
            onClick={() => onSelect.onSelect('menu')}
            className="flex items-center gap-3 cursor-pointer hover:text-[#0077b6] hover:font-semibold">
            <UtensilsCrossed size={20}/>
            Thực đơn
          </li>
          <li 
            onClick={() => setOpenRefund(true)}
            className="flex items-center gap-3 cursor-pointer hover:text-[#0077b6] hover:font-semibold">
            <CalendarSync size={20}/>
            Hoàn đơn
          </li>
          <li 
            onClick={() => onSelect.onSelect('kitchen')}
            className="flex items-center gap-3 cursor-pointer hover:text-[#0077b6] hover:font-semibold">
            <Monitor size={20}/>
            Màn hình bếp
          </li>
          <li
            onClick={() => onSelect.onSelect('history')}
            className="flex items-center gap-3 cursor-pointer hover:text-[#0077b6] hover:font-semibold">
            <BarChart size={20}/>
            Thống kê
          </li>
        </ul>
      </div>

      {/* Cài đặt - Đăng xuất */}
      <div>
        <div className="border-t mb-2"></div>
        <div className="px-4 mb-4 space-y-4 text-base">
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 cursor-pointer hover:text-[#0077b6] hover:font-semibold">
            <LogOut size={20}/>
            Đăng xuất
          </div>
        </div>
      </div>
    </div>

  <InOut open={openInOut} setOpen={setOpenInOut} />
  <RefundDialog open={openRefund} setOpen={setOpenRefund} />
    </>
  );
};

export default LeftSidebar;