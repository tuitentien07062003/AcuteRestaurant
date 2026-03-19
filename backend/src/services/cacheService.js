import redis from '../config/redis.js';

const DEFAULT_TTL = 1800; // 30p

class CacheService {
    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any|null>} - Cached value or null if not found
     */
    async get(key) {
        try {
            const value = await redis.get(key);
            if (value) {
                console.log(`[CACHE HIT] Key: ${key}`);
                return JSON.parse(value);
            }
            console.log(`[CACHE MISS] Key: ${key}`);
            return null;
        } catch (error) {
            console.error(`[CACHE ERROR] Get key ${key}:`, error.message);
            return null;
        }
    }

    /**
     * Set value to cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds (optional)
     * @returns {Promise<boolean>} - Success status
     */
    async set(key, value, ttl = DEFAULT_TTL) {
        try {
            const serializedValue = JSON.stringify(value);
            await redis.setex(key, ttl, serializedValue);
            console.log(`[CACHE SET] Key: ${key}, TTL: ${ttl}s`);
            return true;
        } catch (error) {
            console.error(`[CACHE ERROR] Set key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Delete value from cache
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} - Success status
     */
    async delete(key) {
        try {
            await redis.del(key);
            console.log(`[CACHE DELETE] Key: ${key}`);
            return true;
        } catch (error) {
            console.error(`[CACHE ERROR] Delete key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Delete keys by pattern
     * @param {string} pattern - Key pattern (e.g., "menu:*")
     * @returns {Promise<number>} - Number of keys deleted
     */
    async deleteByPattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                const deleted = await redis.del(...keys);
                console.log(`[CACHE DELETE] Pattern: ${pattern}, Deleted: ${deleted}`);
                return deleted;
            }
            return 0;
        } catch (error) {
            console.error(`[CACHE ERROR] Delete by pattern ${pattern}:`, error.message);
            return 0;
        }
    }

    /**
     * Check if Redis is connected
     * @returns {Promise<boolean>}
     */
    async isConnected() {
        try {
            await redis.ping();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear all cache
     * @returns {Promise<boolean>}
     */
    async clearAll() {
        try {
            await redis.flushdb();
            console.log(`[CACHE CLEAR] All cache cleared`);
            return true;
        } catch (error) {
            console.error(`[CACHE ERROR] Clear all:`, error.message);
            return false;
        }
    }
}

// Export singleton instance
export default new CacheService();

