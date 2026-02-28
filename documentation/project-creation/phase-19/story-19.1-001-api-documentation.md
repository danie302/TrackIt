# Story 19.1-001: API Documentation

## Metadata
- **Category**: Documentation
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: All API endpoints
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Complete Swagger/OpenAPI documentation for all API endpoints.

## Tasks
1. Add Swagger decorators to all controllers
2. Document request/response schemas
3. Add authentication requirements to docs
4. Include example requests/responses
5. Document error codes
6. Add API versioning to docs
7. Generate OpenAPI spec file
8. Host Swagger UI at /api/docs

## Acceptance Criteria
- All endpoints documented in Swagger
- Examples provided for all endpoints
- Authentication requirements clear
- Error responses documented
- Swagger UI accessible

## Technical Notes
```typescript
// Example controller documentation
@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Returns list of companies', type: [Company] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll() { ... }
}
```

## Related Files
- All controller files (add Swagger decorators)
