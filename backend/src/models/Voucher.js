import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Voucher = sequelize.define(
  "voucher",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },

    discount_value: {
      type: DataTypes.DECIMAL(8, 2),
    },

    discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
    },

    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },

  {
    tableName: "voucher",
    timestamps: false,
    underscored: false,
  }
);
