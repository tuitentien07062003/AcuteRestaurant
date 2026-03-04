import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { BillOrder } from "./BillOrder.js";
import { MenuItem } from "./MenuItem.js";

export const DetailOrder = sequelize.define("detail_order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bill_order_id: {
    type: DataTypes.UUID,
    references: {
      model: BillOrder,
      key: "id",
    },
  },
  menu_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: "detail_order",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
});

BillOrder.hasMany(DetailOrder, {
  foreignKey: "bill_order_id",
  as: "items",
});

DetailOrder.belongsTo(BillOrder, {
  foreignKey: "bill_order_id",
});

MenuItem.hasMany(DetailOrder, {
  foreignKey: "menu_item_id",
  as: "orderItems",
});

DetailOrder.belongsTo(MenuItem, {
  foreignKey: "menu_item_id",
});