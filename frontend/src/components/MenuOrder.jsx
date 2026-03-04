import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import useInit from "@/hooks/useInit"
import { GlobalContext } from "@/context/GlobalContext"
import { initMenuOrder } from "@/init/menuOrderInit"

export default function MenuOrder({ category, onAdd }) {
  const ctx = useContext(GlobalContext);
  const { menu } = ctx;
  const [loading, setLoading] = useState(false);
  const [lastCategory, setLastCategory] = useState(null);
  const navigate = useNavigate();

  // load data when category changes
  useInit(() => {
    if (!category) {
      console.log("[MenuOrder] No category yet");
      return;
    }
    // Only fetch if category changed
    if (lastCategory === category) {
      console.log("[MenuOrder] Category unchanged, skipping fetch");
      return;
    }
    console.log("[MenuOrder] Category changed to:", category);
    setLoading(true);
    initMenuOrder(ctx, category)
      .catch(e => console.error("[MenuOrder] Error:", e))
      .finally(() => {
        setLastCategory(category);
        setLoading(false);
      });
  }, [category]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#0077b6] animate-spin mb-3" />
        <p className="text-[#0077b6] font-medium">Đang tải món ăn...</p>
      </div>
    );
  }

  const foods = menu || [];
  
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {foods.map((item) => (
          <Card 
            key={item.id} 
            className="shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-[#0077b6]/30"
          >
            
            {/* Image */}
            <div className="relative bg-gray-50 p-3 overflow-hidden">
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-28 object-contain transition-transform duration-300 group-hover:scale-110" 
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0077b6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <CardContent className="flex flex-col justify-between p-3 space-y-2">
              {/* Tên món có line clamp + Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-[#0077b6] transition-colors text-sm min-h-[2.5rem]">
                    {item.name}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="text-xs font-medium bg-[#0077b6] text-white">
                  {item.name}
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center justify-between">
                <p className="font-bold text-[#0077b6] text-base">
                  {Number(item.price).toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-0">
              <Button 
                className="w-full cursor-pointer rounded-none h-11 bg-gradient-to-r from-[#0077b6] to-[#0096c7] hover:from-[#006699] hover:to-[#0077b6] gap-2 font-medium transition-all duration-300"
                onClick={() => onAdd(item)}
              >
                <ShoppingCart size={16} />
                <span>Thêm món</span>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {foods.length === 0 && (
          <div className="col-span-2 xl:col-span-4 flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingCart size={48} className="mb-3 opacity-30" />
            <p className="text-lg">Không có món ăn nào</p>
            <p className="text-sm mt-1">Chọn danh mục khác để xem món</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

