import cacheService from './cacheService.js';

// Shared cache patterns for financial data
const PAYMENT_PREFIX = 'payment_requests:store';
const PAYROLL_PREFIX = 'payroll:store';
const CACHE_TTL = 3600; // 1 hour

class FinanceCacheService {
    /**
     * Invalidate payment request cache for store
     * @param {string|number} storeId 
     * @returns {Promise<boolean>}
     */
    async invalidatePayments(storeId) {
        const key = `${PAYMENT_PREFIX}:${storeId}`;
        return await cacheService.delete(key);
    }

    /**
     * Invalidate all payment requests
     */
    async invalidateAllPayments() {
        return await cacheService.deleteByPattern(`${PAYMENT_PREFIX}:*`);
    }

    /**
     * Invalidate payroll cache for store/month/year
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     */
    async invalidatePayroll(storeId, month, year) {
        const key = `${PAYROLL_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.delete(key);
    }

    /**
     * Invalidate all payroll for store
     * @param {string|number} storeId 
     */
    async invalidatePayrollStore(storeId) {
        return await cacheService.deleteByPattern(`${PAYROLL_PREFIX}:${storeId}:*`);
    }

    /**
     * Invalidate all finance caches (payments + payroll)
     */
    async invalidateAll() {
        const deleted1 = await cacheService.deleteByPattern(`${PAYMENT_PREFIX}:*`);
        const deleted2 = await cacheService.deleteByPattern(`${PAYROLL_PREFIX}:*`);
        return deleted1 + deleted2;
    }
}

export default new FinanceCacheService();

