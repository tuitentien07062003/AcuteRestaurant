import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { PaymentRequest } from "./PaymentRequest.js";

export const PaymentRequestDetail = sequelize.define(
  "payment_request_detail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PaymentRequest,
        key: "id",
      },
    },
    item_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      // Trường này Database tự generate, Sequelize chỉ dùng để mapping khi Select
    },
    invoice_photo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "payment_request_detail",
    timestamps: false,
  }
);

// Associations
PaymentRequest.hasMany(PaymentRequestDetail, { foreignKey: "request_id", as: "details" });
PaymentRequestDetail.belongsTo(PaymentRequest, { foreignKey: "request_id", as: "payment_request" });