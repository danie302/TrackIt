# Story 0.3-002: Set Up Redis Connection

## Metadata
- **Category:** Backend
- **Priority:** Critical
- **Estimated Effort:** 2 hours
- **Dependencies:** Story 0.1-002, Story 0.2-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Configure Redis connection in NestJS backend for caching and session management with proper error handling and health checks.

## Tasks
1. Install required packages:
   - `npm install @nestjs/cache-manager cache-manager cache-manager-redis-store`
2. Create Redis configuration module in `src/config/redis.config.ts`
3. Configure CacheModule in `app.module.ts` with Redis store
4. Set up Redis connection from environment variables:
   - REDIS_HOST
   - REDIS_PORT
   - REDIS_PASSWORD (optional)
   - REDIS_TTL (default TTL for cache)
5. Add connection error handling and logging
6. Create Redis health check in health controller
7. Test basic set/get operations
8. Configure connection retry logic

## Acceptance Criteria
- Backend connects to Redis successfully on startup
- Can store and retrieve cached values
- Connection errors are handled gracefully with retry logic
- Health check includes Redis status (connected/disconnected)
- Redis data persists correctly
- Environment variables are validated

## Technical Notes
```typescript
// redis.config.ts
import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

export const redisConfig: CacheModuleOptions = {
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  ttl: parseInt(process.env.REDIS_TTL) || 3600, // 1 hour default
  max: 100, // maximum number of items in cache
};

// Health check
async checkRedis(): Promise<boolean> {
  try {
    await this.cacheManager.set('health_check', 'ok', 5);
    const result = await this.cacheManager.get('health_check');
    return result === 'ok';
  } catch (error) {
    return false;
  }
}
```

## Testing Requirements
- Test Redis connection success
- Test Redis connection failure handling
- Test basic cache operations (set, get, delete)
- Test TTL expiration
- Test health check endpoint

## Documentation Requirements
- Document Redis environment variables in backend/.env.example
- Add Redis troubleshooting guide to backend/README.md
- Document cache usage patterns

## Related Files
- `backend/src/config/redis.config.ts` (create)
- `backend/src/app.module.ts` (modify)
- `backend/src/health/health.controller.ts` (update)
- `backend/.env.example` (update)

## Notes
- Redis runs in Docker container from docker-compose.yml
- In development, Redis runs on localhost:6379
- In production, consider using Redis Cluster or managed Redis service
- Used for: session storage, OTP storage, cache for frequently accessed data
- Default TTL: 1 hour (configurable)
