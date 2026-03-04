// models/SalesSummary.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Store } from "./Store.js";

export const SalesSummary = sequelize.define(
  "sales_summary",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Store,
        key: "id",
      },
    },
    sales_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    basic_sales: DataTypes.DECIMAL(12, 2),
    discount_amount: DataTypes.DECIMAL(10, 2),
    vat: DataTypes.DECIMAL(10, 2),
    net_sales: DataTypes.DECIMAL(12, 2),
    cash: DataTypes.DECIMAL(12, 2),
    momo: DataTypes.DECIMAL(12, 2),
    bill_count: DataTypes.INTEGER,

    forecast: DataTypes.DECIMAL(12, 2),
    total_hours: DataTypes.DECIMAL(6, 2),
    labor_cost: DataTypes.DECIMAL(12, 2),
    labor_percent: DataTypes.FLOAT,

    store_target: DataTypes.DECIMAL,
    store_target_percent: DataTypes.FLOAT,
  },
  {
    tableName: "sales_summary",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["store_id", "sales_date"],
      },
    ],
  }
);

Store.hasMany(SalesSummary, { foreignKey: "store_id" });
SalesSummary.belongsTo(Store, { foreignKey: "store_id" });
