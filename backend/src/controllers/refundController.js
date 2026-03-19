import { sequelize } from "../config/db.js";
import { BillOrder } from "../models/BillOrder.js";
import { Refund } from "../models/Refund.js";

export const refundOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const employee_id = req.session.user.employee_id;

        const bill = await BillOrder.findByPk(id, { transaction: t });

        if (!bill) {
            return res.status(404).json({ message: "Không tìm thấy đơn"});
        }

        if (bill.status !== "Completed") {
            return res.status(400).json({ message: "Chỉ được refund đơn đã hoàn thành"});
        }

        await Refund.create({
            bill_order_id: bill.id,
            refund_amount: bill.total_amount,
            reason,
            refund_by: employee_id,
        }, { transaction: t });

        await bill.update({ status: "Refund" }, { transaction: t});
        await t.commit();

        return res.json({ message: "Đã refund đơn hàng"});
    } catch (err) {
        await t.rollback();
        console.error(err);
        return res.status(500).json({ message: "Refund failed"});
    }
};

export const getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await BillOrder.findOne({
      where: { order_id },
    });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.status !== "Completed") {
      return res.status(400).json({
        message: "Chỉ được hoàn tiền đơn đã hoàn tất",
      });
    }

    return res.json({
      id: order.id,
      order_id: order.order_id,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      created_at: order.created_at,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Get order failed" });
  }
};
