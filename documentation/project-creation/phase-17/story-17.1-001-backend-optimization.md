# Story 17.1-001: Backend Optimization

## Metadata
- **Category**: Backend - Performance
- **Priority**: Medium
- **Estimated Effort**: 5 hours
- **Dependencies**: All backend stories
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Optimize backend performance with database indexes, query optimization, and connection pooling.

## Tasks
1. Add MongoDB indexes on frequently queried fields
2. Optimize N+1 query problems with populate/aggregation
3. Configure MongoDB connection pooling
4. Add pagination to all list endpoints
5. Implement query result limiting
6. Profile slow queries and optimize
7. Add database query logging
8. Implement lazy loading for relationships

## Acceptance Criteria
- All list endpoints paginated
- Database indexes created
- Connection pool configured
- N+1 queries eliminated
- Query performance improved by 50%+

## Technical Notes
Indexes to add:
- Company: name, createdAt
- User: email (unique), companyId, role
- Inventory: companyId, createdAt
- Item: serialNumber (unique), inventoryId, status, assignedUserId
- OrderRequest: companyId, resellerId, status, createdAt
- Category: name (unique)

## Related Files
- All schema files (add indexes)
- All service files (optimize queries)
