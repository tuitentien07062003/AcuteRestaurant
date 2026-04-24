import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import paymentRequestApi from "@/api/paymentRequestApi"
import { GlobalContext } from "@/context/GlobalContext"

const ApprovalDashboard = () => {
  const queryClient = useQueryClient()
  const { user } = useContext(GlobalContext)

  // Fetch pending payment requests
  const { data: paymentRequests, isLoading } = useQuery({
    queryKey: ['paymentRequests', 'PENDING'],
    queryFn: async () => {
    const response = await paymentRequestApi.getAll({ status: 'PENDING' });
    return response.data; // Trả về mảng các yêu cầu
  }
  })

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => paymentRequestApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['paymentRequests'])
      toast.success('Cập nhật trạng thái thành công')
    },
    onError: () => {
      toast.error('Lỗi cập nhật trạng thái')
    }
  })

  const handleApprove = (id) => {
    updateStatusMutation.mutate({ id, status: 'PAID' })
  }

  const handleReject = (id) => {
    updateStatusMutation.mutate({ id, status: 'REJECTED' })
  }

  if (isLoading) return <div>Loading...</div>

  
        console.log("Dữ liệu API trả về:", paymentRequests);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0077b6]">Xét duyệt yêu cầu</h2>
      </div>

      <div className="grid gap-4">
        {Array.isArray(paymentRequests) && paymentRequests?.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Yêu cầu thanh toán #{request.id}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {request.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Cửa hàng:</strong> {user?.store_id || 7062003}</p>
                <p><strong>Người yêu cầu:</strong> {request.requester?.full_name}</p>
                <p><strong>Lý do:</strong> {request.reason}</p>
                <p><strong>Tổng tiền:</strong> {request.total_amount?.toLocaleString()} đ</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    variant="destructive"
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!paymentRequests || paymentRequests.length === 0) && (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Không có yêu cầu nào đang chờ duyệt
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ApprovalDashboard