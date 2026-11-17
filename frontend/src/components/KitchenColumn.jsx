import { useState } from "react";
import KitchenCard from "./KitchenCard";

export default function KitchenColumn({
  title,
  count,
  orders,
  onReload,
  statusColor,
  bgColor,
  borderColor,
  onDragStart,
  onDrop,
  allowDrop,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl shadow-sm border ${borderColor} h-full overflow-hidden`}
      onDragOver={(e) => {
        if (allowDrop) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (allowDrop) onDrop();
      }}
    >
      {/* Header Cột */}
      <div
        className={`${bgColor} px-4 py-3 border-b ${borderColor} flex justify-between items-center`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        </div>
        <span className="bg-white px-2.5 py-0.5 rounded-full text-sm font-bold text-slate-600 shadow-sm border border-slate-100">
          {count}
        </span>
      </div>

      {/* Danh sách thẻ Bill */}
      <div
        className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${isDragOver ? "bg-slate-100/50" : ""}`}
      >
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <p className="text-sm">Không có đơn nào</p>
          </div>
        ) : (
          orders.map((order) => (
            <KitchenCard
              key={order.id}
              order={order}
              status={order.status}
              onReload={onReload}
              onDragStart={() => onDragStart(order.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
