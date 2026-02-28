# Story 5.6-001: Item API Endpoints

## Metadata
- **Category:** API Development
- **Priority:** High
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 3.5-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement REST API endpoints for item management with category filtering and serial number validation.

## Endpoints
```
POST /api/v1/items - Add item to inventory
GET /api/v1/items - List items (paginated, filtered by category)
GET /api/v1/items/:id - Get item details
PUT /api/v1/items/:id - Update item
DELETE /api/v1/items/:id - Delete item
```

## Controller Implementation
```typescript
@ApiTags('Items')
@Controller('api/v1/items')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ItemsController {
  @Post()
  @Roles(Role.CompanyAdmin, Role.Employer)
  async create(@Body() dto: CreateItemDto, @CurrentUser() user: any) {
    return this.itemsService.addItem(dto, user.id, user.role, user.companyId);
  }

  @Get()
  @ApiQuery({ name: 'inventoryId', required: false })
  @ApiQuery({ name: 'category', required: false, isArray: true })
  async findAll(@Query() query: FilterItemsDto, @CurrentUser() user: any) {
    return this.itemsService.getItemsByInventory(query.inventoryId, user.id, user.role, user.companyId, query.categories);
  }

  @Delete(':id')
  @Roles(Role.CompanyAdmin, Role.Employer)
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.itemsService.deleteItem(id, user.id, user.role, user.companyId);
  }
}
```

## Related Files
- `src/items/items.controller.ts` (create)
