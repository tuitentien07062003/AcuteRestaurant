import cacheService from './cacheService.js';

// Cache configuration for employees
const CACHE_KEY = 'employees:all';
const CACHE_TTL = 300; // 5 minutes

class EmployeeCacheService {
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

export default new EmployeeCacheService();
