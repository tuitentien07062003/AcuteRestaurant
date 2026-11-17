import { useState, useContext, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  User,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import paymentRequestApi from "../../api/paymentRequestApi";
import { GlobalContext } from "@/context/GlobalContext";

const generateInvoiceImageUrl = () => {
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/600/400?random=${randomId}`;
};

const statusConfig = {
  PENDING: {
    label: "Chờ duyệt",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  SENT: {
    label: "Đã gửi",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Send,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const PaymentRequestDashboard = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(GlobalContext);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentRequestApi.getAll();
      setPaymentRequests(response?.data || []);
    } catch (err) {
      setError("Không thể tải danh sách phiếu mua hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  // STATE GIỮ NGUYÊN
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
        note: "",
      },
    ],
  });

  const [emailReport, setEmailReport] = useState({
    to: "acuterestaurant@company.com",
    subject: "Báo cáo phiếu mua hàng",
    message:
      "Kính gửi HQ,\n\nXin gửi kèm phiếu mua hàng đã lập hôm nay. Vui lòng xem chi tiết và duyệt theo quy trình.\n\nTrân trọng,\nBan quản lý",
  });

  // LOGIC GIỮ NGUYÊN
  const calculateDetailTotal = (detail) => {
    const qty = Number(detail.quantity) || 0;
    const price = Number(detail.unit_price) || 0;
    return qty * price;
  };

  const calculateTotalAmount = () =>
    newRequest.details.reduce(
      (sum, detail) => sum + calculateDetailTotal(detail),
      0,
    );

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...newRequest.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    if (field === "quantity" || field === "unit_price") {
      updatedDetails[index].total_price = calculateDetailTotal(
        updatedDetails[index],
      );
    }
    setNewRequest({ ...newRequest, details: updatedDetails });
  };

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
          note: "",
        },
      ],
    });
  };

  const handleRemoveDetailRow = (index) => {
    const updatedDetails = newRequest.details.filter((_, idx) => idx !== index);
    setNewRequest({ ...newRequest, details: updatedDetails });
  };

  const handleInvoiceFileChange = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      handleDetailChange(index, "invoice_photo_url", reader.result);
    reader.readAsDataURL(file);
  };

  const handleAttachmentFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setNewRequest({ ...newRequest, attachment_url: reader.result });
    reader.readAsDataURL(file);
  };

  const handleCreateRequest = async () => {
    const requesterId = user?.employee_id || "unknown";
    const storeId = user?.store_id || 7062003;
    if (
      !newRequest.title ||
      !newRequest.reason ||
      newRequest.details.length === 0
    ) {
      alert("Vui lòng điền tiêu đề, lý do và một hoặc nhiều mặt hàng.");
      return;
    }
    if (!requesterId || requesterId === "unknown") {
      alert("Không thể xác định nhân viên. Vui lòng đăng nhập lại.");
      return;
    }

    const requestPayload = {
      store_id: storeId,
      requester_id: requesterId,
      reason: newRequest.reason,
      note: newRequest.note,
      attachment_url: newRequest.attachment_url,
      details: newRequest.details.map((detail) => ({
        item_name: detail.item_name,
        quantity: Number(detail.quantity) || 1,
        unit_price: Number(detail.unit_price) || 0,
        total_price: calculateDetailTotal(detail),
        invoice_photo_url: detail.invoice_photo_url,
        note: detail.note,
      })),
    };

    setCreating(true);
    try {
      await paymentRequestApi.create(requestPayload);
      alert("Phiếu mua hàng đã được tạo thành công!");
      setShowForm(false);
      setNewRequest({
        title: "",
        store_id: 1,
        requester_id: "",
        reason: "",
        note: "",
        attachment_url: "",
        details: [
          {
            item_name: "",
            quantity: 1,
            unit_price: "",
            invoice_photo_url: "",
            note: "",
          },
        ],
      });
      await fetchPaymentRequests();
    } catch (error) {
      alert("Không thể tạo phiếu. Vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  };

  const handleSendEmailReport = () => {
    const subject = encodeURIComponent(emailReport.subject);
    const body = encodeURIComponent(emailReport.message);
    window.open(
      `mailto:${emailReport.to}?subject=${subject}&body=${body}`,
      "_blank",
    );
  };

  const filteredRequests = paymentRequests.filter((req) => {
    const matchesSearch =
      (req.reason &&
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.id && req.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === "all" ||
      req.status === filterStatus ||
      req.status?.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("vi-VN") + " đ";
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const stats = [
    {
      label: "Chờ duyệt",
      value: paymentRequests.filter((r) => r.status === "PENDING").length,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Đã gửi",
      value: paymentRequests.filter((r) => r.status === "SENT").length,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Đã thanh toán",
      value: paymentRequests.filter((r) => r.status === "PAID").length,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Tổng tiền",
      value: formatCurrency(
        paymentRequests.reduce(
          (sum, r) => sum + (Number(r.total_amount) || 0),
          0,
        ),
      ),
      color: "text-[#F97316]",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Phiếu thanh toán
          </h2>
          <p className="text-slate-500 mt-1">
            Quản lý đề xuất chi phí và lưu trữ hóa đơn
          </p>
        </div>
        <Button
          className="bg-[#F97316] hover:bg-[#EA580C] rounded-xl shadow-sm font-semibold"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} className="mr-2" />{" "}
          {showForm ? "Đóng Form" : "Tạo phiếu mới"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow border-slate-200 rounded-2xl"
          >
            <CardContent className="p-5">
              <p className="text-sm font-medium text-slate-500 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CREATE FORM (Chia khối rõ ràng) */}
      {showForm && (
        <Card className="border-orange-200 shadow-md rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-orange-50/50 border-b border-orange-100 rounded-t-2xl p-5">
            <CardTitle className="text-lg font-bold text-[#F97316] flex items-center gap-2">
              <FileText size={20} /> Lập phiếu mua hàng mới
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8">
              {/* Cột Trái: Thông tin phiếu */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Tiêu đề phiếu <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="VD: Mua nguyên vật liệu tuần 1..."
                      value={newRequest.title}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, title: e.target.value })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Lý do mua hàng <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="VD: Cửa hàng sắp hết thịt..."
                      value={newRequest.reason}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, reason: e.target.value })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Link hóa đơn đính kèm
                    </label>
                    <Input
                      placeholder="URL hóa đơn..."
                      value={newRequest.attachment_url}
                      onChange={(e) =>
                        setNewRequest({
                          ...newRequest,
                          attachment_url: e.target.value,
                        })
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                      Upload hóa đơn (Ảnh/PDF)
                    </label>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        handleAttachmentFileChange(e.target.files?.[0])
                      }
                      className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316] file:bg-orange-50 file:text-[#F97316] file:border-0 file:rounded-md file:mr-4"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    Ghi chú thêm
                  </label>
                  <Textarea
                    placeholder="Ghi chú cho phiếu..."
                    value={newRequest.note}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, note: e.target.value })
                    }
                    rows={2}
                    className="bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316] resize-none"
                  />
                </div>

                {/* Chi tiết mặt hàng */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-slate-800">
                      Danh sách mặt hàng
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddDetailRow}
                      className="text-[#F97316] border-orange-200 hover:bg-orange-50 rounded-lg h-8"
                    >
                      <Plus size={14} className="mr-1" /> Thêm dòng
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {newRequest.details.map((detail, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-200"
                      >
                        <div className="col-span-12 md:col-span-4">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">
                            Tên mặt hàng
                          </label>
                          <Input
                            placeholder="VD: Gạo ST25"
                            value={detail.item_name}
                            onChange={(e) =>
                              handleDetailChange(
                                index,
                                "item_name",
                                e.target.value,
                              )
                            }
                            className="h-9 bg-white"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">
                            Số lượng
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={detail.quantity}
                            onChange={(e) =>
                              handleDetailChange(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="h-9 bg-white"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-3">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">
                            Đơn giá
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="1000"
                            value={detail.unit_price}
                            onChange={(e) =>
                              handleDetailChange(
                                index,
                                "unit_price",
                                e.target.value,
                              )
                            }
                            className="h-9 bg-white"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">
                            Thành tiền
                          </label>
                          <div className="h-9 flex items-center px-3 bg-orange-50 text-[#F97316] font-bold text-sm rounded-md border border-orange-100">
                            {formatCurrency(calculateDetailTotal(detail))}
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDetailRow(index)}
                            className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cột Phải: Tổng hợp & Mail */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                    Tổng hợp phiếu
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ngày lập</span>
                      <span className="font-semibold">
                        {new Date().toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số mặt hàng</span>
                      <span className="font-semibold">
                        {newRequest.details.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                      <span className="text-slate-700 font-bold">
                        Tổng tiền
                      </span>
                      <span className="text-xl font-black text-[#F97316]">
                        {formatCurrency(calculateTotalAmount())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                    <Send size={16} className="text-[#F97316]" /> Email báo cáo
                    HQ
                  </h4>
                  <div className="space-y-3">
                    <Input
                      value={emailReport.to}
                      onChange={(e) =>
                        setEmailReport({ ...emailReport, to: e.target.value })
                      }
                      placeholder="Email người nhận..."
                      className="h-9 text-sm bg-slate-50 border-slate-200"
                    />
                    <Input
                      value={emailReport.subject}
                      onChange={(e) =>
                        setEmailReport({
                          ...emailReport,
                          subject: e.target.value,
                        })
                      }
                      placeholder="Tiêu đề..."
                      className="h-9 text-sm bg-slate-50 border-slate-200"
                    />
                    <Textarea
                      value={emailReport.message}
                      onChange={(e) =>
                        setEmailReport({
                          ...emailReport,
                          message: e.target.value,
                        })
                      }
                      rows={3}
                      className="text-sm bg-slate-50 border-slate-200 resize-none"
                    />
                    <Button
                      onClick={handleSendEmailReport}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl h-9"
                    >
                      Gửi Email
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="rounded-xl border-slate-200 px-6"
              >
                Hủy
              </Button>
              <Button
                className="bg-[#F97316] hover:bg-[#EA580C] rounded-xl px-8 font-bold shadow-sm"
                onClick={handleCreateRequest}
                disabled={creating}
              >
                <Send size={18} className="mr-2" />{" "}
                {creating ? "Đang lưu..." : "Lưu phiếu"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter & Search */}
      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="Tìm kiếm phiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#F97316] w-full md:w-auto"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="SENT">Đã gửi</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="REJECTED">Từ chối</option>
            </select>
            <Button
              variant="outline"
              onClick={fetchPaymentRequests}
              disabled={loading}
              className="rounded-xl border-slate-200 shadow-sm shrink-0"
            >
              <RefreshCw
                size={18}
                className={`text-slate-500 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table List */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <RefreshCw
                className="animate-spin mx-auto text-[#F97316]"
                size={24}
              />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              Không có phiếu nào
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">
                    Nội dung / Lý do
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Người gửi
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Ngày lập
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => {
                  const statusInfo =
                    statusConfig[req.status] || statusConfig.PENDING;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow
                      key={req.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell>
                        <div className="font-bold text-slate-800 line-clamp-1">
                          {req.reason}
                        </div>
                        <div className="text-xs text-slate-500">
                          Mã: #{req.id.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <User size={14} className="text-slate-400" />
                          {typeof req.requester === "object"
                            ? req.requester.full_name
                            : req.requester || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDate(req.request_date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#F97316]">
                        {formatCurrency(req.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${statusInfo.color} border px-2.5 py-1 rounded-md text-xs`}
                        >
                          <StatusIcon size={12} className="mr-1" />{" "}
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentRequestDashboard;
