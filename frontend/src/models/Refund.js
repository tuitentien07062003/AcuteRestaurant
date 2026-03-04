import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Refund = sequelize.define("refund", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  bill_order_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
  },
  refund_by: {
    type: DataTypes.UUID,
  },
}, {
  tableName: "refund",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
});
