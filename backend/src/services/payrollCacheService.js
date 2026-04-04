import cacheService from './cacheService.js';

// Cache configuration for payroll
const PAYROLL_PREFIX = 'payroll:store';
const CACHE_TTL = 3600; // 1 hour

class PayrollCacheService {
    /**
     * Get cached payroll for store/month/year
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     * @returns {Promise<any|null>}
     */
    async get(storeId, month, year) {
        const key = `${PAYROLL_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.get(key);
    }

    /**
     * Cache payroll
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     * @param {any} data 
     * @param {number} ttl 
     */
    async set(storeId, month, year, data, ttl = CACHE_TTL) {
        const key = `${PAYROLL_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Invalidate specific payroll
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     */
    async invalidate(storeId, month, year) {
        const key = `${PAYROLL_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.delete(key);
    }

    /**
     * Invalidate all payroll for store
     */
    async invalidateStore(storeId) {
        return await cacheService.deleteByPattern(`${PAYROLL_PREFIX}:${storeId}:*`);
    }

    /**
     * Invalidate all payroll caches
     */
    async invalidateAll() {
        return await cacheService.deleteByPattern(`${PAYROLL_PREFIX}:*`);
    }
}

export default new PayrollCacheService();

