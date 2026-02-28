# Story 15.3-001: Cache Integration

## Metadata
- **Category**: Backend - Redis Caching
- **Priority**: Medium
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 15.2-001
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Integrate cache service into API endpoints.

## Tasks
1. Add caching to CompanyService.findAll()
2. Add caching to InventoryService.findByCompany()
3. Add caching to ItemService.findByInventory()
4. Add caching to CategoryService.findAll()
5. Implement cache invalidation on create/update/delete
6. Add cache interceptor for automatic caching

## Acceptance Criteria
- GET endpoints return cached data
- Cache invalidated on mutations
- Performance improved for frequently accessed data

## Technical Notes
```typescript
// In services
async findAll() {
  const cacheKey = 'api:companies';
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return cached;

  const data = await this.companyRepository.find();
  await this.cacheService.set(cacheKey, data, 300); // 5 min
  return data;
}

async update(id, dto) {
  const result = await this.companyRepository.update(id, dto);
  await this.cacheService.clearPattern('api:companies*');
  return result;
}
```

## Related Files
- Update all service files with caching
