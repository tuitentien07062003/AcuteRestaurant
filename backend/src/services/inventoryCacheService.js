import cacheService from './cacheService.js';

// Cache configuration for inventory
const CACHE_KEY = 'inventory:all';
const CACHE_TTL = 1800; // 30 minutes

class InventoryCacheService {
    /**
     * Get cached inventories
     * @returns {Promise<any|null>}
     */
    async get() {
        return await cacheService.get(CACHE_KEY);
    }

    /**
     * Cache inventories
     * @param {any} data - Data to cache
     * @param {number} ttl - TTL in seconds (optional)
     * @returns {Promise<boolean>}
     */
    async set(data, ttl = CACHE_TTL) {
        return await cacheService.set(CACHE_KEY, data, ttl);
    }

    /**
     * Invalidate inventory cache
     * @returns {Promise<boolean>}
     */
    async invalidate() {
        return await cacheService.delete(CACHE_KEY);
    }
}

export default new InventoryCacheService();

