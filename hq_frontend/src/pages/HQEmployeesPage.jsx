import { useState } from "react";
import { Users, Store, Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useStores } from "../hooks/useStores";
import { useHQEmployees } from "../hooks/useHQEmployees";
import HQEmployeesStats from "../components/HQ/HQEmployeesStats";
import HQEmployeesTable from "../components/HQ/HQEmployeesTable";

export default function HQEmployeesPage() {
  const { stores, loading: storesLoading, error: storesError } = useStores();
  const [activeTab, setActiveTab] = useState("all");

  const selectedStoreId = activeTab === "all" ? null : activeTab;
  const { employees, loading: empLoading, error: empError } =
    useHQEmployees(selectedStoreId);

  const isLoading = storesLoading || empLoading;
  const error = storesError || empError;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quản lý nhân sự</h2>
        <p className="text-gray-500 mt-1">
          Xem danh sách nhân viên theo từng chi nhánh
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center h-32 text-red-600 gap-2 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state for stores */}
      {storesLoading && !error && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Main content */}
      {!storesLoading && !error && (
        <>
          {/* Branch filter tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border flex-wrap h-auto py-1 px-1 gap-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <Users className="w-4 h-4 mr-1" />
                Tất cả chi nhánh
              </TabsTrigger>
              {stores.map((store) => (
                <TabsTrigger
                  key={store.id}
                  value={String(store.id)}
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Store className="w-4 h-4 mr-1" />
                  {store.name_store || `CN #${store.id}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Stats + Table */}
          <HQEmployeesStats employees={employees} loading={isLoading} />
          <HQEmployeesTable
            employees={employees}
            loading={empLoading}
            error={empError}
          />
        </>
      )}
    </div>
  );
}

