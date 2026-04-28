import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Landmark, Loader2, CheckCircle } from "lucide-react";

const fm = (a) => Number(a||0).toLocaleString("vi-VN")+" đ";

export default function HQBankSettlementDialog({open,onClose,payroll,onApprove,approving}){
  const [bn,setBn]=useState("Vietcombank");
  const [an,setAn]=useState("1234567890");
  const [ac,setAc]=useState("CONG TY TNHH NHÀ HÀNG ACUTE");
  const [de,setDe]=useState("Quyet toan luong T"+(payroll?.month||"")+"/"+(payroll?.year||""));
  const tot=(payroll?.details||[]).reduce((s,d)=>s+(parseFloat(d.salary)||0),0);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600"/>
            Quyet toan bang luong qua ngan hang
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">Tong tien can quyet toan</p>
            <p className="text-2xl font-bold text-blue-900">{fm(tot)}</p>
            <p className="text-xs text-blue-600 mt-1">{(payroll?.store?.name_store)||("CN #"+(payroll?.store_id))} - Thang {payroll?.month}/{payroll?.year}</p>
          </div>
          <div className="space-y-3">
            <div><p className="text-sm font-medium text-gray-700 mb-1">Ngan hang</p><Input value={bn} onChange={e=>setBn(e.target.value)}/></div>
            <div><p className="text-sm font-medium text-gray-700 mb-1">So tai khoan</p><Input value={an} onChange={e=>setAn(e.target.value)}/></div>
            <div><p className="text-sm font-medium text-gray-700 mb-1">Chu tai khoan</p><Input value={ac} onChange={e=>setAc(e.target.value)}/></div>
            <div><p className="text-sm font-medium text-gray-700 mb-1">Noi dung chuyen khoan</p><Input value={de} onChange={e=>setDe(e.target.value)}/></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huy</Button>
          <Button onClick={onApprove} disabled={approving} className="bg-green-600 hover:bg-green-700 gap-2">
            {approving?<Loader2 className="w-4 h-4 animate-spin"/>:<CheckCircle className="w-4 h-4"/>}
            Xac nhan quyet toan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
