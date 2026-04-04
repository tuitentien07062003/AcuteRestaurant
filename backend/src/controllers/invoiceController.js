import { Invoice } from "../models/Invoice.js";
import { InvoiceDetail } from "../models/InvoiceDetail.js";
import { BillOrder } from "../models/BillOrder.js";
import { Store } from "../models/Store.js";
import { MenuItem } from "../models/MenuItem.js";
import { Op } from "sequelize";
import invoiceCacheService from "../services/invoiceCacheService.js";
import Joi from 'joi';

export const getAllInvoices = async (req, res) => {
  try {
    const { store_id, start_date, end_date } = req.query;
    
    let whereClause = {};
    if (store_id) whereClause.store_id = store_id;
    if (start_date || end_date) {
      whereClause.invoice_date = {};
      if (start_date) whereClause.invoice_date[Op.gte] = start_date;
      if (end_date) whereClause.invoice_date[Op.lte] = end_date;
    }

    const cacheKey = `invoices:${store_id || 'all'}:${start_date || 'all'}:${end_date || 'all'}`;
    let invoices = await invoiceCacheService.get(store_id || 'all');

    if (!invoices) {
      invoices = await Invoice.findAll({
        where: whereClause,
        include: [
          { model: Store, as: "store", attributes: ["id", "name"] },
          { model: BillOrder, as: "bill", attributes: ["id", "bill_code"] },
          { model: InvoiceDetail, as: "details" }
        ],
        order: [['created_at', 'DESC']]
      });
      await invoiceCacheService.set(store_id || 'all', invoices);
    }

    res.json(invoices);
  } catch (error) {
    console.error("Lỗi lấy danh sách hóa đơn:", error);
    res.status(500).json({ message: 'Get All Invoices Error', error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Store, as: "store", attributes: ["id", "name"] },
        { model: BillOrder, as: "bill", attributes: ["id", "bill_code"] },
        { model: InvoiceDetail, as: "details", include: [{ model: MenuItem, as: "menu_item" }] }
      ]
    });
    !invoice
      ? res.status(404).json({ message: "Không tìm thấy hóa đơn" })
      : res.json(invoice);
  } catch (error) {
    console.error("Lỗi lấy hóa đơn:", error);
    res.status(500).json({ message: 'Get Invoice ById Error', error: error.message });
  }
};

export const createInvoice = async (req, res) => {
  const transaction = await Invoice.sequelize.transaction();
  try {
    const { bill_id, store_id, customer_name, company_name, tax_code, company_address, email, details } = req.body;

    if (!bill_id || !customer_name || !email || !details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc: bill_id, customer_name, email, details" });
    }

    // Check bill exists
    const bill = await BillOrder.findByPk(bill_id, { transaction });
    if (!bill) return res.status(404).json({ message: "Bill không tồn tại" });

    // Compute totals from details
    const subtotal = details.reduce((sum, d) => sum + (d.quantity * d.unit_price), 0);
    const vat_amount = subtotal * (req.body.vat_rate || 0.08);
    const total_amount = subtotal + vat_amount;

    // Generate invoice_number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Date.now().toString().slice(-4);
    const invoice_number = `INV-${dateStr}-${seq}`;

    const invoice = await Invoice.create({
      bill_id,
      store_id,
      customer_name,
      company_name,
      tax_code,
      company_address,
      email,
      invoice_number,
      invoice_date: new Date().toISOString().slice(0, 10),
      subtotal,
      vat_rate: req.body.vat_rate || 8.0,
      vat_amount,
      total_amount,
      status: 'Pending'  // Default status theo yêu cầu
    }, { transaction });

    // Create details
    for (const detail of details) {
      await InvoiceDetail.create({
        invoice_id: invoice.id,
        menu_item_id: detail.menu_item_id,
        item_name: detail.item_name,
        quantity: detail.quantity,
        unit_price: detail.unit_price,
        total_price: detail.quantity * detail.unit_price
      }, { transaction });
    }

    await transaction.commit();
    await invoiceCacheService.invalidateAll();
    res.status(201).json({ message: 'Hóa đơn đã được tạo!', invoice: { id: invoice.id, invoice_number } });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi tạo hóa đơn:", error);
    res.status(500).json({ message: 'Create Invoice Error', error: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const updated = await Invoice.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });
    if (updated[0] === 0) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }
    await invoiceCacheService.invalidateAll();
    res.json({ message: "Hóa đơn đã được cập nhật!" });
  } catch (error) {
    console.error("Lỗi cập nhật hóa đơn:", error);
    res.status(500).json({ message: 'Update Invoice Error', error: error.message });
  }
};

export const updateApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status phải là Pending/Approved/Rejected' });
    }

    const [updated] = await Invoice.update({ 
      status, 
      approved_by: req.user.id,
      approved_at: new Date()
    }, {
      where: { id: req.params.id },
      returning: true
    });

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    await invoiceCacheService.invalidateAll();
    res.json({ message: `Hóa đơn đã được ${status.toLowerCase()}` });
  } catch (error) {
    console.error("Lỗi approval hóa đơn:", error);
    res.status(500).json({ message: 'Update Approval Error', error: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const deleted = await Invoice.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }
    await invoiceCacheService.invalidateAll();
    res.json({ message: "Hóa đơn đã được xóa!" });
  } catch (error) {
    console.error("Lỗi xóa hóa đơn:", error);
    res.status(500).json({ message: 'Delete Invoice Error', error: error.message });
  }
};

