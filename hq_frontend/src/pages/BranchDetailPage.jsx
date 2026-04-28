import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  User,
  Calendar,
  Search,
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  Target,
  Loader2,
  AlertCircle,
  Edit2,
  Save,
  X,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useStoreDetail, useStoreSales, useUpdateStoreSales, useStorePayrollDaily } from "../hooks/useStores";
import { formatCurrency, formatDate } from "../lib/formatters";

// Cấu hình ID mặc định theo yêu cầu
const DEFAULT_STORE_ID = "7062003";

// Helper functions
function generateTaxCode(id) {
  return `03${String(id).padStart(8, "0")}-001`;
}

export default function BranchDetailPage() {
  const { id } = useParams();
  const storeId = id || DEFAULT_STORE_ID;
  const navigate = useNavigate();
  
  const { store, loading, error } = useStoreDetail(storeId);

  // Filter state
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [appliedFrom, setAppliedFrom] = useState(from);
  const [appliedTo, setAppliedTo] = useState(to);

  const { sales, loading: salesLoading, refetch: refetchSales } = useStoreSales(
    storeId,
    appliedFrom,
    appliedTo
  );

  const { update: updateSales, loading: updating } = useUpdateStoreSales();

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ forecast: "", total_hours: "", labor_cost: "" });

  // Payroll auto-fill state
  const [payrollDate, setPayrollDate] = useState(null);
  const { data: payrollData } = useStorePayrollDaily(payrollDate, storeId);

  // Memoized values for "Thông tin" tab
  const sm = useMemo(() => {
    if (!store?.employees) return null;
    return store.employees.find((e) => e.role === "SM");
  }, [store]);

  const recentSales = useMemo(() => {
    if (!store?.salesSummaries) return [];
    return [...store.salesSummaries].sort(
      (a, b) => new Date(b.sales_date) - new Date(a.sales_date)
    ).slice(0, 7);
  }, [store]);

  const handleApplyFilter = () => {
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      forecast: row.forecast ?? "",
      total_hours: row.total_hours ?? "",
      labor_cost: row.labor_cost ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ forecast: "", total_hours: "", labor_cost: "" });
  };

  const handleAutoFill = (dateStr) => {
    setPayrollDate(dateStr);
  };

  useMemo(() => {
    if (payrollData && editingId) {
      setEditForm((prev) => ({
        ...prev,
        total_hours: payrollData.totalHours ?? prev.total_hours,
        labor_cost: payrollData.totalPartTimeSalary ?? prev.labor_cost,
      }));
    }
  }, [payrollData, editingId]);

  const handleSave = async (row) => {
    try {
      await updateSales(storeId, row.sales_date, {
        forecast: editForm.forecast === "" ? 0 : parseFloat(editForm.forecast),
        total_hours: editForm.total_hours === "" ? 0 : parseFloat(editForm.total_hours),
        labor_cost: editForm.labor_cost === "" ? 0 : parseFloat(editForm.labor_cost),
      });
      setEditingId(null);
      refetchSales();
    } catch (err) {
      alert("Lỗi khi lưu: " + (err?.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="p-10 text-red-500 text-center"><AlertCircle className="mx-auto mb-2" />{error}</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chi nhánh {store?.name_store || storeId}</h2>
          <p className="text-gray-500 text-sm">Xem chi tiết và thiết lập mục tiêu kinh doanh</p>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-white border">
          <TabsTrigger value="info">Thông tin chung</TabsTrigger>
          <TabsTrigger value="business">Kinh doanh & KPI</TabsTrigger>
        </TabsList>

        {/* Tab Thông tin chung (ĐÃ HOÀN TÁC) */}
        <TabsContent value="info" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  Thông tin cửa hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mã số thuế</p>
                    <p className="font-medium text-gray-900">{generateTaxCode(store?.id || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                    <Badge className="bg-green-50 text-green-700 border border-green-200">Đang hoạt động</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <p className="font-medium text-gray-900">
                        {store?.address || "—"}
                        {store?.city ? `, ${store.city}` : ""}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Hotline</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <p className="font-medium text-gray-900">{store?.hotline || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cấp độ (Tier)</p>
                    <p className="font-medium text-gray-900">{store?.tier || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Quản lý cửa hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sm ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                      {sm.full_name?.charAt(0)?.toUpperCase() || "SM"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{sm.full_name}</p>
                      <p className="text-xs text-gray-500">{sm.employee_id || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" /> {sm.phone || "—"}
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Store Manager</Badge>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm py-4 text-center">Chưa có Store Manager</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Doanh thu 7 ngày gần nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Ngày</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Doanh thu</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Số bill</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Labor %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3">{formatDate(s.sales_date)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(s.net_sales)}</td>
                        <td className="py-2 px-3 text-right">{s.bill_count || 0}</td>
                        <td className="py-2 px-3 text-right">{s.labor_percent ? `${s.labor_percent.toFixed(1)}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Kinh doanh & KPI */}
        <TabsContent value="business" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Báo cáo chi tiết & KPI
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36 h-9" />
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36 h-9" />
                  <Button size="sm" onClick={handleApplyFilter}><Search className="w-4 h-4 mr-1" /> Lọc</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b">
                      <th className="py-3 px-4 text-left font-medium">Ngày</th>
                      <th className="py-3 px-4 text-right font-medium">Doanh thu</th>
                      <th className="py-3 px-4 text-right font-medium text-gray-400">VAT</th>
                      <th className="py-3 px-4 text-right font-medium">Net Sales</th>
                      <th className="py-3 px-4 text-right font-medium text-blue-700">Dự báo (Forecast)</th>
                      <th className="py-3 px-4 text-right font-medium text-orange-700">Giờ làm</th>
                      <th className="py-3 px-4 text-right font-medium">% Target</th>
                      <th className="py-3 px-4 text-center font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {salesLoading ? (
                      <tr><td colSpan={8} className="py-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                    ) : sales.map((row) => {
                      const isEditing = editingId === row.id;
                      return (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">{formatDate(row.sales_date)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(row.basic_sales)}</td>
                          <td className="py-3 px-4 text-right text-gray-400">{formatCurrency(row.vat)}</td>
                          <td className="py-3 px-4 text-right font-semibold text-green-700">{formatCurrency(row.net_sales)}</td>
                          <td className="py-3 px-4 text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                className="w-28 text-right ml-auto h-8 border-blue-300"
                                value={editForm.forecast}
                                onChange={(e) => setEditForm({ ...editForm, forecast: e.target.value })}
                              />
                            ) : (
                              <span className="font-medium">{formatCurrency(row.forecast) || "—"}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" onClick={() => handleAutoFill(row.sales_date)}>
                                  <Wand2 className="w-3.5 h-3.5" />
                                </Button>
                                <Input
                                  type="number"
                                  className="w-16 text-right h-8 border-orange-300"
                                  value={editForm.total_hours}
                                  onChange={(e) => setEditForm({ ...editForm, total_hours: e.target.value })}
                                />
                              </div>
                            ) : (
                              <span className="text-orange-700">{row.total_hours || "0"} h</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {row.store_target_percent ? (
                              <Badge variant={row.store_target_percent >= 100 ? "success" : "secondary"}>
                                {row.store_target_percent.toFixed(1)}%
                              </Badge>
                            ) : "—"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isEditing ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1">
                                  <Button size="icon" className="h-8 w-8 bg-green-600" onClick={() => handleSave(row)} disabled={updating}><Save className="w-4 h-4" /></Button>
                                  <Button size="icon" variant="outline" className="h-8 w-8 text-red-600" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                                </div>
                                <Input
                                  type="number"
                                  placeholder="Chi phí NB..."
                                  className="w-28 h-7 text-[10px]"
                                  value={editForm.labor_cost}
                                  onChange={(e) => setEditForm({ ...editForm, labor_cost: e.target.value })}
                                />
                              </div>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => startEdit(row)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}