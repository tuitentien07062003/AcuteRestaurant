import cacheService from './cacheService.js';

// Cache configuration for payment requests
const REQUEST_PREFIX = 'payment_requests:store';
const CACHE_TTL = 1800; // 30 minutes

class PaymentRequestCacheService {
    /**
     * Get cached payment requests for store
     * @param {string|number} storeId 
     * @returns {Promise<any|null>}
     */
    async get(storeId) {
        const key = `${REQUEST_PREFIX}:${storeId}`;
        return await cacheService.get(key);
    }

    /**
     * Cache payment requests
     * @param {string|number} storeId 
     * @param {any} data 
     * @param {number} ttl 
     */
    async set(storeId, data, ttl = CACHE_TTL) {
        const key = `${REQUEST_PREFIX}:${storeId}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Invalidate for specific store
     * @param {string|number} storeId 
     */
    async invalidate(storeId) {
        const key = `${REQUEST_PREFIX}:${storeId}`;
        return await cacheService.delete(key);
    }

    /**
     * Invalidate all payment requests
     */
    async invalidateAll() {
        return await cacheService.deleteByPattern(`${REQUEST_PREFIX}:*`);
    }
}

export default new PaymentRequestCacheService();

