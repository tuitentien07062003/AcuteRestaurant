import cacheService from './cacheService.js';

// Cache configuration for invoices
const INVOICE_PREFIX = 'invoices:store';
const CACHE_TTL = 3600; // 1 hour

class InvoiceCacheService {
    /**
     * Get cached invoices for store
     * @param {string|number} storeId 
     * @returns {Promise<any|null>}
     */
    async get(storeId) {
        const key = `${INVOICE_PREFIX}:${storeId}`;
        return await cacheService.get(key);
    }

    /**
     * Cache invoices
     * @param {string|number} storeId 
     * @param {any} data 
     * @param {number} ttl 
     */
    async set(storeId, data, ttl = CACHE_TTL) {
        const key = `${INVOICE_PREFIX}:${storeId}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Invalidate specific store invoices
     * @param {string|number} storeId 
     */
    async invalidate(storeId) {
        const key = `${INVOICE_PREFIX}:${storeId}`;
        return await cacheService.delete(key);
    }

    /**
     * Invalidate all invoices
     */
    async invalidateAll() {
        return await cacheService.deleteByPattern(`${INVOICE_PREFIX}:*`);
    }
}

export default new InvoiceCacheService();

