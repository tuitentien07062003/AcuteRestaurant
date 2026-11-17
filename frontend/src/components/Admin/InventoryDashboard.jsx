import { useState, useEffect, useContext, useMemo } from "react"
import { 
  Search,
  RefreshCw,
  ClipboardList,
  Plus,
  ArrowUpDown,
  Clock,
  FileSpreadsheet,
  AlertTriangle,
  Package,
  TrendingDown
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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

import stockApi from "@/api/stockApi"
import { GlobalContext } from "@/context/GlobalContext"

// Các hàm lấy dữ liệu
const getStockValue = (item) => Number(item?.quantity || 0);
const getItemName = (item) => item?.inventory?.name || item?.Inventory?.name || item?.name || "Chưa có tên";
const getItemCategory = (item) => item?.inventory?.category || item?.Inventory?.category || item?.category || "Chưa phân loại";
const getItemUnit = (item) => item?.inventory?.unit || item?.Inventory?.unit || item?.unit || "-";
const getItemMinStock = (item) => Number(item?.inventory?.min_stock || item?.Inventory?.min_stock || item?.min_stock || 0);

const InventoryDashboard = () => {
  const { user } = useContext(GlobalContext)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [updateForm, setUpdateForm] = useState({
    quantity: "",
    reason: "",
    note: ""
  })

  const storeId = user?.store_id || 7062003;

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    setLoading(true)
    try {
      const response = await stockApi.getStockByStore(storeId)
      const data = response?.data || response || []
      setInventory(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu kho:", error)
    } finally {
      setLoading(false)
    }
  }

  // HÀM XUẤT CSV ĐÃ ĐƯỢC KHÔI PHỤC
  const handleExportCSV = () => {
    if (filteredInventory.length === 0) return

    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const fileName = `inventory_${day}_${month}_${year}.csv`

    const headers = ["STT", "Tên vật tư", "Danh mục", "Số lượng hiện tại", "Đơn vị", "Mức tối thiểu", "Trạng thái", "Cập nhật cuối"]
    
    const rows = filteredInventory.map((item, index) => {
      const itemName = getItemName(item)
      const currentStock = getStockValue(item)
      const minStock = getItemMinStock(item)
      const category = getItemCategory(item)
      const unit = getItemUnit(item)
      const status = currentStock <= minStock ? "Sắp hết hàng" : "Bình thường"
      
      return [
        index + 1,
        itemName,
        category,
        currentStock,
        unit,
        minStock,
        status,
        new Date(item.updated_at || Date.now()).toLocaleString('vi-VN')
      ]
    })

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(value => `"${value}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
  }

  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => {
        const itemName = getItemName(item)
        const category = getItemCategory(item)
        const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === "all" || category === filterCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortConfig.key === 'quantity') {
           const valA = getStockValue(a)
           const valB = getStockValue(b)
           return sortConfig.direction === 'asc' ? valA - valB : valB - valA
        }
        const valA = getItemName(a)
        const valB = getItemName(b)
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
  }, [inventory, searchTerm, filterCategory, sortConfig])

  const categories = useMemo(() => {
    const cats = inventory.map(item => getItemCategory(item)).filter(cat => cat !== "Chưa phân loại")
    return ["all", ...new Set(cats)]
  }, [inventory])

  const stats = useMemo(() => {
    const totalItems = inventory.length
    const lowStockItems = inventory.filter(item => {
        const stock = getStockValue(item)
        return stock <= getItemMinStock(item) && stock > 0
    }).length
    const outOfStockItems = inventory.filter(item => {
        const stock = getStockValue(item)
        return stock <= 0
    }).length
    return { totalItems, lowStockItems, outOfStockItems }
  }, [inventory])

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleOpenUpdate = (material) => {
    setSelectedMaterial(material)
    setUpdateForm({ quantity: "", reason: "", note: "" })
    setIsUpdateModalOpen(true)
  }

  const handleUpdateStock = async () => {
    try {
      const payload = { quantity: Number(updateForm.quantity) }
      const itemId = selectedMaterial.item_id || selectedMaterial.id;
      await stockApi.updateStock(storeId, itemId, payload)
      setIsUpdateModalOpen(false)
      fetchInventoryData()
    } catch (error) {
      console.error("Lỗi cập nhật kho:", error)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý kho vật tư</h1>
          <p className="text-slate-500 mt-1">Theo dõi số lượng và cập nhật trạng thái nguyên vật liệu</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm"
            disabled={filteredInventory.length === 0}
          >
            <FileSpreadsheet size={18} className="mr-2 text-[#F97316]" /> Xuất CSV
          </Button>
          <Button onClick={fetchInventoryData} variant="outline" className="rounded-xl border-slate-200 shadow-sm">
            <RefreshCw size={18} className={loading ? "animate-spin text-[#F97316]" : "text-slate-500"} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Package size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng mặt hàng</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-[#F97316]"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sắp hết hàng</p>
              <p className="text-2xl font-bold text-[#F97316]">{stats.lowStockItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600"><TrendingDown size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Đã hết hàng</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Tìm kiếm tên vật tư..." 
                className="pl-10 bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200 rounded-xl font-medium">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat === "all" ? "Tất cả danh mục" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-12 text-center font-semibold text-slate-700">STT</TableHead>
                  <TableHead onClick={() => requestSort('name')} className="cursor-pointer group font-semibold text-slate-700">
                    <div className="flex items-center gap-1">Tên vật tư <ArrowUpDown size={14} className="text-slate-400" /></div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">Danh mục</TableHead>
                  <TableHead onClick={() => requestSort('quantity')} className="text-right cursor-pointer group font-semibold text-slate-700">
                    <div className="flex items-center justify-end gap-1">Số lượng <ArrowUpDown size={14} className="text-slate-400" /></div>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">Đơn vị</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">Trạng thái</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Cập nhật cuối</TableHead>
                  <TableHead className="w-24 text-center font-semibold text-slate-700">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={8} className="h-16 animate-pulse bg-slate-50/50" /></TableRow>
                  ))
                ) : filteredInventory.length > 0 ? (
                  filteredInventory.map((item, index) => {
                    const currentStock = getStockValue(item)
                    const minStock = getItemMinStock(item)
                    const isLow = currentStock <= minStock && currentStock > 0
                    const isOut = currentStock <= 0
                    
                    return (
                      <TableRow key={item.item_id || item.id || index} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="text-center text-slate-500 font-medium">{index + 1}</TableCell>
                        <TableCell className="font-semibold text-slate-800">{getItemName(item)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 capitalize">
                            {getItemCategory(item)}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-bold ${isOut ? 'text-red-600' : isLow ? 'text-[#F97316]' : 'text-slate-800'}`}>
                          {currentStock}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">{getItemUnit(item)}</TableCell>
                        <TableCell className="text-center">
                          {isOut ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Hết hàng</Badge>
                          ) : isLow ? (
                            <Badge className="bg-orange-100 text-[#F97316] border-orange-200 hover:bg-orange-100">Sắp hết</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Đủ hàng</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-slate-500 text-sm">
                          <div className="flex items-center justify-end gap-1">
                            <Clock size={12} />
                            {new Date(item.updated_at || Date.now()).toLocaleDateString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#F97316] hover:text-[#EA580C] hover:bg-orange-50 rounded-lg px-3 font-semibold"
                            onClick={() => handleOpenUpdate(item)}
                          >
                            Cập nhật
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center text-slate-400">
                      Không tìm thấy vật tư nào phù hợp
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG CẬP NHẬT KHO */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl bg-white border-slate-200">
          <DialogHeader className="items-center text-center pb-4 border-b border-slate-100">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <ClipboardList className="w-6 h-6 text-[#F97316]" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-800">Cập nhật kho</DialogTitle>
            <DialogDescription className="text-slate-500">
              Mặt hàng: <span className="font-bold text-[#F97316]">{selectedMaterial ? getItemName(selectedMaterial) : ""}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Số lượng tồn kho mới</label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number" 
                  value={updateForm.quantity}
                  onChange={(e) => setUpdateForm({...updateForm, quantity: e.target.value})}
                  className="bg-slate-50 border-slate-200 h-12 text-lg font-bold focus:ring-[#F97316]"
                  placeholder="Nhập số lượng..."
                />
                <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-3 rounded-lg">
                  {selectedMaterial ? getItemUnit(selectedMaterial) : ""}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Lý do cập nhật <span className="text-red-500">*</span></label>
              <Select 
                value={updateForm.reason} 
                onValueChange={(val) => setUpdateForm({...updateForm, reason: val})}
              >
                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-[#F97316]">
                  <SelectValue placeholder="Chọn lý do..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HUY_HANG">Hủy hàng (Hỏng/Hết hạn)</SelectItem>
                  <SelectItem value="NHAP_THEM">Nhập thêm ngoài hệ thống</SelectItem>
                  <SelectItem value="KIEM_KHO">Điều chỉnh sau kiểm kê</SelectItem>
                  <SelectItem value="TRA_HANG">Trả hàng nhà cung cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Ghi chú thêm</label>
              <textarea 
                className="w-full min-h-[80px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
                placeholder="Nhập chi tiết nếu cần..."
                value={updateForm.note}
                onChange={(e) => setUpdateForm({...updateForm, note: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setIsUpdateModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button 
              onClick={handleUpdateStock}
              disabled={!updateForm.reason || !updateForm.quantity} 
              className="rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-6 shadow-sm"
            >
              Xác nhận cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InventoryDashboard;