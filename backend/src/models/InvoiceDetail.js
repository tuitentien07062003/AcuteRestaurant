import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Invoice } from "./Invoice.js";
import { MenuItem } from "./MenuItem.js";

export const InvoiceDetail = sequelize.define(
  "invoice_detail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoice_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Invoice,
        key: "id",
      },
    },
    menu_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MenuItem,
        key: "id",
      },
    },
    item_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    tableName: "invoice_detail",
    timestamps: false,
  }
);

// Associations
Invoice.hasMany(InvoiceDetail, { foreignKey: "invoice_id", as: "details" });
InvoiceDetail.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });

MenuItem.hasMany(InvoiceDetail, { foreignKey: "menu_item_id", as: "invoice_details" });
InvoiceDetail.belongsTo(MenuItem, { foreignKey: "menu_item_id", as: "menu_item" });