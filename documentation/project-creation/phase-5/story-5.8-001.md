# Story 5.8-001: Audit API Endpoints

## Metadata
- **Category:** API Development
- **Priority:** Medium
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 3.7-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement REST API endpoints for audit trail querying with filtering and pagination.

## Endpoints
```
GET /api/v1/audits - List audits (paginated, filtered)
GET /api/v1/audits/entity/:entityType/:entityId - Get entity audit history
GET /api/v1/audits/user/:userId - Get user action history
GET /api/v1/items/:itemId/audit-trail - Get complete item movement history
```

## Controller Implementation
```typescript
@ApiTags('Audits')
@Controller('api/v1/audits')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AuditController {
  @Get()
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'action', required: false })
  async findAll(@Query() query: FilterAuditsDto, @CurrentUser() user: any) {
    return this.auditService.getAuditsByCompany(user.companyId, query.actions, query.startDate, query.endDate, query.page, query.limit);
  }

  @Get('entity/:entityType/:entityId')
  async getEntityAudits(@Param('entityType') type: string, @Param('entityId') id: string) {
    return this.auditService.getAuditsByEntity(type as EntityType, id);
  }

  @Get('user/:userId')
  async getUserAudits(@Param('userId') userId: string, @Query() query: DateRangeDto) {
    return this.auditService.getAuditsByActor(userId, query.startDate, query.endDate);
  }
}
```

## Related Files
- `src/audit/audit.controller.ts` (create)
