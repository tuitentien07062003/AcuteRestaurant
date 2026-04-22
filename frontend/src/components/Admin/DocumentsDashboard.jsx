
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
    category: "Hợp đồng lao động",
    employee: "Nguyễn Văn A",
    created_at: "2024-01-01",
    status: "active"
  },
  {
    id: 2,
    name: "Cam kết thuế - Cửa hàng 01",
    type: "tax",
    category: "Cam kết thuế",
    employee: "Cửa hàng 01",
    created_at: "2024-02-10",
    status: "active"
  },
  {
    id: 3,
    name: "Giấy tờ liên quan - Hồ sơ nhân sự",
    type: "related",
    category: "Giấy tờ liên quan",
    employee: "Phòng Nhân sự",
    created_at: "2024-03-05",
    status: "active"
  },
  {
    id: 4,
    name: "Cam kết bảo mật - Nhân viên Bán hàng",
    type: "confidential",
    category: "Cam kết bảo mật",
    employee: "Bảo mật nội bộ",
    created_at: "2024-03-22",
    status: "active"
  },
  {
    id: 5,
    name: "Hợp đồng lao động - Trần Thị B",
    type: "contract",
    category: "Hợp đồng lao động",
    employee: "Trần Thị B",
    created_at: "2024-04-01",
    status: "active"
  },
]

const categoryIcons = {
  "Hợp đồng lao động": { icon: FileText, color: "bg-blue-50 text-blue-600" },
  "Cam kết thuế": { icon: FileText, color: "bg-indigo-50 text-indigo-600" },
  "Giấy tờ liên quan": { icon: FolderOpen, color: "bg-yellow-50 text-yellow-600" },
  "Cam kết bảo mật": { icon: FileText, color: "bg-red-50 text-red-600" },
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
  const [newDocName, setNewDocName] = useState("")
  const [newDocEmployee, setNewDocEmployee] = useState("")
  const [newDocCategory, setNewDocCategory] = useState("Hợp đồng lao động")

  const categories = [
    "all",
    "Hợp đồng lao động",
    "Cam kết thuế",
    "Giấy tờ liên quan",
    "Cam kết bảo mật",
    "Chấm công",
    "Lương",
    "Nghỉ phép",
    "Kho",
    "Hóa đơn",
    "Chính sách"
  ]

  const getDocumentImageUrl = (category, id) => {
    const label = encodeURIComponent(category || "Hồ sơ")
    return `https://placehold.co/600x400/eff6ff/1d4ed8?text=${label}&font=roboto`
  }

  const handleAddDocument = () => {
    if (!newDocName.trim() || !newDocEmployee.trim()) {
      alert('Vui lòng nhập tên tài liệu và người liên quan')
      return
    }

    const nextId = documents.length ? Math.max(...documents.map(doc => doc.id)) + 1 : 1
    const newDocument = {
      id: nextId,
      name: newDocName,
      type: newDocCategory.toLowerCase().replace(/\s+/g, "_"),
      category: newDocCategory,
      employee: newDocEmployee,
      created_at: new Date().toISOString().split('T')[0],
      status: "active"
    }

    setDocuments([newDocument, ...documents])
    setNewDocName("")
    setNewDocEmployee("")
  }

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
    window.open(getDocumentImageUrl(doc.category, doc.id), '_blank')
  }

  const stats = [
    { label: "Tổng tài liệu", value: documents.length, color: "text-[#0077b6]" },
    { label: "Hợp đồng lao động", value: documents.filter(d => d.category === "Hợp đồng lao động").length, color: "text-blue-600" },
    { label: "Cam kết thuế", value: documents.filter(d => d.category === "Cam kết thuế").length, color: "text-indigo-600" },
    { label: "Cam kết bảo mật", value: documents.filter(d => d.category === "Cam kết bảo mật").length, color: "text-red-600" },
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

      {/* Create new document */}
      <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Thêm hồ sơ mới</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-2">Tên hồ sơ</label>
              <Input
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Ví dụ: Hợp đồng lao động - Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Nhân sự liên quan</label>
              <Input
                value={newDocEmployee}
                onChange={(e) => setNewDocEmployee(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Loại hồ sơ</label>
              <select
                value={newDocCategory}
                onChange={(e) => setNewDocCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {categories.filter(cat => cat !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={handleAddDocument} className="bg-[#0077b6] hover:bg-[#006494] gap-2">
            <FileText size={16} /> Thêm hồ sơ
          </Button>
        </CardContent>
      </Card>

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
                  className="grid md:grid-cols-[280px_minmax(0,1fr)] gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow bg-white"
                >
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <img
                      src={getDocumentImageUrl(doc.category, doc.id)}
                      alt={doc.name}
                      className="w-full h-40 object-cover"
                    />
                  </div>

                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryInfo.color}`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{doc.category}</p>
                          <h3 className="font-semibold text-gray-900 text-lg">{doc.name}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>{doc.employee}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{formatDate(doc.created_at)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Trạng thái:</span>
                            <Badge className={
                              doc.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }>
                              {doc.status === "active" ? "Hiệu lực" : "Chờ duyệt"}
                            </Badge>
                          </div>
                          <div className="text-slate-500">
                            Mã tài liệu: <span className="font-medium">#{doc.id.toString().padStart(3, '0')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 gap-2"
                        onClick={() => window.open(getDocumentImageUrl(doc.category, doc.id), '_blank')}
                      >
                        <Eye size={16} /> Xem hình ảnh
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 gap-2"
                        onClick={() => handleExport(doc)}
                      >
                        <Download size={16} /> Tải hình ảnh
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


