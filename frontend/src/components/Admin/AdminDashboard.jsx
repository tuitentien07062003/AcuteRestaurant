import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import RevenueDashboard from "./RevenueDashboard";
import InventoryDashboard from "./InventoryDashboard";
import SalaryCalculationPage from "./SalaryCalculationPage";
import EmployeesDashboard from "./EmployeesDashboard";
import DocumentsDashboard from "./DocumentsDashboard";
import PaymentRequestDashboard from "./PaymentRequestDashboard";
import ApprovalDashboard from "./ApprovalDashboard";
import { GlobalContext } from "@/context/GlobalContext";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
  Utensils,
  AlertTriangle,
  Clock,
  FileText,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchEmployees } from "@/api/employees.js";
import { fetchTimesheets } from "@/api/timesheet.js";
import { fetchBillOrders, fetchBillDetail } from "@/api/billOrders.js";
import inventoryApi from "@/api/inventoryApi.js";
import { fetchMenu } from "@/api/menu.js";
import payrollApi from "@/api/payrollApi.js";

// ==========================================
// COMPONENT 1: TỔNG QUAN (DASHBOARD)
// ==========================================
const DashboardOverview = ({ user }) => {
  const [stats, setStats] = useState([
    {
      label: "Doanh thu hôm nay",
      value: "0 đ",
      icon: DollarSign,
      color: "bg-orange-50",
      iconColor: "text-[#F97316]",
    },
    {
      label: "Đơn hàng hôm nay",
      value: "0",
      icon: ShoppingCart,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Nhân viên đang làm",
      value: "0",
      icon: Users,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Món bán chạy",
      value: "Chưa có",
      icon: Utensils,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: contextUser } = useContext(GlobalContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const storeId = contextUser?.store_id || 7062003;

        // Lấy dữ liệu song song
        const [
          ordersDataRaw,
          employeesData,
          timesheetsData,
          inventoryDataRaw,
          menuData,
          salarySummary,
        ] = await Promise.all([
          fetchBillOrders().catch(() => []),
          fetchEmployees().catch(() => []),
          fetchTimesheets().catch(() => []),
          inventoryApi.getAll().catch(() => []),
          fetchMenu().catch(() => []),
          payrollApi.getDailySalarySummary(today, storeId).catch(() => null),
        ]);

        const ordersData = Array.isArray(ordersDataRaw)
          ? ordersDataRaw
          : ordersDataRaw?.data || [];
        const inventoryData = Array.isArray(inventoryDataRaw)
          ? inventoryDataRaw
          : inventoryDataRaw?.data || [];

        const todayAllOrders = ordersData.filter((order) => {
          if (!order || !order.created_at) return false;
          const orderDate = new Date(order.created_at)
            .toISOString()
            .split("T")[0];
          return orderDate === today;
        });

        // 1. Doanh thu hôm nay (Đã sửa: POS không thu VAT nên không trừ 10%)
        const totalRevenue = todayAllOrders.reduce((sum, order) => {
          if (order.status === "Refund") return sum;
          return sum + (Number(order.total_amount) || 0);
        }, 0);

        // Lấy doanh thu thuần (trừ giảm giá nếu có)
        const netRevenue = todayAllOrders.reduce((sum, order) => {
          if (order.status === "Refund") return sum;
          return (
            sum +
            ((Number(order.total_amount) || 0) -
              (Number(order.discount_amount) || 0))
          );
        }, 0);

        // 2. Đơn hàng hôm nay
        const todayOrderCount = todayAllOrders.length;

        // 3. Nhân viên đang làm
        const employeeCount = salarySummary?.employeeCount || 0;

        // 4. Món bán chạy
        const validTodayOrders = todayAllOrders.filter(
          (o) => o.status !== "Refund",
        );
        const menuItemCounts = {};

        const detailPromises = validTodayOrders
          .filter((order) => order.id)
          .map((order) => fetchBillDetail(order.id).catch(() => null));

        const orderDetails = await Promise.all(detailPromises);

        orderDetails.forEach((detail) => {
          if (detail && detail.items) {
            detail.items.forEach((item) => {
              menuItemCounts[item.menu_item_id] =
                (menuItemCounts[item.menu_item_id] || 0) + item.quantity;
            });
          }
        });

        let topMenuItem = "Chưa có";
        if (Object.keys(menuItemCounts).length > 0) {
          const topItemId = Object.keys(menuItemCounts).reduce((a, b) =>
            menuItemCounts[a] > menuItemCounts[b] ? a : b,
          );
          const topMenu = menuData.find(
            (m) => m.id === Number(topItemId) || m.id === topItemId,
          );
          topMenuItem = topMenu?.name || "Chưa có";
        }

        // Cập nhật State Stats
        setStats([
          {
            label: "Doanh thu hôm nay",
            value: netRevenue.toLocaleString("vi-VN") + " đ",
            icon: DollarSign,
            color: "bg-orange-50",
            iconColor: "text-[#F97316]",
          },
          {
            label: "Đơn hàng hôm nay",
            value: todayOrderCount.toString(),
            icon: ShoppingCart,
            color: "bg-blue-50",
            iconColor: "text-blue-600",
          },
          {
            label: "Nhân viên đang làm",
            value: employeeCount.toString(),
            icon: Users,
            color: "bg-purple-50",
            iconColor: "text-purple-600",
          },
          {
            label: "Món bán chạy",
            value: topMenuItem,
            icon: Utensils,
            color: "bg-green-50",
            iconColor: "text-green-600",
          },
        ]);

        // --- HOẠT ĐỘNG GẦN ĐÂY ---
        const recentOrders = ordersData.slice(0, 4).map((order) => ({
          type: "order",
          title: `Đơn hàng #${order.order_id || order.id?.toString().slice(0, 8)}`,
          time: getTimeAgo(order.created_at),
          icon: FileText,
        }));
        setRecentActivities(recentOrders);

        // --- CẢNH BÁO ---
        const newAlerts = [];

        // Tồn kho thấp
        const lowStockItems = inventoryData.filter((item) => {
          const quantity = Number(item.quantity) || 0;
          const minQuantity = Number(item.min_quantity) || 0;
          return minQuantity > 0 && quantity <= minQuantity;
        });
        if (lowStockItems.length > 0) {
          newAlerts.push({
            type: "inventory",
            title: `${lowStockItems.length} món sắp hết hàng`,
            description: "Cần nhập thêm nguyên liệu",
            icon: AlertTriangle,
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            descColor: "text-red-500",
          });
        }

        // Nhân viên chưa check-out
        const todayTimesheets = timesheetsData.filter((ts) => {
          const tsDate = new Date(ts.created_at || ts.check_in)
            .toISOString()
            .split("T")[0];
          return tsDate === today;
        });
        const notCheckedOut = todayTimesheets.filter(
          (ts) => ts.check_in && !ts.check_out,
        ).length;
        if (notCheckedOut > 0) {
          newAlerts.push({
            type: "timesheet",
            title: `${notCheckedOut} nhân viên đang làm việc`,
            description: "Chưa chấm công ra ca",
            icon: Clock,
            bgColor: "bg-orange-50",
            textColor: "text-[#F97316]",
            descColor: "text-orange-500",
          });
        }

        // Đơn hàng pending
        const pendingOrders = todayAllOrders.filter(
          (o) => o.status === "Pending",
        ).length;
        if (pendingOrders > 0) {
          newAlerts.push({
            type: "pending",
            title: `${pendingOrders} đơn hàng chờ xử lý`,
            description: "Bếp cần xác nhận",
            icon: ShoppingCart,
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
            descColor: "text-blue-500",
          });
        }

        setAlerts(newAlerts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [contextUser]);

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Tổng quan hệ thống
          </h2>
          <p className="text-slate-500 mt-1">
            Chào mừng trở lại,{" "}
            <span className="font-semibold text-[#F97316]">
              {user?.full_name || "Quản trị viên"}
            </span>
            !
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-sm font-medium text-slate-600">
          <Clock size={16} className="text-[#F97316]" />
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, index) => (
                <Card
                  key={index}
                  className="animate-pulse border-none shadow-sm h-28 bg-slate-100 rounded-2xl"
                ></Card>
              ))
          : stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-md transition-shadow border-slate-200 rounded-2xl"
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}
                    >
                      <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F97316]" /> Hoạt động gần đây
            </h3>
          </div>
          <CardContent className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <ActivityIcon className="w-5 h-5 text-[#F97316]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-6">
                Chưa có hoạt động nào
              </p>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F97316]" /> Cảnh báo cần
              chú ý
            </h3>
          </div>
          <CardContent className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert, index) => {
                  const AlertIcon = alert.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 ${alert.bgColor} rounded-xl border border-opacity-50`}
                    >
                      <AlertIcon className={`w-6 h-6 ${alert.textColor}`} />
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${alert.textColor}`}>
                          {alert.title}
                        </p>
                        <p className={`text-xs mt-0.5 ${alert.descColor}`}>
                          {alert.description}
                        </p>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 ${alert.textColor} opacity-50`}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-700 text-sm">
                    Hệ thống ổn định
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Không có cảnh báo nào cần xử lý
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT 2: LAYOUT CHÍNH & ROUTING
// ==========================================
const pathToComponentMap = {
  doanhthu: "revenue",
  kiemkho: "inventory",
  tinhluong: "salary",
  nhanvien: "employees",
  hoso: "documents",
  phie_thanhtoan: "payment",
  xetduyet: "approval",
};

const Admin = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(GlobalContext);
  const [activeComponent, setActiveComponent] = useState("dashboard");

  // Update active component based on URL
  useEffect(() => {
    if (!tab) {
      setActiveComponent("dashboard");
    } else if (pathToComponentMap[tab]) {
      setActiveComponent(pathToComponentMap[tab]);
    } else {
      setActiveComponent("dashboard");
    }
  }, [tab]);

  const handleSelect = (componentId) => {
    setActiveComponent(componentId);
    const pathMap = {
      dashboard: "/admin",
      revenue: "/admin/doanhthu",
      inventory: "/admin/kiemkho",
      salary: "/admin/tinhluong",
      employees: "/admin/nhanvien",
      documents: "/admin/hoso",
      payment: "/admin/phie_thanhtoan",
      approval: "/admin/xetduyet",
    };
    navigate(pathMap[componentId] || "/admin");
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardOverview user={user} />;
      case "revenue":
        return <RevenueDashboard />;
      case "inventory":
        return <InventoryDashboard />;
      case "salary":
        return <SalaryCalculationPage />;
      case "employees":
        return <EmployeesDashboard />;
      case "documents":
        return <DocumentsDashboard />;
      case "payment":
        return <PaymentRequestDashboard />;
      case "approval":
        return user?.role === "SM" ? (
          <ApprovalDashboard />
        ) : (
          <DashboardOverview user={user} />
        );
      default:
        return <DashboardOverview user={user} />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Left Sidebar */}
      <AdminSidebar activeMenu={activeComponent} onSelect={handleSelect} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default Admin;
