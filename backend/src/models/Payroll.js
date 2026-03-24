import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Store } from "./Store.js";

export const Payroll = sequelize.define(
  "payroll",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Thêm allowNull: false nếu bắt buộc
      references: {
        model: Store,
        key: 'id'
      }
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2025,
      },
    },
    status: {
      type: DataTypes.ENUM("OPEN", "CALCULATED", "SENT", "APPROVED"),
      defaultValue: "OPEN",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payroll",
    timestamps: false,
    underscored: false,
  }
);

// Nếu có Store model, thiết lập quan hệ tại đây:
Store.hasMany(Payroll, { foreignKey: "store_id", as: "payrolls" });
Payroll.belongsTo(Store, { foreignKey: "store_id", as: "store" });