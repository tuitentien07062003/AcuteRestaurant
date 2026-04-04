import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Store } from "./Store.js";
import { Inventory } from "./Inventory.js";
import { Employee } from "./Employee.js";

export const Stock = sequelize.define(
  "stock",
  {
    store_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Store,
        key: "id",
      },
    },
    item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Inventory,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    updated_by: {
      type: DataTypes.UUID,
      references: {
        model: Employee,
        key: "id",
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "stock",
    timestamps: false,
  }
);

// ==========================================
// THIẾT LẬP MỐI QUAN HỆ (ASSOCIATIONS)
// Bắt buộc phải có để dùng được cú pháp 'include' trong Service/Controller
// ==========================================

// 1. Nối với Employee để lấy tên người cập nhật (Fix lỗi 500)
Stock.belongsTo(Employee, {
  foreignKey: "updated_by",
  as: "updatedBy", // Tên này phải khớp chính xác với alias bạn gọi trong phần include của stockService
});

// 2. Nối với Inventory để lấy thông tin Tên, Đơn vị của vật tư (Cần cho Frontend)
Stock.belongsTo(Inventory, {
  foreignKey: "item_id",
  // Không đặt 'as' thì Sequelize mặc định sẽ dùng tên Model là 'Inventory' (khớp với code frontend của bạn)
});

// 3. Nối với Store (Dự phòng cho các query sau này)
Stock.belongsTo(Store, {
  foreignKey: "store_id",
});
