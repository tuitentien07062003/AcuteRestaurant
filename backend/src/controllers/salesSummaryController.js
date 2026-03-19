import { SalesSummary } from "../models/SalesSummary.js";

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
