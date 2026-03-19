import cacheService from './cacheService.js';

// Cache configuration for menu categories
const CACHE_KEY = 'menu:categories';
const CACHE_TTL = 1800; // 5 minutes

/**
 * Cache service for Menu Category
 * Each controller has its own cache service with specific CACHE_KEY and CACHE_TTL
 */
class MenuCategoryCacheService {
    /**
     * Get cached menu categories
     * @returns {Promise<any|null>}
     */
    async get() {
        return await cacheService.get(CACHE_KEY);
    }

    /**
     * Cache menu categories
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in seconds (optional)
     */
    async set(data, ttl = CACHE_TTL) {
        return await cacheService.set(CACHE_KEY, data, ttl);
    }

    /**
     * Invalidate menu categories cache
     */
    async invalidate() {
        return await cacheService.delete(CACHE_KEY);
    }
}

// Export singleton instance
export default new MenuCategoryCacheService();

