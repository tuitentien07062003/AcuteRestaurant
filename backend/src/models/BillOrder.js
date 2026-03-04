import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';    

export const BillOrder = sequelize.define('bill_order', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    order_id: {
        type: DataTypes.STRING(20),
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.UUID,
    },
    voucher_id: {
        type: DataTypes.UUID,
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    payment_method: {
        type: DataTypes.STRING(4), // Cash | Momo
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Pending' // Pending | Completed | Ready | Refunded
    }
}, {
    tableName: 'bill_order',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});