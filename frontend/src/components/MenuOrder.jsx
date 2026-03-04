import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ShoppingCart } from "lucide-react"
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

  if (loading)
    return <div className="text-center py-4 text-[#0077b6]">Đang tải...</div>;

  const foods = menu || [];
  
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-3">

        {foods.map(item => (
          <Card key={item.id} className="shadow hover:shadow-lg transition overflow-hidden">
            
            {/* Image */}
            <img src={item.image_url} className="w-full h-32 object-contain px-2" />

            <CardContent className="flex justify-between items-center px-3 space-y-1">

              {/* Tên món có line clamp + Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="max-w-24 text-sm line-clamp-2 cursor-pointer">
                    {item.name}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="text-xs font-medium">
                  {item.name}
                </TooltipContent>
              </Tooltip>

              <p className="font-bold text-right text-sm">
                {Number(item.price).toLocaleString("vi-VN")} ₫
              </p>
            </CardContent>

            <CardFooter className="p-0">
              <Button 
                className="w-full cursor-pointer rounded-none bg-[#0077b6] hover:bg-[#006699] gap-2"
                onClick={() => onAdd(item)}
              >
                <ShoppingCart size={16} />
              </Button>
            </CardFooter>
          </Card>
        ))}

      </div>
    </TooltipProvider>
  )
}