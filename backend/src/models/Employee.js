import { DataTypes } from "sequelize";
import { Store } from "./Store.js";
import { sequelize } from "../config/db.js";

export const Employee = sequelize.define(
  "employee",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    internal_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true,
    },

    employee_id: {
      type: DataTypes.STRING(12),
      unique: true,
    },

    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("SM","SUP","CREW","CREW_TRAINER","CREW_LEADER","HQ"),
      defaultValue: "CREW",
    },

    type: {
      type: DataTypes.ENUM("part-time", "full-time"),
      defaultValue: "part-time",
    },

    base_salary: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
    },

    hourly_rate: {
      type: DataTypes.DECIMAL(7,2),
      allowNull: true,
    },

    contract_end: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: Store,
        key: 'id'
      }
    }
  },

  {
    tableName: "employee",
    timestamps: false,
    underscored: false,
  }
);

Store.hasMany(Employee, { foreignKey: 'store_id', as: 'employees' });
Employee.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });