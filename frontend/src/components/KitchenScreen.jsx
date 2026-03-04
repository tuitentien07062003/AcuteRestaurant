import { useContext } from "react";
import KitchenColumn from "./KitchenColumn";
import useInit from "@/hooks/useInit";
import { GlobalContext } from "@/context/GlobalContext";
import { initKitchen } from "@/init/kitchenInit";

export default function KitchenScreen() {
  const ctx = useContext(GlobalContext);

  useInit(() => {
    if (!ctx.bills || ctx.bills.length === 0) {
      initKitchen(ctx).catch(e => console.error("[KitchenScreen] Error:", e));
    }
  }, []);

  const orders = ctx.bills;

  return (
    <div className="h-full grid grid-cols-3 gap-3 p-3">
      <KitchenColumn
        title="Chờ xử lý"
        titleColor="text-yellow-600"
        bgColor="bg-yellow-50"
        orders={orders.filter(o => o.status === "Pending")}
        onReload={() => initKitchen(ctx)}
      />
      <KitchenColumn
        title="Đang nấu"
        titleColor="text-blue-600"
        bgColor="bg-blue-50"
        orders={orders.filter(o => o.status === "Cooking")}
        onReload={() => initKitchen(ctx)}
      />
      <KitchenColumn
        title="Hoàn thành"
        titleColor="text-green-600"
        bgColor="bg-green-50"
        orders={orders.filter(o => o.status === "Ready")}
        onReload={() => initKitchen(ctx)}
      />
    </div>
  );
}

