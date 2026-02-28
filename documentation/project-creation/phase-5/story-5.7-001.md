# Story 5.7-001: Order Request API Endpoints

## Metadata
- **Category:** API Development
- **Priority:** High
- **Estimated Effort:** 5 hours
- **Dependencies:** Story 3.6-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement REST API endpoints for order management including standard and devolution orders.

## Endpoints
```
POST /api/v1/orders - Create standard order
POST /api/v1/orders/devolution - Create devolution order
GET /api/v1/orders - List orders (paginated, filtered by status)
GET /api/v1/orders/:id - Get order details
PUT /api/v1/orders/:id/approve - Approve order
PUT /api/v1/orders/:id/reject - Reject order (reason required)
```

## Controller Implementation
```typescript
@ApiTags('Orders')
@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard, RoleGuard)
export class OrderRequestsController {
  @Post()
  @Roles(Role.Reseller)
  async createStandard(@Body() dto: CreateStandardOrderDto, @CurrentUser() user: any) {
    return this.ordersService.createStandardOrder(dto, user.id, user.companyId);
  }

  @Post('devolution')
  @Roles(Role.Reseller)
  async createDevolution(@Body() dto: CreateDevolutionOrderDto, @CurrentUser() user: any) {
    return this.ordersService.createDevolutionOrder(dto, user.id);
  }

  @Put(':id/approve')
  @Roles(Role.MasterAdmin, Role.CompanyAdmin, Role.Employer)
  async approve(@Param('id') id: string, @Body() dto: ApproveOrderDto, @CurrentUser() user: any) {
    return this.ordersService.approveOrder(id, dto.targetInventoryId, user.id, user.role, user.companyId);
  }

  @Put(':id/reject')
  @Roles(Role.MasterAdmin, Role.CompanyAdmin, Role.Employer)
  async reject(@Param('id') id: string, @Body() dto: RejectOrderDto, @CurrentUser() user: any) {
    return this.ordersService.rejectOrder(id, dto.reason, user.id, user.role, user.companyId);
  }
}
```

## Related Files
- `src/order-requests/order-requests.controller.ts` (create)
