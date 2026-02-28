# Story 5.5-001: Inventory API Endpoints

## Metadata
- **Category:** API Development
- **Priority:** High
- **Estimated Effort:** 5 hours
- **Dependencies:** Story 3.4-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement REST API endpoints for inventory management including whitelist operations.

## Endpoints
```
POST /api/v1/inventories - Create inventory
GET /api/v1/inventories - List inventories
GET /api/v1/inventories/:id - Get inventory details
PUT /api/v1/inventories/:id - Update inventory
DELETE /api/v1/inventories/:id - Delete inventory
POST /api/v1/inventories/:id/whitelist - Add reseller to whitelist
DELETE /api/v1/inventories/:id/whitelist/:resellerId - Remove from whitelist
GET /api/v1/inventories/:id/items - Get inventory items
```

## Controller Implementation
```typescript
@ApiTags('Inventories')
@Controller('api/v1/inventories')
@UseGuards(JwtAuthGuard, RoleGuard)
export class InventoriesController {
  @Post()
  @Roles(Role.CompanyAdmin, Role.Employer)
  async create(@Body() dto: CreateInventoryDto, @CurrentUser() user: any) {
    return this.inventoriesService.createInventory(dto, user.id, user.companyId);
  }

  @Post(':id/whitelist')
  @Roles(Role.CompanyAdmin, Role.Employer)
  async addToWhitelist(@Param('id') id: string, @Body() dto: AddResellerDto, @CurrentUser() user: any) {
    return this.inventoriesService.addResellerToWhitelist(id, dto.resellerId, user.id, user.companyId);
  }

  @Delete(':id/whitelist/:resellerId')
  async removeFromWhitelist(@Param('id') id: string, @Param('resellerId') resellerId: string, @CurrentUser() user: any) {
    return this.inventoriesService.removeResellerFromWhitelist(id, resellerId, user.id, user.companyId);
  }
}
```

## Related Files
- `src/inventories/inventories.controller.ts` (create)
