import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Store = sequelize.define(
  "store",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },

    name_store: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    hotline: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    tier: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
},

  {
    tableName: "store",
    timestamps: false,
    underscored: false,
  }
);
