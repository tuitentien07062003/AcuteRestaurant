import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Store } from "./Store.js";
import { Inventory } from "./Inventory.js";
import { Employee } from "./Employee.js";

export const StockLog = sequelize.define(
  "stock_log",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Store,
        key: "id",
      },
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Inventory,
        key: "id",
      },
    },
    old_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    new_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    changed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Employee,
        key: "id",
      },
    },
    changed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "stock_log",
    timestamps: false, // Vì bạn đã dùng changed_at thay cho updatedAt/createdAt
  }
);

// --- Thiết lập quan hệ (Associations) ---

// Log thuộc về một Cửa hàng
StockLog.belongsTo(Store, {
  foreignKey: "store_id",
  as: "store",
});

// Log thuộc về một Sản phẩm
StockLog.belongsTo(Inventory, {
  foreignKey: "item_id",
  as: "item",
});

// Log được thực hiện bởi một Nhân viên
StockLog.belongsTo(Employee, {
  foreignKey: "changed_by",
  as: "editor",
});

// Thiết lập quan hệ ngược (Tùy chọn)
Store.hasMany(StockLog, { foreignKey: "store_id" });
Inventory.hasMany(StockLog, { foreignKey: "item_id" });
Employee.hasMany(StockLog, { foreignKey: "changed_by" });