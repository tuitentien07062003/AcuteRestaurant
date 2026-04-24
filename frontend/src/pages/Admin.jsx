
import AdminDashboard from "@/components/Admin/AdminDashboard"
import { AdminProvider } from "@/context/AdminContext"

export default function Admin() {
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  );
}

