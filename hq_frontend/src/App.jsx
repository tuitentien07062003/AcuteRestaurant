import { Routes, Route, Navigate } from "react-router-dom";
import HQLayout from "./components/HQ/HQLayout";
import BranchesPage from "./pages/BranchesPage";
import BranchDetailPage from "./pages/BranchDetailPage";
import HQEmployeesPage from "./pages/HQEmployeesPage";
import HQSalaryPage from "./pages/HQSalaryPage";

const Dashboard = () => <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full"><h2 className="text-2xl font-bold">Tong quan</h2></div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/hq/dashboard" replace />} />
      <Route path="/hq" element={<HQLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="branches/:id" element={<BranchDetailPage />} />
        <Route path="employees" element={<HQEmployeesPage />} />
        <Route path="salary" element={<HQSalaryPage />} />
      </Route>
      <Route path="*" element={<div className="flex h-screen items-center justify-center text-xl">404 - Khong tim thay trang</div>} />
    </Routes>
  );
}

export default App;
