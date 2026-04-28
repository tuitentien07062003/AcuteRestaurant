import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  MapPin,
  Phone,
  Search,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useStores } from "../hooks/useStores";
import { formatCurrency } from "../lib/formatters";

function getStatusBadge() {
  return (
    <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200">
      Đang hoạt động
    </Badge>
  );
}

function generateTaxCode(id) {
  return `03${String(id).padStart(8, "0")}-001`;
}

export default function BranchesPage() {
  const navigate = useNavigate();
  const { stores, loading, error } = useStores();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return stores;
    const kw = search.toLowerCase();
    return stores.filter(
      (s) =>
        (s.name_store || "").toLowerCase().includes(kw) ||
        (s.city || "").toLowerCase().includes(kw) ||
        (s.address || "").toLowerCase().includes(kw)
    );
  }, [stores, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600 gap-2">
        <AlertCircle className="w-6 h-6" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách chi nhánh</h2>
          <p className="text-gray-500 mt-1">
            Quản lý {stores.length} cửa hàng trong hệ thống
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tên, thành phố..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((store) => (
          <Card
            key={store.id}
            className="group cursor-pointer hover:shadow-lg transition-all border border-gray-200"
            onClick={() => navigate(`/hq/branches/${store.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Chi nhánh {store.name_store || `#${store.id}`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      MST: {generateTaxCode(store.id)}
                    </p>
                  </div>
                </div>
                {getStatusBadge()}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                  <span>
                    {store.address || "—"}
                    {store.city ? `, ${store.city}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{store.hotline || "—"}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Tier {store.tier || "—"}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:underline">
                  Xem chi tiết
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Không tìm thấy chi nhánh nào</p>
        </div>
      )}
    </div>
  );
}

