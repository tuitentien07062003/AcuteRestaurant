import { sequelize } from "../config/db.js";
import { BillOrder } from "../models/BillOrder.js";
import { DetailOrder } from "../models/DetailOrder.js";
import { MenuItem } from "../models/MenuItem.js";
import { Voucher } from "../models/Voucher.js";
import { Op } from "sequelize";

export const createBillOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const employee_id = req.user?.employee_id || req.session?.user?.employee_id;

    if (!employee_id) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const {
      store_id,
      voucher_id,
      payment_method,
      items,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Đơn hàng trống" });
    }

    const menuId = items.map(i => i.menu_item_id);;
    const menuItems = await MenuItem.findAll({
        where: { id: menuId },
        attributes: ["id", "price"],
        transaction: t
    });

    const menuMap = new Map(
        menuItems.map(i => [i.id, Number(i.price)])
    );

    let total_amount = 0;
    let discount_amount = 0;
    let voucher = null;

    for (const item of items) {
        const price = menuMap.get(item.menu_item_id);
        if (!price) {
            await t.rollback();
            return res.status(400).json({ message: `Món ăn với ID ${item.menu_item_id} không tồn tại` });
        }
        total_amount += price * item.qty;
    }

    if (voucher_id) {
        voucher = await Voucher.findByPk(voucher_id, { transaction: t });

        if (!voucher || !voucher.active) {
            await t.rollback();
            return res.status(400).json({ message: "Voucher không hợp lệ"});
        }

        if (voucher.discount_percent) {
            discount_amount = total_amount * (voucher.discount_percent / 100);
        }

        if (voucher.discount_value) {
            discount_amount = voucher.discount_value;
        }

        discount_amount = Math.min(discount_amount, total_amount);
    }

    const bill = await BillOrder.create({
      store_id,
      employee_id,
      voucher_id,
      payment_method,
      total_amount,
      discount_amount,
      status: "Pending",
    }, { transaction: t });

    for (const item of items) {
        const price = menuMap.get(item.menu_item_id);
        const itemTotal = price * item.qty;

      await DetailOrder.create({
        bill_order_id: bill.id,
        menu_item_id: item.menu_item_id,
        quantity: item.qty,
        total_price: itemTotal,
      }, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order_id: bill.order_id,
      bill_id: bill.id,
    });

  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Create bill failed" });
  }
};

export const getBillOrders = async (req, res) => {
    try {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));

        const bills = await BillOrder.findAll({
            where: {
                created_at: {
                    [Op.between]: [start, end],
                },
            },
            order: [
                ["created_at", "DESC"]
            ],
        });
        res.status(200).json(bills);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch bill orders" });
    }
};

export const getBillOrderDetails = async (req, res) => {
    try {
        const { bill_id } = req.params;
        const bill = await BillOrder.findByPk(bill_id, {
            attributes: [
                "id",
                "order_id", 
                "store_id", 
                "employee_id", 
                "voucher_id", 
                "payment_method", 
                "total_amount", 
                "status", 
                "created_at"
            ],
        });

        if (!bill) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const details = await DetailOrder.findAll({
            where: { bill_order_id: bill_id },
            attributes: ["id", "quantity", "total_price"],
            include: [
                {
                    model: MenuItem,
                    attributes: ["id", "name"]
                }
            ]
        });
        res.status(200).json({ bill, details });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch bill order details" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const STATUS = ["Cooking", "Ready"];

        if (!STATUS.includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }

        const order = await BillOrder.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng " });
        }

        if (
            (order.status === "Pending" && status !== "Cooking") ||
            (order.status === "Cooking" && status !== "Ready")
        ) {
            return res.status(400).json({ message: "Không thể chuyển trạng thái" });
        }
        await order.update({status});

        return res.status(200).json({ message: "Chuyển trạng thái thành công!"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Update order status failed"});
    }
};

export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await BillOrder.findByPk(id);

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.status !== "Ready") {
      return res.status(400).json({
        message: "Chỉ có thể hoàn tất đơn ở trạng thái Ready",
      });
    }

    await order.update({ status: "Completed" });

    return res.json({
      message: "Đơn hàng đã hoàn tất",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Complete order failed",
    });
  }
};

