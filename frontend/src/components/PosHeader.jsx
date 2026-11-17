import React from "react";

const PosHeader = ({
  categories = [],
  activeCategory,
  onCategoryChange,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2 text-[#F97316]">
          <div className="w-5 h-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-sm">Đang tải danh mục...</span>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="text-slate-500">Không có danh mục</span>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((item) => (
          <button
            key={item.id || item.code}
            onClick={() => onCategoryChange(item.code)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeCategory === item.code
                ? "bg-[#F97316] text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-[#F97316] hover:border-orange-200"
            }`}
          >
            <span className="flex items-center gap-2">
              {item.emoji && <span>{item.emoji}</span>}
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PosHeader;
