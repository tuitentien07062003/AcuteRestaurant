import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const MenuCategory = sequelize.define(
  "menu_category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
},
{
    tableName: "menu_category",
    timestamps: false,
    underscored: false,
}
);