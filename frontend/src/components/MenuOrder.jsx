import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMenuItems } from "@/hooks/useMenuItems";

export default function MenuOrder({ category, onAdd }) {
  const navigate = useNavigate();
  const {
    data: foods = [],
    isLoading,
    error,
    isError,
  } = useMenuItems(category);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#F97316] animate-spin mb-3" />
        <p className="text-[#F97316] font-medium">Đang tải món ăn...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-600 font-medium">Lỗi tải món ăn</p>
        <p className="text-gray-500 text-sm mt-2">
          {error?.message || "Vui lòng thử lại"}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      {/* Tăng số cột lên 5 để tối ưu không gian */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {foods.map((item) => (
          <Card
            key={item.id}
            className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-slate-200 hover:border-orange-200 bg-white rounded-xl"
          >
            {/* Image - Tăng chiều cao lên h-36 */}
            <div className="relative bg-slate-50 p-2 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-36 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <CardContent className="flex flex-col justify-between p-3 space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-semibold text-slate-800 line-clamp-2 cursor-pointer hover:text-[#F97316] transition-colors text-sm min-h-[2.5rem] leading-snug">
                    {item.name}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="text-xs font-medium bg-slate-800 text-white">
                  {item.name}
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center justify-between pt-1">
                <p className="font-bold text-[#F97316] text-base">
                  {Number(item.price).toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-0">
              <Button
                className="w-full cursor-pointer rounded-none rounded-b-xl h-10 bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white gap-2 font-semibold transition-all duration-300"
                onClick={() => onAdd(item)}
              >
                <ShoppingCart size={16} />
                <span>Thêm món</span>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {foods.length === 0 && (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 flex flex-col items-center justify-center py-20 text-slate-400">
            <ShoppingCart size={48} className="mb-3 opacity-30" />
            <p className="text-lg">Không có món ăn nào</p>
            <p className="text-sm mt-1">Chọn danh mục khác để xem món</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
