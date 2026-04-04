import cacheService from './cacheService.js';

// Cache configuration for stock (per store)
const STOCK_PREFIX = 'stock:store';
const CACHE_TTL = 1800; // 30 minutes

class StockCacheService {
    /**
     * Get cached stock for a specific store
     * @param {string|number} storeId - Store ID
     * @returns {Promise<any|null>}
     */
    async get(storeId) {
        const key = `${STOCK_PREFIX}:${storeId}`;
        return await cacheService.get(key);
    }

    /**
     * Cache stock for a store
     * @param {string|number} storeId - Store ID
     * @param {any} data - Stock data
     * @param {number} ttl - TTL (optional)
     * @returns {Promise<boolean>}
     */
    async set(storeId, data, ttl = CACHE_TTL) {
        const key = `${STOCK_PREFIX}:${storeId}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Invalidate stock cache for a specific store
     * @param {string|number} storeId - Store ID
     * @returns {Promise<boolean>}
     */
    async invalidate(storeId) {
        const key = `${STOCK_PREFIX}:${storeId}`;
        return await cacheService.delete(key);
    }

    /**
     * Invalidate all stock caches (all stores)
     * @returns {Promise<number>}
     */
    async invalidateAll() {
        return await cacheService.deleteByPattern(`${STOCK_PREFIX}:*`);
    }
}

export default new StockCacheService();

