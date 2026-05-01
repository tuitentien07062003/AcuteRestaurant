import { SalesSummary } from "../models/SalesSummary.js";
import { getForecastFromAI, triggerForecastTraining } from "../services/forecastService.js";

export const getDailySales = async (req, res) => {
    try {
        const { store_id, date } = req.query;

        const data = await SalesSummary.findOne({
            where: {
                store_id,
                sales_date: date,
            },
        });

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /api/sales/forecast
 * Lấy dự báo doanh thu từ AI Service
 */
export const getSalesForecast = async (req, res) => {
    try {
        const { store_id, days = 7 } = req.query;
        if (!store_id) {
            return res.status(400).json({ message: "Thiếu store_id" });
        }
        const forecast = await getForecastFromAI(parseInt(store_id), parseInt(days));
        res.json(forecast);
    } catch (err) {
        console.error("[getSalesForecast] Lỗi:", err.message);
        res.status(500).json({ message: err.message || "Lỗi dự báo doanh thu" });
    }
};

/**
 * POST /api/sales/forecast/train
 * Trigger train model thủ công
 */
export const trainSalesForecast = async (req, res) => {
    try {
        const { store_id } = req.body;
        if (!store_id) {
            return res.status(400).json({ message: "Thiếu store_id" });
        }
        const result = await triggerForecastTraining(parseInt(store_id));
        res.json(result);
    } catch (err) {
        console.error("[trainSalesForecast] Lỗi:", err.message);
        res.status(500).json({ message: err.message || "Lỗi train model" });
    }
};
