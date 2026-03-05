
import { useState } from "react"
import { 
  FileText, 
  Search, 
  Download, 
  Eye,
  File,
  FolderOpen,
  Calendar,
  User,
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Mock documents data
const mockDocuments = [
  { 
    id: 1, 
    name: "Hợp đồng lao động - Nguyễn Văn A", 
    type: "contract", 
    category: "Hợp đồng",
    employee: "Nguyễn Văn A",
    created_at: "2024-01-01",
    status: "active"
  },
  { 
    id: 2, 
    name: "Hợp đồng lao động - Trần Thị B", 
    type: "contract", 
    category: "Hợp đồng",
    employee: "Trần Thị B",
    created_at: "2024-01-05",
    status: "active"
  },
  { 
    id: 3, 
    name: "Bảng chấm công tháng 01/2024", 
    type: "timesheet", 
    category: "Chấm công",
    employee: "Tất cả",
    created_at: "2024-01-31",
    status: "active"
  },
  { 
    id: 4, 
    name: "Bảng lương tháng 01/2024", 
    type: "salary", 
    category: "Lương",
    employee: "Tất cả",
    created_at: "2024-01-31",
    status: "active"
  },
  { 
    id: 5, 
    name: "Đơn xin nghỉ phép - Lê Văn C", 
    type: "leave", 
    category: "Nghỉ phép",
    employee: "Lê Văn C",
    created_at: "2024-01-10",
    status: "pending"
  },
  { 
    id: 6, 
    name: "Biên bản kiểm kho - Tháng 01/2024", 
    type: "inventory", 
    category: "Kho",
    employee: "Admin",
    created_at: "2024-01-15",
    status: "active"
  },
  { 
    id: 7, 
    name: "Hóa đơn nhập hàng - Tháng 01/2024", 
    type: "invoice", 
    category: "Hóa đơn",
    employee: "Nhà cung cấp",
    created_at: "2024-01-20",
    status: "active"
  },
  { 
    id: 8, 
    name: "Quy định nội bộ v1.0", 
    type: "policy", 
    category: "Chính sách",
    employee: "Admin",
    created_at: "2023-12-01",
    status: "active"
  },
]

const categoryIcons = {
  "Hợp đồng": { icon: FileText, color: "bg-blue-50 text-blue-600" },
  "Chấm công": { icon: Calendar, color: "bg-purple-50 text-purple-600" },
  "Lương": { icon: FileText, color: "bg-green-50 text-green-600" },
  "Nghỉ phép": { icon: FileText, color: "bg-orange-50 text-orange-600" },
  "Kho": { icon: FolderOpen, color: "bg-yellow-50 text-yellow-600" },
  "Hóa đơn": { icon: File, color: "bg-red-50 text-red-600" },
  "Chính sách": { icon: FileText, color: "bg-gray-50 text-gray-600" },
}

const DocumentsDashboard = () => {
  const [documents, setDocuments] = useState(mockDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  const categories = ["all", "Hợp đồng", "Chấm công", "Lương", "Nghỉ phép", "Kho", "Hóa đơn", "Chính sách"]

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.employee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const handleExport = (doc) => {
    // Mock export functionality
    alert(`Đang tải: ${doc.name}`)
  }

  const stats = [
    { label: "Tổng tài liệu", value: documents.length, color: "text-[#0077b6]" },
    { label: "Hợp đồng", value: documents.filter(d => d.category === "Hợp đồng").length, color: "text-blue-600" },
    { label: "Chấm công", value: documents.filter(d => d.category === "Chấm công").length, color: "text-purple-600" },
    { label: "Lương", value: documents.filter(d => d.category === "Lương").length, color: "text-green-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Hồ sơ</h2>
          <p className="text-gray-500">Quản lý tài liệu hồ sơ</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  index === 0 ? "bg-blue-50" :
                  index === 1 ? "bg-purple-50" :
                  index === 2 ? "bg-green-50" : "bg-gray-50"
                }`}>
                  <FileText className={stat.color} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Tìm kiếm tài liệu..."
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
                  <option key={cat} value={cat}>
                    {cat === "all" ? "Tất cả" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Danh sách tài liệu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredDocuments.map((doc) => {
              const categoryInfo = categoryIcons[doc.category] || { icon: FileText, color: "bg-gray-50 text-gray-600" }
              const Icon = categoryInfo.icon
              
              return (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryInfo.color}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{doc.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <User size={14} />
                          {doc.employee}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={
                      doc.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }>
                      {doc.status === "active" ? "Hiệu lực" : "Chờ duyệt"}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye size={16} className="text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleExport(doc)}
                      >
                        <Download size={16} className="text-gray-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DocumentsDashboard


