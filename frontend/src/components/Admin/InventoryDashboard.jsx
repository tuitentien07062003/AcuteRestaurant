import { useState, useEffect, useContext, useMemo } from "react"
import { 
  Search,
  Filter,
  RefreshCw,
  ClipboardList,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import inventoryApi from "@/api/inventoryApi"
import stockApi from "@/api/stockApi"
import { GlobalContext } from "@/context/GlobalContext" 

const InventoryDashboard = () => {
  const { user } = useContext(GlobalContext);
  const storeId = 7062003;

  // --- STATES ---
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // States: Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  // States: Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // States: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
      const payload = {
        quantity: Number(updateForm.quantity)
      };

      await stockApi.updateStock(selectedItem.storeId, selectedItem.itemId, payload);
      
      setIsUpdateModalOpen(false);
      loadData(); 
    } catch (error) {
      console.error("Lỗi cập nhật kho:", error);
      alert("Cập nhật thất bại. Vui lòng kiểm tra lại!");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- DATA PROCESSING (Lọc, Sắp xếp, Phân trang) ---
  const processedData = useMemo(() => {
    // 1. Filter
    let filtered = stocks.filter(item => {
      const matchName = item.Inventory?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchStatus = true;
      const minStock = item.Inventory?.min_stock || 0;
      if (filterStatus === "OUT_OF_STOCK") matchStatus = item.quantity === 0;
      if (filterStatus === "LOW_STOCK") matchStatus = item.quantity > 0 && item.quantity <= minStock;
      if (filterStatus === "NORMAL") matchStatus = item.quantity > minStock;

      return matchName && matchStatus;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      if (sortConfig.key === 'name') {
        const nameA = a.Inventory?.name || '';
        const nameB = b.Inventory?.name || '';
        return nameA.localeCompare(nameB) * (sortConfig.direction === 'asc' ? 1 : -1);
      }
      if (sortConfig.key === 'quantity') {
        return (a.quantity - b.quantity) * (sortConfig.direction === 'asc' ? 1 : -1);
      }
      return 0;
    });

    return filtered;
  }, [stocks, searchTerm, filterStatus, sortConfig]);

  // 3. Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedStocks = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- RENDER HELPERS ---
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const getStockStatus = (qty, minStock) => {
    if (qty === 0) return <Badge variant="destructive">Hết hàng</Badge>;
    if (qty <= (minStock || 0)) return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Sắp hết</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Ổn định</Badge>;
  };

  // Render thanh trạng thái mini
  const renderProgressBar = (qty, minStock) => {
    if (qty === 0) return null;
    const safeStock = minStock > 0 ? minStock * 2 : 50; // Giả định mức tồn kho an toàn để vẽ bar
    const percentage = Math.min((qty / safeStock) * 100, 100);
    const colorClass = qty <= minStock ? 'bg-orange-500' : 'bg-emerald-500';
    
    return (
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
        <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tồn Kho Thực Tế</h2>
          <p className="text-slate-500">Quản lý và kiểm kê số lượng vật tư tại cửa hàng</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={loadData} disabled={isLoading} className="flex-1 sm:flex-none">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button className="bg-[#0077b6] hover:bg-[#006699]">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Danh sách vật tư ({processedData.length})</CardTitle>
            
            {/* Bộ lọc nâng cao */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-[250px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Tìm tên vật tư..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset page khi tìm kiếm
                  }}
                />
              </div>
              <Select 
                value={filterStatus} 
                onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Lọc trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="NORMAL">Ổn định</SelectItem>
                  <SelectItem value="LOW_STOCK">Sắp hết</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* MOBILE VIEW (CARD LIST) */}
          <div className="block md:hidden">
            {paginatedStocks.length > 0 ? (
              <div className="flex flex-col gap-3 p-4">
                {paginatedStocks.map((item) => (
                  <div key={item.item_id} className={`p-4 rounded-xl border ${item.quantity === 0 ? 'bg-red-50/50 border-red-100' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">#{item.item_id}</span>
                        <h4 className="font-semibold text-slate-800 leading-tight mt-1">{item.Inventory?.name || 'N/A'}</h4>
                      </div>
                      {getStockStatus(item.quantity, item.Inventory?.min_stock)}
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Tồn kho hiện tại</p>
                        <p className="text-xl font-bold">
                          {item.quantity} <span className="text-sm font-normal text-slate-500">{item.Inventory?.unit}</span>
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        variant={item.quantity === 0 ? "destructive" : "secondary"}
                        onClick={() => openUpdateModal(storeId, item.item_id, item.quantity)}
                      >
                        <ClipboardList className="w-4 h-4 mr-1" /> Cập nhật
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">Không tìm thấy vật tư nào.</div>
            )}
          </div>

          {/* DESKTOP VIEW (TABLE) */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[100px]">Mã</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">Tên mặt hàng {getSortIcon('name')}</div>
                  </TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-end">Tồn kho {getSortIcon('quantity')}</div>
                  </TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead>Cập nhật lần cuối</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStocks.length > 0 ? (
                  paginatedStocks.map((item) => (
                    <TableRow 
                      key={item.item_id} 
                      className={item.quantity === 0 ? "bg-red-50/40 hover:bg-red-50/60" : ""}
                    >
                      <TableCell className="font-medium text-slate-500">#{item.item_id}</TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {item.Inventory?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-white">
                          {item.Inventory?.category || 'Chưa phân loại'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-lg">
                            {item.quantity} <span className="text-sm font-normal text-slate-400">{item.Inventory?.unit}</span>
                          </span>
                          {renderProgressBar(item.quantity, item.Inventory?.min_stock)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStockStatus(item.quantity, item.Inventory?.min_stock)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.updatedBy?.full_name || 'Hệ thống'}</span>
                          <span className="text-xs text-slate-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1"/> Gần đây
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant={item.quantity === 0 ? "destructive" : "ghost"}
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
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 text-slate-300 mb-2" />
                        <p>Không tìm thấy vật tư nào phù hợp với bộ lọc.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-center bg-white rounded-b-xl">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Render page numbers (Simplified for demo) */}
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- MODAL CẬP NHẬT (KIỂM KÊ) --- */}
      {/* Giữ nguyên như bản gốc của bạn */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cập nhật số lượng kho</DialogTitle>
            <DialogDescription>
              Điều chỉnh số lượng thực tế trong kho. Vui lòng chọn thao tác để hệ thống lưu vết.
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