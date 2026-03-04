import { DataTypes } from "sequelize";
import { Employee } from "./Employee.js";
import { sequelize } from "../config/db.js";

export const Timesheet = sequelize.define("timesheet", {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true,
         primaryKey: true 
    },
    employee_id: { 
        type: DataTypes.UUID,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    work_day: { 
        type: DataTypes.DATE,
    },
    check_in: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
    check_out: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
    total_hours: { 
        type: DataTypes.DECIMAL(5,2), 
        defaultValue: 0 
    },
    created_at: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    }
},{
    tableName: "timesheet",
    timestamps: false
});

Employee.hasMany(Timesheet, { foreignKey: "employee_id", as: "timesheet" });
Timesheet.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });