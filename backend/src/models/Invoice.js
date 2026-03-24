import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Store } from "./Store.js";
import { BillOrder } from "./BillOrder.js";

export const Invoice = sequelize.define(
  "invoice",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bill_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: BillOrder, key: "id" }
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Store, key: "id" }
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tax_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    company_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
    },
    invoice_date: {
      type: DataTypes.DATEONLY, // Chỉ lấy ngày theo chuẩn DATE trong SQL
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    vat_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 8.0,
    },
    vat_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    pdf_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    xml_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "invoice",
    timestamps: false,
  }
);