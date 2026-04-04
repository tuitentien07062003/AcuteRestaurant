import { Payroll } from "../models/Payroll.js";
import { PayrollDetail } from "../models/PayrollDetail.js";
import { Employee } from "../models/Employee.js";
import { Store } from "../models/Store.js";
import { Op } from "sequelize";
import payrollCacheService from "../services/payrollCacheService.js";
import financeCacheService from "../services/financeCacheService.js";
import Joi from 'joi';

export const getAllPayrolls = async (req, res) => {
  try {
    const { store_id, month, year } = req.query;
    
    let whereClause = {};
    if (store_id) whereClause.store_id = store_id;
    if (month) whereClause.month = month;
    if (year) whereClause.year = year;

    let payrolls = await payrollCacheService.get(store_id, month, year);

    if (!payrolls) {
      payrolls = await Payroll.findAll({
        where: whereClause,
        include: [
          { model: Store, as: "store", attributes: ["id", "name"] },
          { model: PayrollDetail, as: "details", include: [{ model: Employee, as: "employee", attributes: ["id", "full_name"] }] }
        ],
        order: [['year', 'DESC'], ['month', 'DESC']]
      });

      await payrollCacheService.set(store_id, month, year, payrolls);
    }

    res.json(payrolls);
  } catch (error) {
    console.error("Lỗi lấy danh sách bảng lương:", error);
    res.status(500).json({ message: 'Get All Payroll Error', error: error.message });
  }
};

export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [
        { model: Store, as: "store" },
        { model: PayrollDetail, as: "details", include: [{ model: Employee, as: "employee" }] }
      ]
    });
    !payroll
      ? res.status(404).json({ message: "Không tìm thấy bảng lương" })
      : res.json(payroll);
  } catch (error) {
    console.error("Lỗi lấy bảng lương:", error);
    res.status(500).json({ message: 'Get Payroll ById Error', error: error.message });
  }
};

export const createPayroll = async (req, res) => {
  const transaction = await Payroll.sequelize.transaction();
  try {
    const { store_id, month, year, details } = req.body;

    if (!store_id || !month || !year) {
      return res.status(400).json({ message: "Thiếu store_id, month, year" });
    }
    if (month < 1 || month > 12 || year < 2025) {
      return res.status(400).json({ message: "Tháng không hợp lệ (1-12), năm từ 2025" });
    }

    // Check existing
    const existing = await Payroll.findOne({ where: { store_id, month, year }, transaction });
    if (existing) return res.status(400).json({ message: "Bảng lương tháng/năm/store đã tồn tại" });

    const payroll = await Payroll.create({
      store_id,
      month,
      year,
      status: "OPEN"
    }, { transaction });

    // Optional details
    if (details && Array.isArray(details)) {
      for (const detail of details) {
        await PayrollDetail.create({
          payroll_id: payroll.id,
          employee_id: detail.employee_id,
          total_hours: detail.total_hours,
          hourly_rate: detail.hourly_rate,
          salary: detail.salary,
          is_fulltime: detail.is_fulltime
        }, { transaction });
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'Bảng lương đã được tạo!', payroll: { id: payroll.id } });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi tạo bảng lương:", error);
    res.status(500).json({ message: 'Create Payroll Error', error: error.message });
  }
};

export const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["OPEN", "CALCULATED", "SENT", "APPROVED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Status không hợp lệ" });
    }

    const [updated] = await Payroll.update({ status }, {
      where: { id: req.params.id },
      returning: true
    });
    if (updated === 0) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }
    res.json({ message: `Bảng lương đã chuyển trạng thái: ${status}` });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái bảng lương:", error);
    res.status(500).json({ message: 'Update Payroll Status Error', error: error.message });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    const deleted = await Payroll.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }
    res.json({ message: "Bảng lương đã được xóa!" });
  } catch (error) {
    console.error("Lỗi xóa bảng lương:", error);
    res.status(500).json({ message: 'Delete Payroll Error', error: error.message });
  }
};

