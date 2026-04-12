import stockService from '../services/stockService.js';
import inventoryCacheService from '../services/inventoryCacheService.js';
import stockCacheService from '../services/stockCacheService.js';
import { Stock } from '../models/Stock.js';
import { Inventory } from '../models/Inventory.js';
import Joi from 'joi';

const updateSchema = Joi.object({
    quantity: Joi.number().min(0).required()
});

export const getStockByStore = async (req, res) => {
    try {
        const storeId = parseInt(req.params.storeId);
        if (isNaN(storeId)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }
        const stocks = await stockService.getStock(storeId);
        res.json(stocks || []);
    } catch (error) {
        console.error('Get stock error:', error);
        res.status(500).json({ message: 'Get Stock Error', error: error.message });
    }
};

export const updateStockItem = async (req, res) => {
    try {
        const { storeId, itemId } = req.params;
        const { error: validationError, value } = updateSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError.details[0].message });
        }

        const { quantity } = value;

        const userId = req.user.employee_id; // From auth middleware

        const result = await stockService.updateStock(
            parseInt(storeId), 
            parseInt(itemId), 
            quantity, 
            userId
        );

        if (!result.success) {
            return res.status(result.error === 'No change needed' ? 200 : 400).json({ 
                message: result.error || 'Update failed' 
            });
        }

        res.json({ 
            message: 'Stock updated successfully', 
            logId: result.logId,
            newQuantity: quantity 
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ message: 'Update Stock Error', error: error.message });
    }
};

export const bulkUpdateStock = async (req, res) => {
    try {
        const storeId = parseInt(req.params.storeId);
        if (isNaN(storeId)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }
        const userId = req.user.id;
        const updates = req.body.updates || []; // [{itemId, quantity, reason}]

        const result = await stockService.bulkUpdate(storeId, updates, userId);
        res.json({ success: result.success, results: result.results });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({ message: 'Bulk Update Error', error: error.message });
    }
};

