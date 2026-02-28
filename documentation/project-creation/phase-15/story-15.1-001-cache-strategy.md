# Story 15.1-001: Cache Strategy

## Metadata
- **Category**: Backend - Redis Caching
- **Priority**: Medium
- **Estimated Effort**: 2 hours
- **Dependencies**: Story 0.4-001
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Define caching strategy with TTLs and cache types for the application.

## Tasks
1. Document cache strategy in `docs/caching-strategy.md`
2. Define TTLs: User sessions (7 days), API responses (5 min), Static data (1 hour)
3. Identify cacheable endpoints: GET companies, inventories, items, categories
4. Define cache invalidation rules
5. Document cache keys naming convention

## Acceptance Criteria
- Strategy document created
- TTLs defined for all cache types
- Cache invalidation rules documented

## Technical Notes
Cache Keys Format:
- `user:sessions:{userId}` - 7 days
- `api:companies` - 5 minutes
- `api:inventories:{companyId}` - 5 minutes
- `api:items:{inventoryId}` - 5 minutes
- `api:categories` - 1 hour

Invalidation: Clear on POST/PUT/DELETE operations

## Related Files
- `docs/caching-strategy.md` (create)
