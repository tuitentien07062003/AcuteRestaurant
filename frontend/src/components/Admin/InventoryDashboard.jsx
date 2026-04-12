import { useState, useEffect, useContext } from "react"
import { 
  Search,
  Filter,
  RefreshCw,
  ClipboardList,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus
} from "lucide-react"
import {
  Pagination, 
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import inventoryApi from "@/api/inventoryApi"
import stockApi from "@/api/stockApi"
import { GlobalContext } from "@/context/GlobalContext" 

const InventoryDashboard = () => {
  const { user } = useContext(GlobalContext);
  const storeId = 7062003;

  // --- STATES ---
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({ storeId: null, itemId: null });
  const [updateForm, setUpdateForm] = useState({
    quantity: 0,
    reason: ""
  });

  // --- FETCH DATA ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await stockApi.getStockByStore(storeId);
      setStocks(response.data || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu kho:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- HANDLERS ---
  const openUpdateModal = (storeId, itemId, currentQty) => {
    setSelectedItem({ storeId, itemId });
    setUpdateForm({ quantity: currentQty, reason: "" });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStock = async () => {
    try {
      // CHỈ gửi quantity xuống Backend (Giữ sạch Database)
      const payload = {
        quantity: Number(updateForm.quantity)
      };

      await stockApi.updateStock(selectedItem.storeId, selectedItem.itemId, payload);
      
      setIsUpdateModalOpen(false);
      loadData(); // Refresh lại bảng sau khi update thành công
    } catch (error) {
      console.error("Lỗi cập nhật kho:", error);
      alert("Cập nhật thất bại. Vui lòng kiểm tra lại!");
    }
  };

  // --- RENDER HELPERS ---
  const filteredStocks = stocks.filter(item => {
    const itemName = item.Inventory?.name?.toLowerCase() || "";
    return itemName.includes(searchTerm.toLowerCase());
  });

  const getStockStatus = (qty, minStock) => {
    if (qty === 0) return <Badge variant="destructive">Hết hàng</Badge>;
    if (qty <= (minStock || 0)) return <Badge className="bg-orange-500 text-white">Sắp hết</Badge>;
    return <Badge className="bg-emerald-500 text-white">Ổn định</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tồn Kho Thực Tế</h2>
          <p className="text-slate-500">Quản lý và kiểm kê số lượng vật tư tại cửa hàng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button className="bg-slate-900 text-white">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách vật tư</CardTitle>
            <div className="flex gap-2 w-[300px]">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Tìm tên vật tư..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên mặt hàng</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Tồn kho</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead>Người cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((item) => (
                    <TableRow key={item.item_id}>
                      <TableCell className="font-medium text-slate-500">#{item.item_id}</TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {/* LƯU Ý: Đã sửa thành inventory (chữ i thường) */}
                        {item.Inventory?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {item.Inventory?.category || 'Chưa phân loại'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {item.quantity} <span className="text-sm font-normal text-slate-400">{item.Inventory?.unit}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStockStatus(item.quantity, item.Inventory?.min_stock)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {item.updatedBy?.full_name || 'Hệ thống'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openUpdateModal(storeId, item.item_id, item.quantity)}
                        >
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Kiểm kê
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Không tìm thấy vật tư nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- MODAL CẬP NHẬT (KIỂM KÊ) --- */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cập nhật số lượng kho</DialogTitle>
            <DialogDescription>
              Điều chỉnh số lượng thực tế trong kho. Vui lòng chọn thao tác để hệ thống lưu vết (Giao diện).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Số lượng mới <span className="text-red-500">*</span>
              </label>
              <Input 
                type="number"
                min="0"
                value={updateForm.quantity}
                onChange={(e) => setUpdateForm({...updateForm, quantity: e.target.value})}
                className="col-span-3 text-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4 mt-2">
              <label className="text-right text-sm font-medium mt-2">Thao tác</label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                {[
                  { id: 'KIEM_KE', label: 'Kiểm kê thực tế', color: 'border-blue-200 hover:border-blue-500 hover:bg-blue-50', icon: '📝' },
                  { id: 'NHAP_THEM', label: 'Nhập (Ngoài HT)', color: 'border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50', icon: '📦' },
                  { id: 'HUY_HANG', label: 'Hủy/Hỏng/Hết hạn', color: 'border-rose-200 hover:border-rose-500 hover:bg-rose-50', icon: '🗑️' },
                  { id: 'XUAT_DUNG', label: 'Xuất dùng nội bộ', color: 'border-orange-200 hover:border-orange-500 hover:bg-orange-50', icon: '🛠️' },
                ].map((action) => (
                  <div
                    key={action.id}
                    onClick={() => setUpdateForm({ ...updateForm, reason: action.id })}
                    className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-all ${
                      updateForm.reason === action.id 
                        ? action.color.replace('hover:', '').replace('border-', 'border-2 border-') 
                        : 'border-slate-200 bg-white opacity-70'
                    }`}
                  >
                    <span>{action.icon}</span>
                    <span className="text-xs font-medium text-slate-700">{action.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {updateForm.reason === 'HUY_HANG' && (
              <p className="text-xs text-rose-500 col-start-2 col-span-3 ml-[25%] mt-1 italic">
                *Lưu ý: Thao tác này sẽ làm giảm trừ số lượng vật tư do hỏng hóc hoặc hết hạn.
              </p>
            )}
            {updateForm.reason === 'NHAP_THEM' && (
              <p className="text-xs text-emerald-600 col-start-2 col-span-3 ml-[25%] mt-1 italic">
                *Lưu ý: Chỉ dùng khi nhập hàng ngoài hệ thống (không qua phiếu nhập).
              </p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Hủy bỏ</Button>
            <Button 
              onClick={handleUpdateStock}
              disabled={!updateForm.reason} 
              className={`text-white transition-colors ${
                updateForm.reason === 'HUY_HANG' ? 'bg-rose-600 hover:bg-rose-700' : 
                updateForm.reason === 'NHAP_THEM' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {updateForm.reason === 'HUY_HANG' ? 'Xác nhận Hủy' : 
               updateForm.reason === 'NHAP_THEM' ? 'Xác nhận Nhập' : 
               'Cập nhật số lượng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InventoryDashboard