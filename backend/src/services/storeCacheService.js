import cacheService from './cacheService.js';

// Cache configuration for store
const CACHE_KEY = 'store:info';
const CACHE_TTL = 3600; // 1 hour

class StoreCacheService {
    async get() {
        return await cacheService.get(CACHE_KEY);
    }

    async set(data, ttl = CACHE_TTL) {
        return await cacheService.set(CACHE_KEY, data, ttl);
    }

    async invalidate() {
        return await cacheService.delete(CACHE_KEY);
    }
}

export default new StoreCacheService();
