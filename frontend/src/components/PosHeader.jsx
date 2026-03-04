import React, { useContext } from "react";
import { Button } from "./ui/button";
import { GlobalContext } from "@/context/GlobalContext";

const PosHeader = ({ onCategoryChange }) => {
  const { categories, activeCategory } = useContext(GlobalContext);

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-[#0077b6]">
          <div className="w-6 h-6 border-2 border-[#0077b6] border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải danh mục...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((item, index) => (
          <button
            key={item.id || item.code}
            onClick={() => onCategoryChange(item.code)}
            className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform ${
              activeCategory === item.code
                ? "bg-gradient-to-r from-[#0077b6] to-[#0096c7] text-white shadow-lg shadow-[#0077b6]/30 scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-[#0077b6]/30 hover:text-[#0077b6]"
            }`}
          >
            <span className="flex items-center gap-2">
              {item.emoji && <span className="text-lg">{item.emoji}</span>}
              {item.name}
            </span>
          </button>
        ))}
      </div>
      
      {/* Decorative line */}
      <div className="mt-3 h-0.5 bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-transparent rounded-full opacity-50"></div>
    </div>
  );
};

export default PosHeader;

