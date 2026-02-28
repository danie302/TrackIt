# Story 5.4-001: Category API Endpoints

## Metadata
- **Category:** API Development
- **Priority:** Medium
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 3.3-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement REST API endpoints for category management scoped to company.

## Endpoints
```
POST /api/v1/categories - Create category
GET /api/v1/categories - List categories by company
GET /api/v1/categories/:id - Get category
PUT /api/v1/categories/:id - Update category
DELETE /api/v1/categories/:id - Delete category
```

## Controller Implementation
```typescript
@ApiTags('Categories')
@Controller('api/v1/categories')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CategoriesController {
  @Post()
  @Roles(Role.CompanyAdmin, Role.Employer)
  async create(@Body() dto: CreateCategoryDto, @CurrentUser() user: any) {
    return this.categoriesService.createCategory(dto, user.id, user.companyId);
  }

  @Get()
  async findAll(@Query('companyId') companyId: string) {
    return this.categoriesService.getCategoriesByCompany(companyId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.deleteCategory(id, user.id, user.companyId);
  }
}
```

## Related Files
- `src/categories/categories.controller.ts` (create)
