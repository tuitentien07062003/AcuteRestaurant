
import { useState, useEffect } from "react"
import { 
  Package, 
  AlertTriangle, 
  Download, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet
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
import { fetchMenu } from "@/api/menu"

// Mock inventory data
const mockInventory = [
  { id: 1, name: "Burger Bò", category: "burger", quantity: 50, unit: "phần", min_stock: 20, price: 45000 },
  { id: 2, name: "Hotdog", category: "burger", quantity: 30, unit: "phần", min_stock: 15, price: 35000 },
  { id: 3, name: "Gà Rán", category: "chicken", quantity: 8, unit: "phần", min_stock: 10, price: 55000 },
  { id: 4, name: "Mì Ý", category: "spagetti", quantity: 25, unit: "phần", min_stock: 10, price: 40000 },
  { id: 5, name: "Combo 1 Người", category: "combo", quantity: 15, unit: "phần", min_stock: 5, price: 89000 },
  { id: 6, name: "Pepsi", category: "drink", quantity: 100, unit: "lon", min_stock: 30, price: 15000 },
  { id: 7, name: "Nước suối", category: "drink", quantity: 5, unit: "chai", min_stock: 20, price: 10000 },
  { id: 8, name: "Kem Dâu", category: "dessert", quantity: 12, unit: "cup", min_stock: 5, price: 25000 },
]

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    setLoading(true)
    try {
      const data = await fetchMenu()
      // Map menu items to inventory format
      if (data && Array.isArray(data)) {
        const mapped = data.map((item, index) => ({
          id: item.id || index,
          name: item.name,
          category: item.category_code,
          quantity: Math.floor(Math.random() * 50) + 10, // Mock quantity
          unit: "phần",
          min_stock: 10,
          price: item.price
        }))
        setInventory(mapped)
      } else {
        setInventory(mockInventory)
      }
    } catch (error) {
      console.error("Error loading inventory:", error)
      setInventory(mockInventory)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["all", "burger", "chicken", "spagetti", "combo", "drink", "dessert"]
  const categoryLabels = {
    all: "Tất cả",
    burger: "Burger",
    chicken: "Gà",
    spagetti: "Mì Ý",
    combo: "Combo",
    drink: "Đồ uống",
    dessert: "Tráng miệng"
  }

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Get low stock items
  const lowStockItems = inventory.filter(item => item.quantity <= item.min_stock)

  const getStockStatus = (item) => {
    if (item.quantity <= item.min_stock * 0.5) return { label: "Hết hàng", color: "bg-red-100 text-red-700" }
    if (item.quantity <= item.min_stock) return { label: "Sắp hết", color: "bg-orange-100 text-orange-700" }
    return { label: "Còn hàng", color: "bg-green-100 text-green-700" }
  }

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ"
  }

  const handleExport = () => {
    const headers = ["STT", "Tên món", "Danh mục", "Số lượng", "Đơn vị", "Tồn kho tối thiểu", "Giá"]
    const rows = filteredInventory.map((item, index) => [
      index + 1,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.min_stock,
      item.price
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `KiemKeKho_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleRequestImport = () => {
    // Get low stock items
    const lowStockList = lowStockItems.map(item => `- ${item.name}: ${item.quantity} ${item.unit}`)
    const message = "Yêu cầu nhập hàng:\n\n" + lowStockList.join("\n")
    alert(message)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Kiểm kho</h2>
          <p className="text-gray-500">Quản lý hàng tồn kho</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleRequestImport}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus size={18} className="mr-2" />
            Yêu cầu nhập hàng
          </Button>
          <Button 
            onClick={handleExport}
            className="bg-[#0077b6] hover:bg-[#006699]"
          >
            <Download size={18} className="mr-2" />
            Xuất file
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng món</p>
                <p className="text-2xl font-bold text-[#0077b6]">{inventory.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="text-[#0077b6]" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng giá trị</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(inventory.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Tìm kiếm món..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                ))}
              </select>
            </div>

            <Button variant="outline" onClick={loadInventory}>
              <RefreshCw size={18} className="mr-2" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Danh sách hàng tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>STT</TableHead>
                <TableHead>Tên món</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item, index) => {
                const status = getStockStatus(item)
                return (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryLabels[item.category] || item.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default InventoryDashboard


