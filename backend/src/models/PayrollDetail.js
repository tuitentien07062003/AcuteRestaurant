import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Employee } from "./Employee.js";
import { Payroll } from "./Payroll.js";

export const PayrollDetail = sequelize.define(
  "payroll_detail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payroll_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Payroll,
        key: "id",
      },
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Employee,
        key: "id",
      },
    },
    total_hours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(7, 2),
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    is_fulltime: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payroll_detail",
    timestamps: false,
    underscored: false,
  }
);

// Thiết lập quan hệ (Associations)
Payroll.hasMany(PayrollDetail, { foreignKey: "payroll_id", as: "details" });
PayrollDetail.belongsTo(Payroll, { foreignKey: "payroll_id", as: "payroll" });

Employee.hasMany(PayrollDetail, { foreignKey: "employee_id", as: "payroll_details" });
PayrollDetail.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });