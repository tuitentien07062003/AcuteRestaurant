import { useState } from "react";
import axios from "axios";
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

 export default function InOut({ open, setOpen  }) {
    const [internalId, setInternalId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInOut = async () => {
      setLoading(true);
      try {
        const res = await axios.post("http://localhost:3000/acute/timesheet/check-in", {
          internal_id: internalId,
        }, { withCredentials: true });

        if (res.data.type === "CHECK_IN") {
            toast.success("Vào ca thành công");
        }
        if (res.data.type === "CHECK_OUT") {
            toast.success("Ra ca thành công. Thời gian làm việc: " + res.data.total_hours + " giờ");
        }

        setInternalId("");
        setOpen(false);
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