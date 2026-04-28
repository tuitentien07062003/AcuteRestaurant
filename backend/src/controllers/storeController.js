import { Store } from "../models/Store.js";
import { Employee } from "../models/Employee.js";
import { SalesSummary } from "../models/SalesSummary.js";
import { Op } from "sequelize";
import storeCacheService from "../services/storeCacheService.js";

export const getAllStores = async (req, res) => {
    try {
        const cachedData = await storeCacheService.get();
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const stores = await Store.findAll();
        
        if (!stores) {
            return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
        }

        await storeCacheService.set(stores);
        res.status(200).json(stores);
    }
    catch (error) {
        console.error("Lỗi khi lấy thông tin cửa hàng:", error);
        res.status(500).json({ message: 'GetAllStores Error', error: error.message });
    }
};

export const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await Store.findByPk(id, {
            include: [
                {
                    model: Employee,
                    as: 'employees',
                    where: { role: 'SM' },
                    required: false
                },
                {
                    model: SalesSummary,
                    required: false,
                    limit: 7,
                    order: [['sales_date', 'DESC']]
                }
            ]
        });

        if (!store) {
            return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
        }

        res.status(200).json(store);
    }
    catch (error) {
        console.error("Lỗi khi lấy thông tin cửa hàng:", error);
        res.status(500).json({ message: 'GetStoreById Error', error: error.message });
    }
};

export const getStoreSalesSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const { from, to } = req.query;

        const whereClause = { store_id: id };
        if (from && to) {
            whereClause.sales_date = {
                [Op.between]: [from, to]
            };
        } else if (from) {
            whereClause.sales_date = {
                [Op.gte]: from
            };
        } else if (to) {
            whereClause.sales_date = {
                [Op.lte]: to
            };
        }

        const summaries = await SalesSummary.findAll({
            where: whereClause,
            order: [['sales_date', 'DESC']]
        });

        res.status(200).json(summaries);
    }
    catch (error) {
        console.error("Lỗi khi lấy sales summary:", error);
        res.status(500).json({ message: 'GetStoreSalesSummary Error', error: error.message });
    }
};

export const updateStore = async (req, res) => {
    try {
        const { address, city, hotline, tier } = req.body;
        const [updated] = await Store.update(
            { address, city, hotline, tier },
            { where: { id: req.params.id }, returning: true }
        );
        if (updated === 0) {
            return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
        }
        res.status(200).json({ message: 'Thông tin cửa hàng đã được cập nhật!' });

        await storeCacheService.invalidate();
    }
    catch (error) {
        console.error("Lỗi khi cập nhật thông tin cửa hàng:", error);
        res.status(500).json({ message: 'UpdateStore Error', error: error.message });
    }
};

export const updateStoreSalesSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.params;
        const { forecast, total_hours, labor_cost } = req.body;

        const summary = await SalesSummary.findOne({
            where: { store_id: id, sales_date: date }
        });

        if (!summary) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu doanh thu cho ngày này" });
        }

        const net_sales = parseFloat(summary.net_sales) || 0;
        const newForecast = forecast !== undefined ? parseFloat(forecast) : (parseFloat(summary.forecast) || 0);
        const newTotalHours = total_hours !== undefined ? parseFloat(total_hours) : (parseFloat(summary.total_hours) || 0);
        const newLaborCost = labor_cost !== undefined ? parseFloat(labor_cost) : (parseFloat(summary.labor_cost) || 0);

        const labor_percent = net_sales > 0 ? parseFloat(((newLaborCost / net_sales) * 100).toFixed(2)) : 0;
        const store_target_percent = newForecast > 0 ? parseFloat(((net_sales / newForecast) * 100).toFixed(2)) : 0;

        await summary.update({
            forecast: newForecast,
            total_hours: newTotalHours,
            labor_cost: newLaborCost,
            labor_percent,
            store_target_percent
        });

        res.status(200).json(summary);
    } catch (error) {
        console.error("Lỗi khi cập nhật sales summary:", error);
        res.status(500).json({ message: 'UpdateStoreSalesSummary Error', error: error.message });
    }
};
