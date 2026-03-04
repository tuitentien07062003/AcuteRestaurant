import React, { useContext } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "@/context/GlobalContext";

const PosHeader = ({ onCategoryChange }) => {
  const { categories, activeCategory } = useContext(GlobalContext);
  const navigate = useNavigate();
  if (categories.length === 0) {
    return <div className="text-center py-4 text-[#0077b6]">Đang tải...</div>;
  }

  return (
    <div className="flex justify-between items-center max-h-15 overflow-x-auto py-3 px-2 bg-gray-50 rounded-lg shadow-sm">
      {categories.map((item) => (
        <Button
          key={item.id}
          onClick={() => {
            onCategoryChange(item.code);
          }}
          variant="ghost"
          className={`min-w-[70px] px-6 py-3 rounded-xl border shadow-sm
            transition-all text-black dark:text-white cursor-pointer
            ${activeCategory === item.code
              ? "bg-[#0077b6] text-white scale-105 hover:bg-[#006699]"
              : "bg-white hover:bg-gray-200 dark:bg-white dark:text-black"}
          `}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};

export default PosHeader;

