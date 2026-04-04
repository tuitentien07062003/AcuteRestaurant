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