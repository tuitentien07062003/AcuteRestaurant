import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  NotebookText, 
  Menu, 
  X, 
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Tổng quan", path: "/hq/dashboard", icon: LayoutDashboard },
  { name: "Chi nhánh", path: "/hq/branches", icon: Store },
  { name: "Nhân sự", path: "/hq/employees", icon: Users },
  { name: "Tổng hợp lương", path: "/hq/salary", icon: NotebookText },
];

export default function HQLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
              HQ
            </div>
            <span className="text-lg font-bold text-gray-800">Quản lý Tổng</span>
          </div>
          <button className="md:hidden text-gray-500" onClick={closeMobileMenu}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6">
          <button
            className="p-2 -ml-2 mr-2 text-gray-600 rounded-md hover:bg-gray-100 md:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800 md:hidden">HQ Dashboard</h1>
            <div className="hidden md:block">{/* Chỗ trống cho thanh tìm kiếm hoặc Breadcrumb */}</div>
            
            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white shadow-sm flex items-center justify-center text-xs font-medium">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}