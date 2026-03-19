import cacheService from './cacheService.js';

// Cache configuration for bill orders (daily)
const getDailyKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `billOrders:daily:${today}`;
};
const CACHE_TTL = 3600; // 1 hour

class BillOrderCacheService {
    async get() {
        return await cacheService.get(getDailyKey());
    }

    async set(data, ttl = CACHE_TTL) {
        return await cacheService.set(getDailyKey(), data, ttl);
    }

    async invalidate() {
        return await cacheService.deleteByPattern('billOrders:daily:*');
    }
}

export default new BillOrderCacheService();
