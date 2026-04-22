import { useState, useContext } from "react"
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
import paymentRequestApi from "../../api/paymentRequestApi"
import { GlobalContext } from "@/context/GlobalContext"

const generateInvoiceImageUrl = () => {
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/600/400?random=${randomId}`;
}

// Mock payment requests data
const mockPaymentRequests = [
  {
    id: 1,
    title: "Phiếu mua hàng gấp - Bột chiên",
    type: "purchase",
    category: "Nhập hàng",
    amount: 4200000,
    recipient: "Nhà cung cấp ABC",
    reason: "Nhập gấp nguyên liệu phục vụ cuối tuần",
    note: "Hóa đơn đỏ đã scan đính kèm",
    status: "pending",
    request_date: "2024-04-12",
    approved_date: null,
    requester: "Admin",
    attachment_url: "https://picsum.photos/600/400?random=sample1"
  }
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
  const [creating, setCreating] = useState(false)
  const { user } = useContext(GlobalContext)

  const [newRequest, setNewRequest] = useState({
    title: "",
    store_id: "",
    requester_id: "",
    reason: "",
    note: "",
    attachment_url: generateInvoiceImageUrl(),
    details: [
      {
        item_name: "",
        quantity: 1,
        unit_price: "",
        invoice_photo_url: generateInvoiceImageUrl(),
        note: ""
      }
    ]
  })

  const [emailReport, setEmailReport] = useState({
    to: "acuterestaurant@company.com",
    subject: "Báo cáo phiếu mua hàng",
    message: "Kính gửi HQ,\n\nXin gửi kèm phiếu mua hàng đã lập hôm nay. Vui lòng xem chi tiết và duyệt theo quy trình.\n\nTrân trọng,\nBan quản lý"
  })

  const calculateDetailTotal = (detail) => {
    const qty = Number(detail.quantity) || 0
    const price = Number(detail.unit_price) || 0
    return qty * price
  }

  const calculateTotalAmount = () => {
    return newRequest.details.reduce((sum, detail) => sum + calculateDetailTotal(detail), 0)
  }

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...newRequest.details]
    updatedDetails[index] = { ...updatedDetails[index], [field]: value }
    if (field === 'quantity' || field === 'unit_price') {
      updatedDetails[index].total_price = calculateDetailTotal(updatedDetails[index])
    }
    setNewRequest({ ...newRequest, details: updatedDetails })
  }

  const handleAddDetailRow = () => {
    setNewRequest({
      ...newRequest,
      details: [
        ...newRequest.details,
        {
          item_name: "",
          quantity: 1,
          unit_price: "",
          invoice_photo_url: generateInvoiceImageUrl(),
          note: ""
        }
      ]
    })
  }

  const handleRemoveDetailRow = (index) => {
    const updatedDetails = newRequest.details.filter((_, idx) => idx !== index)
    setNewRequest({ ...newRequest, details: updatedDetails })
  }

  const handleInvoiceFileChange = (index, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      handleDetailChange(index, 'invoice_photo_url', reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleAttachmentFileChange = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setNewRequest({ ...newRequest, attachment_url: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleCreateRequest = async () => {
    const requesterId = user?.employee_id || "unknown"
    const storeId = user?.store_id || 7062003
    if (!newRequest.title || !newRequest.reason || newRequest.details.length === 0) {
      alert('Vui lòng điền tiêu đề, lý do và một hoặc nhiều mặt hàng.')
      return
    }

    if (!requesterId || requesterId === "unknown") {
      alert('Không thể xác định nhân viên. Vui lòng đăng nhập lại.')
      return
    }

    if (!storeId) {
      alert('Không thể xác định cửa hàng. Vui lòng đăng nhập lại.')
      return
    }

    const requestPayload = {
      store_id: storeId,
      requester_id: requesterId,
      reason: newRequest.reason,
      note: newRequest.note,
      attachment_url: newRequest.attachment_url,
      details: newRequest.details.map(detail => ({
        item_name: detail.item_name,
        quantity: Number(detail.quantity) || 1,
        unit_price: Number(detail.unit_price) || 0,
        total_price: calculateDetailTotal(detail),
        invoice_photo_url: detail.invoice_photo_url,
        note: detail.note
      }))
    }

    console.log("Dữ liệu chuẩn bị gửi:", requestPayload);

    setCreating(true)
    try {
      const response = await paymentRequestApi.create(requestPayload)
      const createdId = response?.data?.request?.id || paymentRequests.length + 1
      const storedRequest = {
        id: createdId,
        title: newRequest.title,
        category: newRequest.reason,
        amount: calculateTotalAmount(),
        recipient: "Nhà cung cấp",
        reason: newRequest.reason,
        note: newRequest.note,
        status: "pending",
        request_date: new Date().toISOString().split('T')[0],
        approved_date: null,
        requester: "Admin",
        attachment_url: newRequest.attachment_url,
        details: requestPayload.details
      }
      setPaymentRequests([storedRequest, ...paymentRequests])
      setShowForm(false)
      setNewRequest({
        title: "",
        store_id: 1,
        requester_id: "",
        reason: "",
        note: "",
        attachment_url: "",
        details: [{ item_name: "", quantity: 1, unit_price: "", invoice_photo_url: "", note: "" }]
      })
    } catch (error) {
      console.error('Tạo phiếu thất bại', error)
      alert('Không thể tạo phiếu. Vui lòng thử lại.')
    } finally {
      setCreating(false)
    }
  }

  const handleSendEmailReport = () => {
    const subject = encodeURIComponent(emailReport.subject)
    const body = encodeURIComponent(emailReport.message)
    window.open(`mailto:${emailReport.to}?subject=${subject}&body=${body}`, '_blank')
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Phiếu mua hàng</h2>
          <p className="text-gray-500">Lập phiếu đề nghị mua hàng gấp và lưu trữ hoá đơn</p>
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
        <div className="space-y-4">
          <Card className="border-2 border-[#0077b6]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Lập phiếu mua hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tiêu đề phiếu</label>
                      <Input
                        placeholder="Nhập tiêu đề phiếu mua hàng..."
                        value={newRequest.title}
                        onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lý do</label>
                      <Input
                        placeholder="Nhập lý do mua hàng gấp..."
                        value={newRequest.reason}
                        onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Attached Invoice URL</label>
                      <Input
                        placeholder="URL hóa đơn điện tử hoặc scan..."
                        value={newRequest.attachment_url}
                        onChange={(e) => setNewRequest({ ...newRequest, attachment_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Upload hóa đơn scan</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleAttachmentFileChange(e.target.files?.[0])}
                        className="w-full text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ghi chú</label>
                    <Textarea
                      placeholder="Ghi chú thêm cho phiếu mua hàng..."
                      value={newRequest.note}
                      onChange={(e) => setNewRequest({ ...newRequest, note: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mặt hàng cần mua</label>
                    <div className="space-y-3">
                      {newRequest.details.map((detail, index) => (
                        <Card key={index} className="border border-slate-200 bg-slate-50">
                          <CardContent className="grid grid-cols-1 xl:grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center">
                            <div className="space-y-2">
                              <label className="text-xs text-slate-500">Tên mặt hàng</label>
                              <Input
                                placeholder="VD: Gạo, dầu ăn..."
                                value={detail.item_name}
                                onChange={(e) => handleDetailChange(index, 'item_name', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs text-slate-500">Số lượng</label>
                              <Input
                                type="number"
                                min="1"
                                value={detail.quantity}
                                onChange={(e) => handleDetailChange(index, 'quantity', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs text-slate-500">Đơn giá</label>
                              <Input
                                type="number"
                                min="0"
                                step="1000"
                                value={detail.unit_price}
                                onChange={(e) => handleDetailChange(index, 'unit_price', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs text-slate-500">Tổng giá</label>
                              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                                {calculateDetailTotal(detail).toLocaleString('vi-VN')} đ
                              </div>
                            </div>

                            <div className="space-y-2 xl:col-span-2">
                              <label className="text-xs text-slate-500">Hoá đơn / scan</label>
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="URL hoá đơn..."
                                  value={detail.invoice_photo_url}
                                  onChange={(e) => handleDetailChange(index, 'invoice_photo_url', e.target.value)}
                                />
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => handleInvoiceFileChange(index, e.target.files?.[0])}
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-2 xl:col-span-2">
                              <label className="text-xs text-slate-500">Ghi chú</label>
                              <Input
                                placeholder="Ghi chú cho mặt hàng..."
                                value={detail.note}
                                onChange={(e) => handleDetailChange(index, 'note', e.target.value)}
                              />
                            </div>

                            <div className="flex justify-end xl:col-span-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveDetailRow(index)}
                                className="text-red-600"
                              >
                                Xóa
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddDetailRow}>
                      <Plus size={16} /> Thêm mặt hàng
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500 mb-3">Tổng hợp phiếu</p>
                    <div className="space-y-3 text-slate-700">
                      <div className="flex items-center justify-between">
                        <span>Ngày lập</span>
                        <span>{new Date().toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Số mặt hàng</span>
                        <span>{newRequest.details.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tổng tiền dự kiến</span>
                        <span className="font-semibold">{calculateTotalAmount().toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Trạng thái</span>
                        <Badge className="bg-yellow-100 text-yellow-700">Chờ duyệt</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-sm text-slate-500 mb-3">Thư báo cáo HQ</p>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p>Trong EmailJS bạn sẽ chỉ cần map các trường:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>to</strong>: địa chỉ HQ</li>
                        <li><strong>subject</strong>: tiêu đề báo cáo</li>
                        <li><strong>message</strong>: nội dung chi tiết phiếu</li>
                        <li><strong>attachment_url</strong>: đường dẫn hóa đơn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 mt-6">
                <div className="flex-1">
                  {newRequest.attachment_url && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                      <img
                        src={newRequest.attachment_url}
                        alt="Invoice preview"
                        className="w-full max-h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Hủy
                </Button>
                <Button
                  className="bg-[#0077b6] hover:bg-[#006699]"
                  onClick={handleCreateRequest}
                  disabled={creating || !newRequest.title || !newRequest.reason}
                >
                  <Send size={18} className="mr-2" />
                  Lưu phiếu
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Mail báo cáo HQ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Gửi tới</label>
                  <Input
                    value={emailReport.to}
                    onChange={(e) => setEmailReport({ ...emailReport, to: e.target.value })}
                    placeholder="hq@company.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <Input
                    value={emailReport.subject}
                    onChange={(e) => setEmailReport({ ...emailReport, subject: e.target.value })}
                    placeholder="Email báo cáo phiếu mua hàng"
                  />
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <label className="text-sm font-medium">Nội dung email</label>
                <Textarea
                  value={emailReport.message}
                  onChange={(e) => setEmailReport({ ...emailReport, message: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setEmailReport({ ...emailReport, subject: `Báo cáo phiếu mua hàng - ${newRequest.title}`, message: emailReport.message })}>
                  Đặt lại mẫu
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSendEmailReport}>
                  Gửi báo cáo HQ
                </Button>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                UI này đã chuẩn bị sẵn cho EmailJS. Khi tích hợp EmailJS, bạn chỉ cần thay chức năng `handleSendEmailReport` bằng lời gọi EmailJS và dùng các trường `to`, `subject`, `message`.
              </p>
            </CardContent>
          </Card>
        </div>
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
          <CardTitle className="text-lg font-semibold">Danh sách phiếu mua hàng</CardTitle>
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


