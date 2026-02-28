# Story 15.2-001: Cache Service

## Metadata
- **Category**: Backend - Redis Caching
- **Priority**: Medium
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 15.1-001
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Implement Redis cache service with get, set, invalidate methods.

## Tasks
1. Create `src/common/cache.service.ts`
2. Implement get(key), set(key, value, ttl), del(key), clear(pattern)
3. Add error handling for Redis connection failures
4. Implement cache-aside pattern
5. Add logging for cache hits/misses

## Acceptance Criteria
- Cache service operational
- All CRUD methods working
- Error handling prevents app crashes
- Logging tracks cache performance

## Technical Notes
```typescript
// src/common/cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisService.getClient().get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redisService.getClient().setex(key, ttl, serialized);
    } else {
      await this.redisService.getClient().set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisService.getClient().del(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    const keys = await this.redisService.getClient().keys(pattern);
    if (keys.length) await this.redisService.getClient().del(...keys);
  }
}
```

## Related Files
- `src/common/cache.service.ts` (create)
