import { useState } from "react";
import { useHQPayrolls, usePayrollDetail } from "../hooks/useHQPayrolls.js";
import { useStores } from "../hooks/useStores.js";
import HQPayrollTable from "../components/HQ/HQPayrollTable.jsx";
import HQBankSettlementDialog from "../components/HQ/HQBankSettlementDialog.jsx";
import { approvePayroll } from "../api/payrollApi.js";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Landmark, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const fm = (a) => Number(a||0).toLocaleString("vi-VN")+" đ";

export default function HQSalaryPage() {
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState(null);

  const { payrolls, loading, error } = useHQPayrolls(month, year);
  const { payroll: selectedPayroll, loading: detailLoading } = usePayrollDetail(selectedPayrollId);
  const { stores } = useStores();

  const handleSelectPayroll = (id) => {
    setSelectedPayrollId(id);
    setMessage(null);
  };

  const handleOpenDialog = () => {
    if (!selectedPayroll || selectedPayroll.status !== "SENT") return;
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPayrollId) return;
    setApproving(true);
    try {
      await approvePayroll(selectedPayrollId);
      setDialogOpen(false);
      setMessage({ type: "success", text: "Quyet toan thanh cong!" });
      setSelectedPayrollId(null);
      window.location.reload();
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Loi quyet toan" });
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tong hop luong</h2>
        <p className="text-gray-500 mt-1">Xem va quyet toan bang luong tu cac chi nhanh</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="border rounded-lg px-3 py-2">
          {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>Thang {i+1}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} className="border rounded-lg px-3 py-2">
          {Array.from({length:5},(_,i)=>{const y=new Date().getFullYear()-2+i;return <option key={y} value={y}>{y}</option>;})}
        </select>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type==="success"?"bg-green-50 text-green-700 border border-green-200":"bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-32 text-red-600 gap-2 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[...Array(3)].map((_,i)=><Skeleton key={i} className="h-16 w-full"/>)}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-gray-800">Danh sach bang luong da gui</h3>
            {payrolls.length===0?(
              <div className="text-center py-8 text-gray-400 bg-white border rounded-lg">Khong co du lieu</div>
            ):(
              payrolls.map(p=>{
                const total=(p.details||[]).reduce((s,d)=>s+(parseFloat(d.salary)||0),0);
                const storeName=p.store?.name_store||`CN #${p.store_id}`;
                return (
                  <Card key={p.id} className={`cursor-pointer hover:shadow-md transition-shadow ${selectedPayrollId===p.id?"ring-2 ring-blue-500":""}`} onClick={()=>handleSelectPayroll(p.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{storeName}</p>
                          <p className="text-sm text-gray-500">Thang {p.month}/{p.year}</p>
                        </div>
                        <Badge variant={p.status==="APPROVED"?"success":"default"} className={p.status==="APPROVED"?"bg-green-100 text-green-700":"bg-blue-100 text-blue-700"}>
                          {p.status==="APPROVED"?"Da quyet toan":"Cho quyet toan"}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-gray-800 mt-2">{fm(total)}</p>
                      <p className="text-xs text-gray-500">{(p.details||[]).length} nhan vien</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Chi tiet bang luong</h3>
              {selectedPayroll && selectedPayroll.status==="SENT" && (
                <Button onClick={handleOpenDialog} className="bg-green-600 hover:bg-green-700 gap-2">
                  <Landmark className="w-4 h-4" />
                  Quyet toan ngan hang
                </Button>
              )}
            </div>
            <HQPayrollTable payroll={selectedPayroll} loading={detailLoading} />
          </div>
        </div>
      )}

      <HQBankSettlementDialog
        open={dialogOpen}
        onClose={()=>setDialogOpen(false)}
        payroll={selectedPayroll}
        onApprove={handleApprove}
        approving={approving}
      />
    </div>
  );
}
