import { useState, useEffect, useContext } from "react"
import { 
  Search,
  Filter,
  RefreshCw,
  ClipboardList,
  Download
} from "lucide-react"
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
  const { user } = useContext(GlobalContext)
  const storeId = 7062003

  const [inventory, setInventory] = useState([])
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingStock, setLoadingStock] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  // Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateForm, setUpdateForm] = useState({ quantity: 0, reason: "" })

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    if (storeId) {
      loadStock()
    }
  }, [storeId])

  const loadInventory = async () => {
    setLoading(true)
    try {
      const response = await inventoryApi.getAll()
      const data = Array.isArray(response) ? response : (response?.data || [])
      setInventory(data)
    } catch (error) {
      console.error("Error loading inventory:", error)
      setInventory([]) 
    } finally {
      setLoading(false)
    }
  }

  const loadStock = async () => {
    setLoadingStock(true)
    try {
      const response = await stockApi.getStockByStore(storeId)
      const data = Array.isArray(response) ? response : (response?.data || [])
      setStock(data)
    } catch (error) {
      console.error("Error loading stock:", error)
      setStock([])
    } finally {
      setLoadingStock(false)
    }
  }

  const handleOpenUpdateModal = (item) => {
    setSelectedItem(item)
    setUpdateForm({ quantity: item.quantity, reason: "" })
    setIsUpdateModalOpen(true)
  }

  const submitStockUpdate = async () => {
    if (!updateForm.reason.trim()) {
      alert("Vui lòng nhập lý do thay đổi để lưu lịch sử.")
      return
    }

    try {
      await stockApi.updateStock(storeId, selectedItem.item_id, { 
        quantity: parseInt(updateForm.quantity),
        reason: updateForm.reason 
      })
      alert(`Đã cập nhật thành công!`)
      setIsUpdateModalOpen(false)
      loadStock() 
    } catch (error) {
      console.error('Update stock error:', error)
      alert('Cập nhật thất bại. Vui lòng thử lại.')
    }
  }

  const categories = ["all", "FOOD", "DRINK", "CONDIMENT", "PACKAGING", "CHEMICAL", "OTHERS"]
  const categoryLabels = {
    all: "Tất cả", FOOD: "Thực phẩm", DRINK: "Đồ uống", CONDIMENT: "Gia vị", 
    PACKAGING: "Bao bì", CHEMICAL: "Hóa chất", OTHERS: "Khác"
  }
  
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { label: "Hết hàng", color: "bg-red-100 text-red-700 border-red-200" }
    if (quantity <= minStock) return { label: "Sắp hết", color: "bg-orange-100 text-orange-700 border-orange-200" }
    return { label: "Ổn định", color: "bg-green-100 text-green-700 border-green-200" }
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#0077b6] tracking-tight">Quản lý Kho</h2>
          <p className="text-slate-500 mt-1">Cửa hàng ID: {storeId} | Nhân viên: {user?.full_name || 'Admin'}</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#0077b6] hover:bg-[#006699]">
            <Download size={18} className="mr-2" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl mb-6">
          <TabsTrigger value="stock">Tồn kho Thực tế</TabsTrigger>
          <TabsTrigger value="inventory">Danh mục Vật tư</TabsTrigger>
          <TabsTrigger value="logs" disabled>Lịch sử (Sắp ra mắt)</TabsTrigger>
        </TabsList>

        {/* TAB: TỒN KHO THỰC TẾ (STOCK) */}
        <TabsContent value="stock">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-white border-b pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="text-[#0077b6]" size={20}/>
                  Kiểm kê & Điều chỉnh
                </CardTitle>
                <Button onClick={loadStock} variant="outline" size="sm">
                  <RefreshCw size={14} className="mr-2" /> Làm mới dữ liệu
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingStock ? (
                <p className="text-center text-slate-500 py-12">Đang tải...</p>
              ) : stock.length === 0 ? (
                <p className="text-center text-slate-500 py-12">Chưa có dữ liệu tồn kho tại cơ sở này.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[80px]">Mã VT</TableHead>
                        <TableHead>Tên mặt hàng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Số lượng</TableHead>
                        <TableHead>Người cập nhật</TableHead>
                        <TableHead>Cập nhật lúc</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stock.map((item) => {
                        const status = getStockStatus(item.quantity, item.Inventory?.min_stock || 0)
                        return (
                          <TableRow key={item.item_id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-500">#{item.item_id}</TableCell>
                            <TableCell className="font-semibold text-slate-800">
                              {item.Inventory?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${status.color} font-medium`}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-lg font-bold text-slate-700">
                              {item.quantity} <span className="text-sm font-normal text-slate-400">{item.Inventory?.unit}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-slate-700">{item.updatedBy?.full_name || 'Hệ thống'}</span>
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {item.updated_at ? new Date(item.updated_at).toLocaleString('vi-VN') : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                onClick={() => handleOpenUpdateModal(item)}
                              >
                                Kiểm kê
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: DANH MỤC GỐC (INVENTORY) */}
        <TabsContent value="inventory">
          <Card>
             <CardHeader>
               <CardTitle>Danh mục Vật tư (Master Data)</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex flex-wrap gap-4 mb-4 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Tìm tên vật tư..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-500" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{categoryLabels[cat] || cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên Vật Tư</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Tồn tối thiểu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell><Badge variant="secondary">{categoryLabels[item.category] || item.category}</Badge></TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.min_stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL CẬP NHẬT KHO */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Điều chỉnh Tồn kho</DialogTitle>
            <DialogDescription>
              Cập nhật số lượng thực tế cho <b>{selectedItem?.Inventory?.name}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Số lượng mới</label>
              <Input 
                type="number" 
                value={updateForm.quantity} 
                onChange={(e) => setUpdateForm({...updateForm, quantity: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Lý do <span className="text-red-500">*</span></label>
              <select 
                value={updateForm.reason}
                onChange={(e) => setUpdateForm({...updateForm, reason: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="" disabled>-- Chọn lý do --</option>
                <option value="KIEM_KE_DINH_KY">Kiểm kê thực tế</option>
                <option value="HANG_HONG_HUY">Hủy hàng do hỏng/hết hạn</option>
                <option value="NHAP_HANG_LE">Nhập thêm hàng ngoài hệ thống</option>
                <option value="XUAT_SU_DUNG">Xuất sử dụng nội bộ</option>
                <option value="DIEU_CHINH_SAI_LECH">Chênh lệch hệ thống</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Hủy</Button>
            <Button className="bg-[#0077b6]" onClick={submitStockUpdate}>Lưu & Ghi Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InventoryDashboard