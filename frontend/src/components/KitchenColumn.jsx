import KitchenCard from "./KitchenCard";

export default function KitchenColumn({ title, orders, onReload }) {
  return (
    <div className="flex flex-col bg-white rounded-xl shadow h-full">
      <div className="text-center font-bold py-3 border-b bg-gray-100 ">
        {title}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {orders.map(order => (
          <KitchenCard
            key={order.id}
            order={order}
            status={order.status}
            onReload={onReload}
          />
        ))}
      </div>
    </div>
  );
}
