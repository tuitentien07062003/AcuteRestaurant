import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const PosHeader = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dữ liệu từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://acuterestaurant.onrender.com/acute/menu-categories",
          { withCredentials: true }
        );
        setCategories(res.data);
        setActive(res.data[0].code);
        onCategoryChange(res.data[0].code);
      } catch (error) {
        console.log("Lỗi tải danh mục:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading)
    return <div className="text-center py-4 text-[#0077b6]">Đang tải...</div>;

  return (
  <div className="flex justify-between items-center max-h-15 overflow-x-auto py-3 px-2 bg-gray-50 rounded-lg shadow-sm">
    {categories.map((item) => (
      <Button
        key={item.id}
        onClick={() => { 
          setActive(item.code);
          onCategoryChange(item.code);
        }}
        variant="ghost" 
        className={`min-w-[70px] px-6 py-3 rounded-xl border shadow-sm
          transition-all text-black dark:text-white cursor-pointer
          ${active === item.code 
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
