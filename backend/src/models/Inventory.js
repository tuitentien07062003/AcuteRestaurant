import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Inventory = sequelize.define(
  "inventory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    min_stock: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "inventory",
    timestamps: false,
    underscored: false,
  }
);

// Nếu sau này bạn có bảng InventoryLog (Lịch sử xuất/nhập kho) hoặc Recipe (Công thức món ăn), 
// bạn có thể thiết lập quan hệ (Associations) ở đây. Ví dụ:
// Inventory.hasMany(InventoryLog, { foreignKey: "inventory_id", as: "logs" });