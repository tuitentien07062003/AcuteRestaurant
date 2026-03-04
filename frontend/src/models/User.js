import { DataTypes } from "sequelize";
import { Employee } from "./Employee.js";
import { sequelize } from "../config/db.js";

export const User = sequelize.define("users", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4,
         primaryKey: true 
    },
    employee_id: { 
        type: DataTypes.UUID,
        allowNull:false,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    username: { 
        type: DataTypes.STRING(50), 
        allowNull:false,
        unique:true 
    },
    password: { 
        type: DataTypes.STRING(255), 
        allowNull:false 
    },
    last_login: { 
        type: DataTypes.DATE 
    },
    active: { 
        type: DataTypes.BOOLEAN, 
        defaultValue:true 
    },
    created_at: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    }
},{
    tableName:"users",
    timestamps:false
});

Employee.hasOne(User, { foreignKey: "employee_id", as: "user" });
User.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });