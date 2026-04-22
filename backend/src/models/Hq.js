import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Hq = sequelize.define(
  "hq",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },


    role: {
      type: DataTypes.STRING(2),
      defaultValue: "HQ",
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },

  {
    tableName: "hq",
    timestamps: false,
    underscored: false,
  }
);