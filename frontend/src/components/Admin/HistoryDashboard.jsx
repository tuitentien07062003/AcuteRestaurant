import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Clock, Activity } from "lucide-react"
import { useContext } from "react"
import { GlobalContext } from "@/context/GlobalContext"

const HistoryDashboard = () => {
  const { user } = useContext(GlobalContext)

  // Mock login history - in a real implementation, this would come from an API
  const loginHistory = [
    { id: 1, user: user?.full_name || 'Current User', role: user?.role || 'SM', lastLogin: new Date().toLocaleString('vi-VN') },
    { id: 2, user: 'Nguyễn Văn A', role: 'SUP', lastLogin: '2024-01-15 09:00:00' },
    { id: 3, user: 'Trần Thị B', role: 'CREW', lastLogin: '2024-01-15 08:30:00' },
    { id: 4, user: 'Lê Văn C', role: 'SM', lastLogin: '2024-01-14 17:45:00' },
  ]

  // Mock activity log
  const activityLog = [
    { id: 1, user: user?.full_name || 'Current User', action: 'Đăng nhập', timestamp: new Date().toLocaleString('vi-VN'), role: user?.role || 'SM' },
    { id: 2, user: 'Nguyễn Văn A', action: 'Duyệt phiếu thanh toán', timestamp: '2024-01-15 10:30:00', role: 'SUP' },
    { id: 3, user: 'Trần Thị B', action: 'Tạo đơn hàng', timestamp: '2024-01-15 11:15:00', role: 'CREW' },
    { id: 4, user: 'Lê Văn C', action: 'Cập nhật kho', timestamp: '2024-01-15 12:00:00', role: 'SM' },
    { id: 5, user: 'Phạm Thị D', action: 'Tính lương nhân viên', timestamp: '2024-01-15 14:20:00', role: 'SUP' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0077b6]">Lịch sử hệ thống</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Login History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Lịch sử đăng nhập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loginHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{entry.user}</p>
                    <p className="text-sm text-gray-500">Đăng nhập lần cuối</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{entry.role}</Badge>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.lastLogin}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Nhật ký hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-gray-500">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{activity.role}</Badge>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HistoryDashboard