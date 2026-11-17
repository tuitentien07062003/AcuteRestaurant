import { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Eye,
  FolderOpen,
  Calendar,
  User,
  Filter,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Mock documents data
const mockDocuments = [
  {
    id: 1,
    name: "Hợp đồng lao động - Nguyễn Văn A",
    type: "contract",
    category: "Hợp đồng lao động",
    employee: "Nguyễn Văn A",
    created_at: "2024-01-01",
    status: "active",
  },
  {
    id: 2,
    name: "Cam kết thuế - Cửa hàng 01",
    type: "tax",
    category: "Cam kết thuế",
    employee: "Cửa hàng 01",
    created_at: "2024-02-10",
    status: "active",
  },
  {
    id: 3,
    name: "Giấy tờ liên quan - Hồ sơ nhân sự",
    type: "related",
    category: "Giấy tờ liên quan",
    employee: "Phòng Nhân sự",
    created_at: "2024-03-05",
    status: "active",
  },
  {
    id: 4,
    name: "Cam kết bảo mật - Nhân viên Bán hàng",
    type: "confidential",
    category: "Cam kết bảo mật",
    employee: "Bảo mật nội bộ",
    created_at: "2024-03-22",
    status: "active",
  },
  {
    id: 5,
    name: "Hợp đồng lao động - Trần Thị B",
    type: "contract",
    category: "Hợp đồng lao động",
    employee: "Trần Thị B",
    created_at: "2024-04-01",
    status: "active",
  },
];

const categoryIcons = {
  "Hợp đồng lao động": { icon: FileText, color: "bg-orange-50 text-[#F97316]" },
  "Cam kết thuế": { icon: FileText, color: "bg-blue-50 text-blue-600" },
  "Giấy tờ liên quan": {
    icon: FolderOpen,
    color: "bg-yellow-50 text-yellow-600",
  },
  "Cam kết bảo mật": { icon: FileText, color: "bg-red-50 text-red-600" },
};

const DocumentsDashboard = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // State cho form thêm mới (giữ nguyên)
  const [newDocName, setNewDocName] = useState("");
  const [newDocEmployee, setNewDocEmployee] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Hợp đồng lao động");
  const [showForm, setShowForm] = useState(false); // Ẩn/hiện form cho gọn

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
    "Chính sách",
  ];

  const getDocumentImageUrl = (category, id) => {
    const label = encodeURIComponent(category || "Hồ sơ");
    return `https://placehold.co/600x400/eff6ff/1d4ed8?text=${label}&font=roboto`;
  };

  const handleAddDocument = () => {
    if (!newDocName.trim() || !newDocEmployee.trim()) {
      alert("Vui lòng nhập tên tài liệu và người liên quan");
      return;
    }
    const nextId = documents.length
      ? Math.max(...documents.map((doc) => doc.id)) + 1
      : 1;
    const newDocument = {
      id: nextId,
      name: newDocName,
      type: newDocCategory.toLowerCase().replace(/\s+/g, "_"),
      category: newDocCategory,
      employee: newDocEmployee,
      created_at: new Date().toISOString().split("T")[0],
      status: "active",
    };
    setDocuments([newDocument, ...documents]);
    setNewDocName("");
    setNewDocEmployee("");
    setShowForm(false);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const stats = [
    {
      label: "Tổng tài liệu",
      value: documents.length,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Hợp đồng LĐ",
      value: documents.filter((d) => d.category === "Hợp đồng lao động").length,
      color: "text-[#F97316]",
      bg: "bg-orange-50",
    },
    {
      label: "Cam kết thuế",
      value: documents.filter((d) => d.category === "Cam kết thuế").length,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Cam kết bảo mật",
      value: documents.filter((d) => d.category === "Cam kết bảo mật").length,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý hồ sơ</h2>
          <p className="text-slate-500 mt-1">
            Lưu trữ và quản lý tài liệu nội bộ của doanh nghiệp
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#F97316] hover:bg-[#EA580C] rounded-xl shadow-sm font-semibold"
        >
          <Plus size={18} className="mr-2" /> Thêm hồ sơ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow border-slate-200 rounded-2xl"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}
              >
                <FileText className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Thêm Mới (Hiển thị có điều kiện) */}
      {showForm && (
        <Card className="border-orange-200 bg-orange-50/30 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Tên hồ sơ <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="VD: HĐLĐ - Nguyễn Văn A"
                  className="bg-white border-slate-200 rounded-xl focus:ring-[#F97316]"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Người liên quan <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newDocEmployee}
                  onChange={(e) => setNewDocEmployee(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="bg-white border-slate-200 rounded-xl focus:ring-[#F97316]"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Loại hồ sơ
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F97316] h-9"
                >
                  {categories
                    .filter((cat) => cat !== "all")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              <div className="md:col-span-1 flex gap-2">
                <Button
                  onClick={handleAddDocument}
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] rounded-xl h-9"
                >
                  Lưu
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="rounded-xl h-9 border-slate-200"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="Tìm kiếm tài liệu, người liên quan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl focus:ring-[#F97316]"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#F97316] w-full md:w-auto"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Tất cả danh mục" : cat}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => {
          const categoryInfo = categoryIcons[doc.category] || {
            icon: FileText,
            color: "bg-slate-50 text-slate-600",
          };
          const Icon = categoryInfo.icon;

          return (
            <Card
              key={doc.id}
              className="border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img
                  src={getDocumentImageUrl(doc.category, doc.id)}
                  alt={doc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm border-none">
                    {doc.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categoryInfo.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight mb-1">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <User size={12} /> {doc.employee}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(doc.created_at)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 rounded-lg"
                      onClick={() =>
                        window.open(
                          getDocumentImageUrl(doc.category, doc.id),
                          "_blank",
                        )
                      }
                      title="Xem"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-[#F97316] hover:bg-orange-50 rounded-lg"
                      onClick={() =>
                        window.open(
                          getDocumentImageUrl(doc.category, doc.id),
                          "_blank",
                        )
                      }
                      title="Tải xuống"
                    >
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
          <FolderOpen size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">Không tìm thấy hồ sơ nào phù hợp</p>
        </div>
      )}
    </div>
  );
};

export default DocumentsDashboard;
