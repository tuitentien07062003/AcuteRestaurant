import cacheService from './cacheService.js';

// Cache configuration for payroll
const PAYROLL_PREFIX = 'payroll:store';
const DAILY_SUMMARY_PREFIX = 'salary:daily';
const DAY_TIMESHEETS_PREFIX = 'salary:timesheets';
const PAYROLL_TTL = 3600; // 1 hour
const DAILY_TTL = 30 * 60; // 30 minutes (auto-update cho daily)
const TIMESHEETS_TTL = 15 * 60; // 15 minutes

class PayrollCacheService {
    /**
     * Get cached payroll for store/month/year
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     * @returns {Promise<any|null>}
     */
    async get(storeId, month, year) {
        const key = `${PAYROLL_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.get(key);
    }

    /**
     * Cache payroll
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     * @param {any} data 
     * @param {number} ttl 
     */
    async set(storeId, month, year, data, ttl = PAYROLL_TTL) {
        const key = `${PAYROLL_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Invalidate specific payroll
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     */
    async invalidate(storeId, month, year) {
        const key = `${PAYROLL_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.delete(key);
    }

    /**
     * Invalidate all payroll for store
     */
    async invalidateStore(storeId) {
        return await cacheService.deleteByPattern(`${PAYROLL_PREFIX}:${storeId}:*`);
    }

    /**
     * Cache daily salary summary (tóm tắt lương ngày)
     * @param {string|number} storeId 
     * @param {string} date (YYYY-MM-DD)
     * @param {any} data 
     */
    async setDailySummary(storeId, date, data, ttl = DAILY_TTL) {
        const key = `${DAILY_SUMMARY_PREFIX}:${storeId}:${date}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Get cached daily salary summary
     */
    async getDailySummary(storeId, date) {
        const key = `${DAILY_SUMMARY_PREFIX}:${storeId}:${date}`;
        return await cacheService.get(key);
    }

    /**
     * Invalidate daily salary summary
     */
    async invalidateDailySummary(storeId, date) {
        const key = `${DAILY_SUMMARY_PREFIX}:${storeId}:${date}`;
        return await cacheService.delete(key);
    }

    /**
     * Cache day timesheets
     * @param {string|number} storeId 
     * @param {string} date (YYYY-MM-DD)
     * @param {any} data 
     */
    async setDayTimesheets(storeId, date, data, ttl = TIMESHEETS_TTL) {
        const key = `${DAY_TIMESHEETS_PREFIX}:${storeId}:${date}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Get cached day timesheets
     */
    async getDayTimesheets(storeId, date) {
        const key = `${DAY_TIMESHEETS_PREFIX}:${storeId}:${date}`;
        return await cacheService.get(key);
    }

    /**
     * Invalidate day timesheets
     */
    async invalidateDayTimesheets(storeId, date) {
        const key = `${DAY_TIMESHEETS_PREFIX}:${storeId}:${date}`;
        return await cacheService.delete(key);
    }

    /**
     * Cache monthly salary summary (tóm tắt lương tháng)
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     * @param {any} data 
     */
    async setMonthlySummary(storeId, month, year, data, ttl = MONTHLY_TTL) {
        const key = `${MONTHLY_SUMMARY_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Cache monthly salary summary (tóm tắt lương tháng)
     * @param {string|number} storeId 
     * @param {number} month 
     * @param {number} year 
     * @param {any} data 
     */
    async setMonthlySummary(storeId, month, year, data, ttl = MONTHLY_TTL) {
        const key = `${MONTHLY_SUMMARY_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.set(key, data, ttl);
    }

    /**
     * Get cached monthly salary summary
     */
    async getMonthlySummary(storeId, month, year) {
        const key = `${MONTHLY_SUMMARY_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.get(key);
    }

    /**
     * Invalidate monthly salary summary
     */
    async invalidateMonthlySummary(storeId, month, year) {
        const key = `${MONTHLY_SUMMARY_PREFIX}:${storeId}:${month}:${year}`;
        return await cacheService.delete(key);
    }

    async invalidateAll() {
        return await cacheService.deleteByPattern(`${PAYROLL_PREFIX}:*`);
    }
}

export default new PayrollCacheService();

