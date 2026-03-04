import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
 } from "./ui/dialog";
import { checkInOut } from "@/api/timesheet";

 export default function InOut({ open, setOpen  }) {
    const [internalId, setInternalId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInOut = async () => {
      setLoading(true);
      try {
        try {
        const res = await checkInOut(internalId);
        if (res.type === "CHECK_IN") {
            toast.success("Vào ca thành công");
        }
        if (res.type === "CHECK_OUT") {
            toast.success("Ra ca thành công. Thời gian làm việc: " + res.total_hours + " giờ");
        }

        setInternalId("");
        setOpen(false);
      } catch (err) {
        throw err;
      }
      } catch (err) {
        toast.error( err.response?.data?.message || "Có lỗi xảy ra.",
        );
      } finally {
        setLoading(false);
      };
    };

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Ra/Vào ca</DialogTitle>
                <DialogDescription>
                  Vui lòng nhập mã nhân viên để ra/vào ca
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <Input
                    type="number"
                    placeholder="Nhập mã nhân viên"
                    value={internalId}
                    onChange={(e) => setInternalId(e.target.value)}
                    autoFocus
                />

                <Button
                    className="w-full bg-[#0077b6] hover:bg-[#006699] cursor-pointer"
                    onClick={handleInOut}
                    disabled={loading || !internalId}
                >
                    {loading ? "Đang xử lý..." : "Xác nhận"}
                </Button>
            </div>
            </DialogContent>
        </Dialog>
      );
}