import { useAdminData } from "@/hooks/useAdmin"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const EmployeesStats = ({ onAddClick }) => {
  const { employees, loading } = useAdminData()
  
  const filteredEmployees = employees.filter(emp => emp.role !== 'HQ')
  const activeCount = filteredEmployees.filter(e => e.active).length
  const inactiveCount = filteredEmployees.filter(e => !e.active).length
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0077b6]">Nhân viên</h2>
          <p className="text-gray-500">Quản lý thông tin nhân viên</p>
        </div>
        
        <Button className="bg-[#0077b6] hover:bg-[#006699]" onClick={onAddClick}>
          <Plus size={18} className="mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng nhân viên</p>
                <p className="text-2xl font-bold text-[#0077b6]">{filteredEmployees.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="text-[#0077b6]" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang làm việc</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã nghỉ việc</p>
                <p className="text-2xl font-bold text-gray-400">{inactiveCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                <Users className="text-gray-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default EmployeesStats

