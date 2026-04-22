import { PaymentRequest } from "../models/PaymentRequest.js";
import { PaymentRequestDetail } from "../models/PaymentRequestDetail.js";
import { Employee } from "../models/Employee.js";
import { Store } from "../models/Store.js";
import { Op } from "sequelize";

export const getAllPaymentRequests = async (req, res) => {
  try {
    const { store_id, status, requester_id } = req.query;
    
    let whereClause = {};
    if (store_id) whereClause.store_id = store_id;
    if (status) whereClause.status = status;
    if (requester_id) whereClause.requester_id = requester_id;

    const requests = await PaymentRequest.findAll({
      where: whereClause,
      include: [
        { model: Store, as: "store", attributes: ["id", "name"] },
        { model: Employee, as: "requester", attributes: ["id", "full_name"] },
        { model: Employee, as: "reviewer", attributes: ["id", "full_name"] },
        { model: PaymentRequestDetail, as: "details" }
      ],
      order: [['request_date', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error("Lỗi lấy danh sách yêu cầu thanh toán:", error);
    res.status(500).json({ message: 'Get All PaymentRequests Error', error: error.message });
  }
};

export const getPaymentRequestById = async (req, res) => {
  try {
    const request = await PaymentRequest.findByPk(req.params.id, {
      include: [
        { model: Store, as: "store" },
        { model: Employee, as: "requester" },
        { model: Employee, as: "reviewer" },
        { model: PaymentRequestDetail, as: "details" }
      ]
    });
    !request
      ? res.status(404).json({ message: "Không tìm thấy yêu cầu thanh toán" })
      : res.json(request);
  } catch (error) {
    console.error("Lỗi lấy yêu cầu thanh toán:", error);
    res.status(500).json({ message: 'Get PaymentRequest ById Error', error: error.message });
  }
};

export const createPaymentRequest = async (req, res) => {
  const transaction = await PaymentRequest.sequelize.transaction();
  try {
    const { store_id, requester_id, reason, note, attachment_url, details } = req.body;

    if (!store_id || !requester_id || !reason || !details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin: store_id, requester_id, reason, details" });
    }

    // Check store/requester
    const store = await Store.findByPk(store_id, { transaction });
    const requester = await Employee.findByPk(requester_id, { transaction });
    if (!store || !requester) return res.status(404).json({ message: "Store hoặc requester không tồn tại" });

    // Compute total
    const total_amount = details.reduce((sum, d) => sum + (d.quantity * d.unit_price), 0);

    const request = await PaymentRequest.create({
      store_id,
      requester_id,
      reason,
      note: note || null,
      attachment_url: attachment_url || null,
      total_amount
    }, { transaction });

    // Details
    for (const detail of details) {
      await PaymentRequestDetail.create({
        request_id: request.id,
        item_name: detail.item_name,
        quantity: detail.quantity || 1,
        unit_price: detail.unit_price,
        invoice_photo_url: detail.invoice_photo_url,
        note: detail.note
      }, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: 'Yêu cầu thanh toán đã được tạo!', request: { id: request.id } });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi tạo yêu cầu thanh toán:", error);
    res.status(500).json({ message: 'Create PaymentRequest Error', error: error.message });
  }
};

export const updatePaymentRequestStatus = async (req, res) => {
  try {
    const { status, reviewer_id, note } = req.body;
    const allowed = ["PENDING", "SENT", "REJECTED", "PAID"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Status không hợp lệ" });
    }

    const updateData = { status };
    if (reviewer_id) updateData.reviewer_id = reviewer_id;
    if (note) updateData.note = note;
    updateData.reviewed_at = new Date();

    const [updated] = await PaymentRequest.update(updateData, {
      where: { id: req.params.id },
      returning: true
    });
    if (updated === 0) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    res.json({ message: `Yêu cầu đã được cập nhật trạng thái: ${status}` });
  } catch (error) {
    console.error("Lỗi cập nhật yêu cầu thanh toán:", error);
    res.status(500).json({ message: 'Update PaymentRequest Status Error', error: error.message });
  }
};

export const deletePaymentRequest = async (req, res) => {
  try {
    const deleted = await PaymentRequest.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu thanh toán" });
    }
    res.json({ message: "Yêu cầu thanh toán đã được xóa!" });
  } catch (error) {
    console.error("Lỗi xóa yêu cầu thanh toán:", error);
    res.status(500).json({ message: 'Delete PaymentRequest Error', error: error.message });
  }
};

