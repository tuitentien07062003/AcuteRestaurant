
import AdminDashboard from "@/components/Admin/AdminDashboard"
import AdminSidebar from "@/components/Admin/AdminSidebar"
import { AdminProvider } from "@/context/AdminContext"

export default function Admin() {
  return (
    <AdminProvider>
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <AdminDashboard />
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}

