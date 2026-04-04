import { Stock } from '../models/Stock.js';
import { StockLog } from '../models/StockLog.js';
import { Employee } from '../models/Employee.js';
import inventoryCacheService from './inventoryCacheService.js';
import stockCacheService from './stockCacheService.js';
import { sequelize } from '../config/db.js';

const REASON_DEFAULT = 'manual_adjustment';

/**
 * Stock Service - Business logic for stock management + auto logging
 */
class StockService {
    /**
     * Get stock for a store (from DB or cache)
     * @param {number} storeId - Store ID
     * @returns {Promise<Array|null>}
     */
    async getStock(storeId) {
        // Try cache first
        const cached = await stockCacheService.get(storeId);
        if (cached) return cached;

        // DB fetch
        const stocks = await Stock.findAll({
            where: { store_id: storeId },
            include: [
                { model: Employee, as: 'updatedBy', attributes: ['id', 'full_name'] },
                { model: Inventory }
            ]
        });

        // Cache it
        await stockCacheService.set(storeId, stocks);
        return stocks;
    }

    /**
     * Update stock quantity (auto create StockLog if changed)
     * @param {number} storeId 
     * @param {number} itemId 
     * @param {number} newQuantity 
     * @param {string} userId - UUID from req.user.id
     * @param {string} [reason='manual_adjustment'] 
     * @returns {Promise<{success: boolean, logId?: number, error?: string}>}
     */
    async updateStock(storeId, itemId, newQuantity, userId, reason = REASON_DEFAULT) {
        if (newQuantity < 0) {
            return { success: false, error: 'Quantity cannot be negative' };
        }

        const transaction = await sequelize.transaction();
        try {
            // Validate user
            const user = await Employee.findByPk(userId, { transaction });
            if (!user) {
                return { success: false, error: 'Invalid user ID' };
            }

            // Get current stock
            const currentStock = await Stock.findOne({
                where: { store_id: storeId, item_id: itemId },
                transaction
            });

            const oldQty = currentStock ? currentStock.quantity : 0;
            if (oldQty === newQuantity) {
                await transaction.commit();
                return { success: true, message: 'No change needed' };
            }

            const newQty = newQuantity;

            // Create log if changed
            const log = await StockLog.create({
                store_id: storeId,
                item_id: itemId,
                old_qty: oldQty,
                new_qty: newQty,
                changed_by: userId,
                changed_at: new Date()
            }, { transaction });
            const logId = log.id;

            // Update or create stock
            await Stock.upsert({
                store_id: storeId,
                item_id: itemId,
                quantity: newQty,
                updated_by: userId,
                updated_at: new Date()
            }, { transaction });

            // Invalidate caches
            await stockCacheService.invalidate(storeId);
            await inventoryCacheService.invalidate();

            await transaction.commit();
            console.log(`[STOCK UPDATED] Store:${storeId}, Item:${itemId}, ${oldQty}→${newQty}, Log:${logId}, By:${userId}`);
            return { success: true, logId };
        } catch (error) {
            await transaction.rollback();
            console.error('[STOCK UPDATE ERROR]:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Bulk update stocks (with logs)
     * @param {Array} updates - [{itemId, newQuantity}]
     * @param {number} storeId
     * @param {string} userId
     */
    async bulkUpdate(storeId, updates, userId) {
        const results = [];
        for (const update of updates) {
            const result = await this.updateStock(storeId, update.itemId, update.newQuantity, userId);
            results.push(result);
        }
        return { success: results.every(r => r.success), results };
    }
}

export default new StockService();

