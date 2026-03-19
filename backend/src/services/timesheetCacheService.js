import cacheService from './cacheService.js';

// Cache configuration for timesheets
const CACHE_KEY = 'timesheets';
const CACHE_TTL = 300; // 5 minutes

/**
 * Cache service for Timesheet
 * Each controller has its own cache service with specific CACHE_KEY and CACHE_TTL
 */
class TimesheetCacheService {
    /**
     * Get cached timesheets
     * @returns {Promise<any|null>}
     */
    async get() {
        return await cacheService.get(CACHE_KEY);
    }

    /**
     * Cache timesheets
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in seconds (optional)
     */
    async set(data, ttl = CACHE_TTL) {
        return await cacheService.set(CACHE_KEY, data, ttl);
    }

    /**
     * Invalidate timesheet cache
     */
    async invalidate() {
        return await cacheService.delete(CACHE_KEY);
    }
}

// Export singleton instance
export default new TimesheetCacheService();
