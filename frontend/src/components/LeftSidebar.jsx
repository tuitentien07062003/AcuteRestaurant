import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import InOut from "./InOut.jsx"
import RefundDialog from './RefundDialog.jsx'
import axios from "axios"
import { CalendarCheck, CalendarSync, UtensilsCrossed, Monitor, BarChart, LogOut } from "lucide-react";

const LeftSidebar = ( onSelect ) => {
  const [user, setUser] = useState(null);
  const [openInOut, setOpenInOut] = useState(false);
  const [openRefund, setOpenRefund] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/acute/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/acute/auth/logout", {}, { withCredentials: true });
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
              src="/src/assets/logo.png"
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