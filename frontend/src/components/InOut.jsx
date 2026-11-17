import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { formatHours } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { checkInOut } from "@/api/timesheet";
import { Delete, CornerDownLeft, Clock } from "lucide-react";

export default function InOut({ open, setOpen }) {
  const [internalId, setInternalId] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý khi bấm các phím số
  const handleNumClick = (num) => {
    if (internalId.length < 10) {
      setInternalId((prev) => prev + num);
    }
  };

  // Xử lý nút Clear (C)
  const handleClear = () => {
    setInternalId("");
  };

  // Xử lý nút Xóa lùi (Backspace)
  const handleBackspace = () => {
    setInternalId((prev) => prev.slice(0, -1));
  };

  // Xử lý khi xác nhận
  const handleInOut = async () => {
    if (!internalId) {
      toast.error("Vui lòng nhập mã nhân viên");
      return;
    }

    setLoading(true);
    try {
      const res = await checkInOut(internalId);
      if (res.type === "CHECK_IN") {
        toast.success("Vào ca thành công");
      }
      if (res.type === "CHECK_OUT") {
        toast.success(
          "Ra ca thành công. Thời gian làm việc: " +
            formatHours(res.total_hours),
        );
      }

      setInternalId("");
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // Hỗ trợ gõ bằng bàn phím vật lý (nếu có)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInOut();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Danh sách các phím số
  const numpad = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "C",
    "0",
    "Enter",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader className="items-center text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-[#F97316]" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Vào / Ra ca
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Nhập mã nhân viên để chấm công
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Khung hiển thị mã nhân viên */}
          <div className="relative">
            <input
              type="text"
              value={internalId}
              onChange={(e) => setInternalId(e.target.value.replace(/\D/g, ""))} // Chỉ cho phép nhập số
              onKeyDown={handleKeyDown}
              className="w-full h-16 text-center text-3xl font-mono font-bold tracking-widest bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-[#F97316] focus:bg-white transition-all text-slate-800 placeholder:text-slate-300"
              autoFocus
            />
            {internalId && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors p-2"
              >
                <Delete size={20} />
              </button>
            )}
          </div>

          {/* Bàn phím số (Numpad) */}
          <div className="grid grid-cols-3 gap-2">
            {numpad.map((key) => {
              if (key === "C") {
                return (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={handleClear}
                    className="h-14 text-lg font-bold bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700 rounded-xl transition-colors"
                  >
                    C
                  </Button>
                );
              }
              if (key === "Enter") {
                return (
                  <Button
                    key={key}
                    onClick={handleInOut}
                    disabled={loading || !internalId}
                    className="h-14 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl shadow-sm transition-colors"
                  >
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <CornerDownLeft size={22} />
                    )}
                  </Button>
                );
              }
              return (
                <Button
                  key={key}
                  variant="outline"
                  onClick={() => handleNumClick(key)}
                  className="h-14 text-xl font-semibold bg-white border-slate-200 hover:bg-orange-50 hover:border-orange-200 hover:text-[#F97316] text-slate-700 rounded-xl transition-all active:scale-95"
                >
                  {key}
                </Button>
              );
            })}
          </div>

          {/* Nút xác nhận (Dự phòng) */}
          <Button
            className="w-full h-12 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold rounded-xl text-base shadow-sm transition-all"
            onClick={handleInOut}
            disabled={loading || !internalId}
          >
            {loading ? "Đang xử lý..." : "Xác nhận (Enter)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
