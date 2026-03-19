import Redis from 'ioredis';

// Upstash Redis connection string
// Format: redis://default:<password>@<host>:<port>
const REDIS_URL = process.env.REDIS_URL || 'redis://default:gQAAAAAAAQSJAAIncDE4YmY2ODQxZmFlYTU0OGFhYmQ4ZmQxYzNmMDBiM2JjZnAxNjY2OTc@dynamic-fish-66697.upstash.io:6379';

const redis = new Redis(REDIS_URL, {
    tls: {
        rejectUnauthorized: false
    },
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    lazyConnect: true
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis (Upstash)');
});

redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});

// Test connection
redis.connect().catch(err => {
    console.error('Failed to connect to Redis:', err.message);
});

export default redis;

