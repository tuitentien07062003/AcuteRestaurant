
import { useState } from "react"
import { 
  CreditCard, 
  Search, 
  Plus, 
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Send,
  User,
  Calendar,
  DollarSign,
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

// Mock payment requests data
const mockPaymentRequests = [
  { 
    id: 1, 
    title: "Thanh toán tiền điện tháng 01/2024",
    type: "utility",
    category: "Tiện ích",
    amount: 2500000,
    recipient: "Công ty Điện lực",
    status: "approved",
    request_date: "2024-01-15",
    approved_date: "2024-01-16",
    requester: "Admin"
  },
  { 
    id: 2, 
    title: "Thanh toán tiền nước tháng 01/2024",
    type: "utility",
    category: "Tiện ích",
    amount: 1200000,
    recipient: "Công ty Cấp nước",
    status: "pending",
    request_date: "2024-01-20",
    approved_date: null,
    requester: "Admin"
  },
  { 
    id: 3, 
    title: "Thanh toán tiền hàng nhập",
    type: "supplier",
    category: "Nhà cung cấp",
    amount: 15000000,
    recipient: "Công ty Thực phẩm ABC",
    status: "approved",
    request_date: "2024-01-10",
    approved_date: "2024-01-11",
    requester: "Admin"
  },
  { 
    id: 4, 
    title: "Thanh toán lương nhân viên tháng 01/2024",
    type: "salary",
    category: "Lương",
    amount: 45000000,
    recipient: "Nhân viên",
    status: "pending",
    request_date: "2024-01-31",
    approved_date: null,
    requester: "Admin"
  },
  { 
    id: 5, 
    title: "Thanh toán chi phí marketing",
    type: "marketing",
    category: "Marketing",
    amount: 5000000,
    recipient: "Công ty Quảng cáo XYZ",
    status: "rejected",
    request_date: "2024-01-18",
    approved_date: null,
    requester: "Admin"
  },
]

const categoryIcons = {
  "Tiện ích": { icon: DollarSign, color: "bg-blue-50 text-blue-600" },
  "Nhà cung cấp": { icon: User, color: "bg-purple-50 text-purple-600" },
  "Lương": { icon: CreditCard, color: "bg-green-50 text-green-600" },
  "Marketing": { icon: FileText, color: "bg-orange-50 text-orange-600" },
}

const statusConfig = {
  pending: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "Đã duyệt", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "Từ chối", color: "bg-red-100 text-red-700", icon: XCircle },
}

const PaymentRequestDashboard = () => {
  const [paymentRequests, setPaymentRequests] = useState(mockPaymentRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: "",
    category: "Tiện ích",
    amount: "",
    recipient: "",
    description: ""
  })

  // Filter payment requests
  const filteredRequests = paymentRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || req.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = [
    { 
      label: "Chờ duyệt", 
      value: paymentRequests.filter(r => r.status === "pending").length, 
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    { 
      label: "Đã duyệt", 
      value: paymentRequests.filter(r => r.status === "approved").length, 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      label: "Từ chối", 
      value: paymentRequests.filter(r => r.status === "rejected").length, 
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    { 
      label: "Tổng tiền", 
      value: paymentRequests.reduce((sum, r) => sum + r.amount, 0), 
      color: "text-[#0077b6]",
      bgColor: "bg-blue-50",
      isCurrency: true
    },
  ]

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ"
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const handleCreateRequest = () => {
    const newReq = {
      id: paymentRequests.length + 1,
      ...newRequest,
      amount: Number(newRequest.amount),
      status: "pending",
      request_date: new Date().toISOString().split("T")[0],
      approved_date: null,
      requester: "Admin"
    }
    setPaymentRequests([newReq, ...paymentRequests])
    setShowForm(false)
    setNewRequest({
      title: "",
      category: "Tiện ích",
      amount: "",
      recipient: "",
      description: ""
    })
  }

  const categories = ["Tiện ích", "Nhà cung cấp", "Lương", "Marketing", "Khác"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Phiếu thanh toán</h2>
          <p className="text-gray-500">Lập phiếu đề nghị thanh toán</p>
        </div>
        
        <Button 
          className="bg-[#0077b6] hover:bg-[#006699]"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} className="mr-2" />
          Tạo phiếu mới
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-2 border-[#0077b6]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tạo phiếu thanh toán mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input
                  placeholder="Nhập tiêu đề..."
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Danh mục</label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số tiền</label>
                <Input
                  type="number"
                  placeholder="Nhập số tiền..."
                  value={newRequest.amount}
                  onChange={(e) => setNewRequest({...newRequest, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Người nhận</label>
                <Input
                  placeholder="Nhập tên người nhận..."
                  value={newRequest.recipient}
                  onChange={(e) => setNewRequest({...newRequest, recipient: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Mô tả</label>
                <Textarea
                  placeholder="Nhập mô tả chi tiết..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Hủy
              </Button>
              <Button 
                className="bg-[#0077b6] hover:bg-[#006699]"
                onClick={handleCreateRequest}
                disabled={!newRequest.title || !newRequest.amount || !newRequest.recipient}
              >
                <Send size={18} className="mr-2" />
                Gửi phiếu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  {index === 0 ? <Clock className={stat.color} size={24} /> :
                   index === 1 ? <CheckCircle className={stat.color} size={24} /> :
                   index === 2 ? <XCircle className={stat.color} size={24} /> :
                   <DollarSign className={stat.color} size={24} />}
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
                placeholder="Tìm kiếm phiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Danh sách phiếu thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredRequests.map((req) => {
              const categoryInfo = categoryIcons[req.category] || { icon: FileText, color: "bg-gray-50 text-gray-600" }
              const statusInfo = statusConfig[req.status]
              const Icon = categoryInfo.icon
              const StatusIcon = statusInfo.icon
              
              return (
                <div 
                  key={req.id} 
                  className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryInfo.color}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{req.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <User size={14} />
                          {req.recipient}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(req.request_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-[#0077b6] text-lg">{formatCurrency(req.amount)}</p>
                      <p className="text-xs text-gray-400">
                        {req.approved_date ? `Duyệt: ${formatDate(req.approved_date)}` : "-"}
                      </p>
                    </div>
                    
                    <Badge className={statusInfo.color}>
                      <StatusIcon size={14} className="mr-1" />
                      {statusInfo.label}
                    </Badge>
                    
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download size={16} className="text-gray-600" />
                    </Button>
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

export default PaymentRequestDashboard


