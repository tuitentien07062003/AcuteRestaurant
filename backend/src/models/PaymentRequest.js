import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Employee } from "./Employee.js";
import { Store } from "./Store.js";

export const PaymentRequest = sequelize.define(
  "payment_request",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Store, key: "id" }
    },
    requester_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Employee,
        key: "id",
      },
    },
    reviewer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Employee,
        key: "id",
      },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "SENT", "REJECTED", "PAID"),
      defaultValue: "PENDING",
    },
    request_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachment_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payment_request",
    timestamps: false,
  }
);

// Associations
Employee.hasMany(PaymentRequest, { foreignKey: "requester_id", as: "requests_made" });
PaymentRequest.belongsTo(Employee, { foreignKey: "requester_id", as: "requester" });

Employee.hasMany(PaymentRequest, { foreignKey: "reviewer_id", as: "requests_reviewed" });
PaymentRequest.belongsTo(Employee, { foreignKey: "reviewer_id", as: "reviewer" });

Store.hasMany(PaymentRequest, { foreignKey: "store_id", as: "payment_requests" });
PaymentRequest.belongsTo(Store, { foreignKey: "store_id", as: "store" });