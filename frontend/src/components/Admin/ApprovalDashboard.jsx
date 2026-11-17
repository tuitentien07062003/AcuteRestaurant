import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import paymentRequestApi from "@/api/paymentRequestApi";
import { GlobalContext } from "@/context/GlobalContext";

const ApprovalDashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(GlobalContext);

  // Fetch pending payment requests
  const { data: paymentRequests, isLoading } = useQuery({
    queryKey: ["paymentRequests", "PENDING"],
    queryFn: async () => {
      const response = await paymentRequestApi.getAll({ status: "PENDING" });
      return response.data;
    },
  });

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      paymentRequestApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["paymentRequests"]);
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: () => {
      toast.error("Lỗi cập nhật trạng thái");
    },
  });

  const handleApprove = (id) =>
    updateStatusMutation.mutate({ id, status: "PAID" });
  const handleReject = (id) =>
    updateStatusMutation.mutate({ id, status: "REJECTED" });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-500 font-medium">
          Đang tải danh sách yêu cầu...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#F97316]" /> Xét duyệt yêu cầu
          </h2>
          <p className="text-slate-500 mt-1">
            Phê duyệt các phiếu thanh toán/chi phí từ chi nhánh
          </p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 text-[#F97316] font-bold text-sm flex items-center gap-2 shadow-sm">
          <Clock size={16} /> Chờ duyệt: {paymentRequests?.length || 0}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {Array.isArray(paymentRequests) &&
          paymentRequests?.map((request) => (
            <Card
              key={request.id}
              className="border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="bg-slate-50 border-b border-slate-100 p-5 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                    <FileText size={18} className="text-[#F97316]" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">
                      Phiếu yêu cầu #{request.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Người gửi:{" "}
                      <span className="font-medium text-slate-700">
                        {request.requester?.full_name}
                      </span>
                    </p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1 text-xs">
                  <Clock className="w-3 h-3 mr-1" /> CHỜ DUYỆT
                </Badge>
              </CardHeader>

              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">
                      Lý do / Nội dung
                    </p>
                    <p className="font-medium text-slate-800 text-sm">
                      {request.reason}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        Tổng tiền đề xuất
                      </p>
                      <p className="text-xl font-black text-[#F97316]">
                        {Number(request.total_amount).toLocaleString()} đ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(request.id)}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                  >
                    <X size={16} className="mr-2" /> Từ chối
                  </Button>
                  <Button
                    onClick={() => handleApprove(request.id)}
                    disabled={updateStatusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-sm px-6"
                  >
                    <Check size={16} className="mr-2" /> Phê duyệt (PAID)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

        {(!paymentRequests || paymentRequests.length === 0) && (
          <Card className="border-slate-200 border-dashed shadow-none bg-slate-50/50">
            <CardContent className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Đã xử lý xong!
              </h3>
              <p className="text-slate-500 text-sm">
                Không có yêu cầu nào đang chờ duyệt lúc này.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApprovalDashboard;
