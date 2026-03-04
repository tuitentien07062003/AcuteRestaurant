import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { MenuCategory } from "./MenuCategory.js";

export const MenuItem = sequelize.define("menu_item", {
    id: { 
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    category_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    name: { 
        type: DataTypes.STRING(150), 
        allowNull: false 
    },
    description: DataTypes.TEXT,
    price: { 
        type: DataTypes.DECIMAL(9,2),
         allowNull: false 
        },
    image_url: DataTypes.TEXT,
    active: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
    }
}, {
    tableName: "menu_item",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

MenuCategory.hasMany(MenuItem, { foreignKey: "category_id", as: "items" });
MenuItem.belongsTo(MenuCategory, { foreignKey: "category_id", as: "category" });
