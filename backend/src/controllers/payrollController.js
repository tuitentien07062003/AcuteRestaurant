import { Payroll } from "../models/Payroll.js";
import { PayrollDetail } from "../models/PayrollDetail.js";
import { Employee } from "../models/Employee.js";
import { Store } from "../models/Store.js";
import { SalesSummary } from "../models/SalesSummary.js";
import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
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
          { model: Store, as: "store", attributes: ["id", "name_store"] },
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

// Lấy tóm tắt lương ngày hôm nay (nhân viên đã check-in)
export const getDailySalarySummary = async (req, res) => {
  try {
    const { date, store_id } = req.query;
    
    if (!date || !store_id) {
      return res.status(400).json({ message: "Thiếu date hoặc store_id" });
    }

    // Kiểm tra cache trước
    let cached = await payrollCacheService.getDailySummary(store_id, date);
    if (cached) {
      return res.json(cached);
    }

    // Convert timezone để query đúng ngày
    const timesheets = await sequelize.query(`
      SELECT 
        t.employee_id,
        e.id,
        e.full_name,
        e.hourly_rate,
        e.type,
        e.role,
        COUNT(*) as shift_count,
        SUM(CASE WHEN t.check_out IS NOT NULL THEN t.total_hours ELSE 0 END) as total_hours,
        SUM(CASE WHEN t.check_out IS NULL THEN 0 ELSE (t.total_hours * e.hourly_rate) END) as estimated_salary,
        MIN(t.check_in) as first_check_in,
        MAX(CASE WHEN t.check_out IS NOT NULL THEN t.check_out ELSE NULL END) as last_check_out
      FROM timesheet t
      JOIN employee e ON t.employee_id = e.id
      WHERE DATE(t.work_day) = DATE(:date)
        AND e.active = true
      GROUP BY t.employee_id, e.id, e.full_name, e.hourly_rate, e.type, e.role
      ORDER BY e.full_name
    `, {
      replacements: { date },
      type: sequelize.QueryTypes.SELECT
    });

    // Lấy dữ liệu doanh thu
    const salesData = await SalesSummary.findOne({
      where: { store_id, sales_date: date },
      attributes: ['net_sales', 'labor_percent', 'labor_cost']
    });

    // Tính toán tổng
    const totalHours = timesheets.reduce((sum, t) => sum + (parseFloat(t.total_hours) || 0), 0);
    const totalPartTimeSalary = timesheets
      .filter(t => t.type === 'part-time')
      .reduce((sum, t) => sum + (parseFloat(t.estimated_salary) || 0), 0);

    const netSales = parseFloat(salesData?.net_sales) || 0;
    const laborPercent = parseFloat(salesData?.labor_percent) || 10;
    const expectedLaborCost = (netSales * laborPercent) / 100;

    const actualPercent = netSales > 0 ? ((totalPartTimeSalary / netSales) * 100).toFixed(2) : 0;
    const percentageDifference = (actualPercent - laborPercent).toFixed(2);

    const result = {
      date,
      totalHours: parseFloat(totalHours).toFixed(2),
      totalPartTimeSalary: parseFloat(totalPartTimeSalary).toFixed(2),
      netSales: parseFloat(netSales).toFixed(2),
      expectedLaborPercent: laborPercent,
      actualLaborPercent: parseFloat(actualPercent),
      percentageDifference: parseFloat(percentageDifference),
      employees: timesheets,
      employeeCount: timesheets.length
    };

    // Cache kết quả
    await payrollCacheService.setDailySummary(store_id, date, result);

    res.json(result);
  } catch (error) {
    console.error("Lỗi lấy tóm tắt lương ngày:", error);
    res.status(500).json({ message: 'Get Daily Salary Summary Error', error: error.message });
  }
};

// Lấy danh sách timesheets nhân viên part-time trong ngày
export const getEmployeeDayTimesheets = async (req, res) => {
  try {
    const { date, store_id, page = 1, limit = 20 } = req.query;
    
    if (!date || !store_id) {
      return res.status(400).json({ message: "Thiếu date hoặc store_id" });
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const timesheets = await sequelize.query(`
      SELECT 
        t.id,
        t.employee_id,
        e.id as emp_id,
        e.full_name,
        e.employee_id as employee_code,
        e.type,
        e.hourly_rate,
        t.check_in,
        t.check_out,
        t.total_hours,
        CASE WHEN t.check_out IS NOT NULL THEN (t.total_hours * e.hourly_rate) ELSE NULL END as daily_salary
      FROM timesheet t
      JOIN employee e ON t.employee_id = e.id
      WHERE DATE(t.work_day) = DATE(:date)
        AND e.type = 'part-time' 
        AND e.active = true
      ORDER BY t.check_in DESC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { date, limit: parseInt(limit), offset },
      type: sequelize.QueryTypes.SELECT
    });

    const totalCount = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM timesheet t
      JOIN employee e ON t.employee_id = e.id
      WHERE DATE(t.work_day) = DATE(:date)
        AND e.type = 'part-time' 
        AND e.active = true
    `, {
      replacements: { date },
      type: sequelize.QueryTypes.SELECT
    });

    const total = totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    const result = {
      timesheets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    };

    res.json(result);
  } catch (error) {
    console.error("Lỗi lấy danh sách timesheets ngày:", error);
    res.status(500).json({ message: 'Get Employee Day Timesheets Error', error: error.message });
  }
};

// Lấy tóm tắt lương tháng
export const getMonthlySalarySummary = async (req, res) => {
  try {
    const { month, year, store_id } = req.query;

    console.log('getMonthlySalarySummary called with:', { month, year, store_id });

    if (!month || !year || !store_id) {
      return res.status(400).json({ message: "Thiếu month, year hoặc store_id" });
    }

    // Kiểm tra cache trước
    try {
      let cached = await payrollCacheService.getMonthlySummary(store_id, month, year);
      if (cached) {
        console.log('Returning cached data');
        return res.json(cached);
      }
    } catch (cacheError) {
      console.warn('Cache read error:', cacheError);
    }

    // Lấy payroll record
    const payroll = await Payroll.findOne({
      where: { month, year, store_id },
      include: [{
        model: PayrollDetail,
        as: 'details',
        include: [{ model: Employee, as: 'employee', attributes: ['full_name', 'type', 'hourly_rate'] }]
      }]
    });

    if (payroll) {
      console.log('Found existing payroll record');
      
      // Lọc chỉ lấy part-time
      const partTimeDetails = payroll.details.filter(d => !d.is_fulltime);
      const partTimeTotalHours = partTimeDetails.reduce((sum, d) => sum + (parseFloat(d.total_hours) || 0), 0);
      const partTimeTotalSalary = partTimeDetails.reduce((sum, d) => sum + (parseFloat(d.salary) || 0), 0);
      const employeeCount = partTimeDetails.length;

      // Lấy doanh thu tháng từ SalesSummary
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const salesData = await sequelize.query(`
        SELECT 
          COALESCE(SUM(net_sales), 0) as total_revenue,
          COALESCE(AVG(labor_percent), 10) as labor_percent
        FROM sales_summary
        WHERE store_id = :storeId 
          AND sales_date >= DATE(:startDate)
          AND sales_date <= DATE(:endDate)
      `, {
        replacements: { startDate, endDate, storeId: store_id },
        type: sequelize.QueryTypes.SELECT
      });

      const totalRevenue = parseFloat(salesData[0]?.total_revenue) || 0;
      const expectedLaborPercent = parseFloat(salesData[0]?.labor_percent) || 10;
      const laborPercent = totalRevenue > 0 ? ((partTimeTotalSalary / totalRevenue) * 100).toFixed(2) : 0;

      const result = {
        payrollId: payroll.id,
        month: payroll.month,
        year: payroll.year,
        status: payroll.status,
        totalHours: partTimeTotalHours.toFixed(2),
        totalSalary: partTimeTotalSalary.toFixed(2),
        partTimeTotalHours: partTimeTotalHours.toFixed(2),
        partTimeSalary: partTimeTotalSalary.toFixed(2),
        employeeCount,
        totalRevenue: totalRevenue.toFixed(2),
        laborPercent,
        expectedLaborPercent,
        employeeDetails: partTimeDetails.map(d => ({
          id: d.id,
          employeeId: d.employee_id,
          employeeName: d.employee?.full_name,
          type: d.is_fulltime ? 'full-time' : 'part-time',
          totalHours: parseFloat(d.total_hours || 0).toFixed(2),
          hourlyRate: parseFloat(d.hourly_rate || 0).toFixed(2),
          salary: parseFloat(d.salary || 0).toFixed(2)
        }))
      };

      await payrollCacheService.setMonthlySummary(store_id, month, year, result);
      return res.json(result);
    }

    // Tính toán từ timesheet
    console.log('No payroll record found, calculating from timesheet data');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    console.log('Querying data for:', { 
      startDate: startDate.toISOString().split('T')[0], 
      endDate: endDate.toISOString().split('T')[0], 
      storeId: store_id 
    });

    try {
      // Lấy dữ liệu nhân viên part-time
      const partTimeData = await sequelize.query(`
        SELECT
          e.id as employee_id,
          e.full_name,
          e.type,
          e.hourly_rate,
          e.role,
          COALESCE(SUM(CASE WHEN t.check_out IS NOT NULL THEN t.total_hours ELSE 0 END), 0) as total_hours,
          COALESCE(SUM(CASE WHEN t.check_out IS NOT NULL THEN (t.total_hours * e.hourly_rate) ELSE 0 END), 0) as total_salary
        FROM employee e
        LEFT JOIN timesheet t ON e.id = t.employee_id
          AND DATE(t.work_day) >= DATE(:startDate)
          AND DATE(t.work_day) <= DATE(:endDate)
        WHERE e.active = true AND e.store_id = :storeId AND e.type = 'part-time'
        GROUP BY e.id, e.full_name, e.type, e.hourly_rate, e.role
        HAVING COALESCE(SUM(CASE WHEN t.check_out IS NOT NULL THEN t.total_hours ELSE 0 END), 0) > 0
        ORDER BY e.full_name
      `, {
        replacements: { startDate, endDate, storeId: store_id },
        type: sequelize.QueryTypes.SELECT
      });

      // Lấy dữ liệu doanh thu tháng từ SalesSummary
      const salesData = await sequelize.query(`
        SELECT 
          COALESCE(SUM(net_sales), 0) as total_revenue,
          COALESCE(AVG(labor_percent), 10) as labor_percent
        FROM sales_summary
        WHERE store_id = :storeId 
          AND sales_date >= DATE(:startDate)
          AND sales_date <= DATE(:endDate)
      `, {
        replacements: { startDate, endDate, storeId: store_id },
        type: sequelize.QueryTypes.SELECT
      });

      const totalRevenue = parseFloat(salesData[0]?.total_revenue) || 0;
      const expectedLaborPercent = parseFloat(salesData[0]?.labor_percent) || 10;

      // Tính tổng part-time
      const partTimeTotalHours = partTimeData.reduce((sum, emp) => sum + (parseFloat(emp.total_hours) || 0), 0);
      const partTimeTotalSalary = partTimeData.reduce((sum, emp) => sum + (parseFloat(emp.total_salary) || 0), 0);

      // Tính % chi phí lương / doanh thu
      const laborPercent = totalRevenue > 0 ? ((partTimeTotalSalary / totalRevenue) * 100).toFixed(2) : 0;

      if (!partTimeData || partTimeData.length === 0) {
        console.log('No part-time employee data found, returning empty result');
        const emptyResult = {
          payrollId: null,
          month: parseInt(month),
          year: parseInt(year),
          status: 'CALCULATED',
          totalHours: '0.00',
          totalSalary: '0.00',
          partTimeTotalHours: '0.00',
          partTimeSalary: '0.00',
          employeeCount: 0,
          totalRevenue: '0.00',
          laborPercent: '0.00',
          expectedLaborPercent,
          employeeDetails: []
        };
        try {
          await payrollCacheService.setMonthlySummary(store_id, month, year, emptyResult);
        } catch (cacheError) {
          console.warn('Cache write error for empty result:', cacheError);
        }
        return res.json(emptyResult);
      }

      const result = {
        payrollId: null,
        month: parseInt(month),
        year: parseInt(year),
        status: 'CALCULATED',
        totalHours: partTimeTotalHours.toFixed(2),
        totalSalary: partTimeTotalSalary.toFixed(2),
        partTimeTotalHours: partTimeTotalHours.toFixed(2),
        partTimeSalary: partTimeTotalSalary.toFixed(2),
        employeeCount: partTimeData.length,
        totalRevenue: totalRevenue.toFixed(2),
        laborPercent: laborPercent,
        expectedLaborPercent,
        employeeDetails: partTimeData.map(emp => ({
          id: null,
          employeeId: emp.employee_id,
          employeeName: emp.full_name || 'Unknown',
          type: emp.type || 'part-time',
          totalHours: (parseFloat(emp.total_hours) || 0).toFixed(2),
          hourlyRate: (parseFloat(emp.hourly_rate) || 0).toFixed(2),
          salary: (parseFloat(emp.total_salary) || 0).toFixed(2)
        }))
      };

      console.log('Final result:', result);
      try {
        await payrollCacheService.setMonthlySummary(store_id, month, year, result);
      } catch (cacheError) {
        console.warn('Cache write error:', cacheError);
      }
      res.json(result);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      res.status(500).json({ message: 'Database query error', error: queryError.message });
    }
  } catch (error) {
    console.error("Lỗi lấy tóm tắt lương tháng:", error);
    res.status(500).json({ message: 'Get Monthly Salary Summary Error', error: error.message });
  }
};