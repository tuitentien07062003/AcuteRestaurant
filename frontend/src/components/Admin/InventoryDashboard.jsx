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

// Các hàm lấy dữ liệu do Backend trả về qua bảng Stock (đã include Inventory)
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

  // Lấy storeId từ user đang đăng nhập, mặc định là 1 nếu chưa có
  const storeId = user?.store_id || 7062003;

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    setLoading(true)
    try {
      // Gọi đúng API lấy tồn kho theo cửa hàng
      const response = await stockApi.getStockByStore(storeId)
      const data = response?.data || response || []
      setInventory(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu kho:", error)
    } finally {
      setLoading(false)
    }
  }

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
    setUpdateForm({
      quantity: "",
      reason: "",
      note: ""
    })
    setIsUpdateModalOpen(true)
  }

  const handleUpdateStock = async () => {
    try {
      const payload = {
        quantity: Number(updateForm.quantity),
        type: updateForm.reason === 'NHAP_THEM' ? 'IN' : 'OUT',
        reason: updateForm.reason,
        note: updateForm.note,
        updated_by: user?.id
      }
      
      const itemId = selectedMaterial.item_id || selectedMaterial.id;
      
      // Sử dụng đúng API updateStock của stockApi
      await stockApi.updateStock(storeId, itemId, payload)
      
      setIsUpdateModalOpen(false)
      fetchInventoryData()
    } catch (error) {
      console.error("Lỗi cập nhật kho:", error)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý kho vật tư</h1>
          <p className="text-slate-500">Theo dõi số lượng và cập nhật trạng thái nguyên vật liệu</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="flex gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            disabled={filteredInventory.length === 0}
          >
            <FileSpreadsheet size={18} />
            Xuất báo cáo CSV
          </Button>
          <Button onClick={fetchInventoryData} variant="outline" size="icon">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng mặt hàng</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sắp hết hàng</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Đã hết hàng</p>
              <p className="text-2xl font-bold text-rose-600">{stats.outOfStockItems}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Tìm kiếm tên vật tư..." 
                className="pl-10 bg-slate-50 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px] bg-slate-50 border-none capitalize">
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
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-12 text-center">STT</TableHead>
                  <TableHead onClick={() => requestSort('name')} className="cursor-pointer group">
                    <div className="flex items-center gap-1">
                      Tên vật tư
                      <ArrowUpDown size={14} className="text-slate-300 group-hover:text-slate-600" />
                    </div>
                  </TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead onClick={() => requestSort('quantity')} className="text-right cursor-pointer group">
                    <div className="flex items-center justify-end gap-1">
                      Số lượng
                      <ArrowUpDown size={14} className="text-slate-300 group-hover:text-slate-600" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Đơn vị</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Cập nhật cuối</TableHead>
                  <TableHead className="w-20 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8} className="h-16 animate-pulse bg-slate-50/50" />
                    </TableRow>
                  ))
                ) : filteredInventory.length > 0 ? (
                  filteredInventory.map((item, index) => {
                    const currentStock = getStockValue(item)
                    const minStock = getItemMinStock(item)
                    const itemName = getItemName(item)
                    const category = getItemCategory(item)
                    const unit = getItemUnit(item)
                    const isLow = currentStock <= minStock && currentStock > 0
                    const isOut = currentStock <= 0
                    
                    return (
                      <TableRow key={item.item_id || item.id || index} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-center text-slate-500 font-medium">{index + 1}</TableCell>
                        <TableCell className="font-semibold text-slate-700">{itemName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 capitalize">
                            {category}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-bold ${isOut ? 'text-rose-600' : isLow ? 'text-orange-600' : 'text-slate-900'}`}>
                          {currentStock}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">{unit}</TableCell>
                        <TableCell className="text-center">
                          {isOut ? (
                            <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100">Hết hàng</Badge>
                          ) : isLow ? (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">Sắp hết</Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Đủ hàng</Badge>
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
                            size="icon" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleOpenUpdate(item)}
                          >
                            <Plus size={18} />
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

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="text-blue-600" />
              Cập nhật kho: {selectedMaterial ? getItemName(selectedMaterial) : ""}
            </DialogTitle>
            <DialogDescription>
              Thay đổi số lượng tồn kho thủ công. Lưu ý chọn đúng lý do cập nhật.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Số lượng</label>
              <div className="col-span-3 flex items-center gap-2">
                <Input 
                  type="number" 
                  value={updateForm.quantity}
                  onChange={(e) => setUpdateForm({...updateForm, quantity: e.target.value})}
                  className="bg-slate-50"
                  placeholder="Nhập con số..."
                />
                <span className="text-sm text-slate-500 font-medium w-16">
                  {selectedMaterial ? getItemUnit(selectedMaterial) : ""}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Lý do</label>
              <Select 
                value={updateForm.reason} 
                onValueChange={(val) => setUpdateForm({...updateForm, reason: val})}
              >
                <SelectTrigger className="col-span-3 bg-slate-50">
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

            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium mt-2">Ghi chú</label>
              <textarea 
                className="col-span-3 min-h-[80px] p-2 text-sm bg-slate-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nhập chi tiết nếu cần..."
                value={updateForm.note}
                onChange={(e) => setUpdateForm({...updateForm, note: e.target.value})}
              />
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
              disabled={!updateForm.reason || !updateForm.quantity} 
              className={`text-white transition-colors ${
                updateForm.reason === 'HUY_HANG' ? 'bg-rose-600 hover:bg-rose-700' : 
                updateForm.reason === 'NHAP_THEM' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                'bg-slate-900 hover:bg-slate-800'
              }`}
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