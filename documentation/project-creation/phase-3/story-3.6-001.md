# Story 3.6-001: Order Request Service

## Metadata
- **Category:** Business Logic
- **Priority:** High
- **Estimated Effort:** 8 hours
- **Dependencies:** Story 1.6-001, Story 2.4-001, Story 3.4-001, Story 3.5-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement Order Request service supporting both standard (company → reseller) and devolution (reseller → company) order flows with atomic approval and rejection handling.

## Tasks
1. Create OrderRequestService with dependency injection
2. Implement createStandardOrder() for company to reseller
3. Implement createDevolutionOrder() for reseller to company
4. Implement getOrderById() with authorization
5. Implement getOrdersByCompany() with filtering
6. Implement getOrdersByReseller()
7. Implement approveOrder() with atomic item transfer
8. Implement rejectOrder() with reason
9. Implement validateOrderItems() helper
10. Implement executeItemTransfer() with transaction
11. Write unit and integration tests

## Acceptance Criteria
- Standard orders: company → reseller flow
- Devolution orders: reseller → company flow
- Approval is ATOMIC (all items or none)
- Rejection requires reason
- Use MongoDB transactions for approval
- All operations audited
- Proper authorization checks

## Technical Notes

### Order Request Service Implementation
```typescript
// order-requests/order-requests.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { OrderRequest } from './schemas/order-request.schema';
import { CreateStandardOrderDto } from './dto/create-standard-order.dto';
import { CreateDevolutionOrderDto } from './dto/create-devolution-order.dto';
import { AuditService } from '../audit/audit.service';
import { ItemsService } from '../items/items.service';
import { InventoriesService } from '../inventories/inventories.service';
import { OrderType, OrderStatus } from './enums/order.enums';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class OrderRequestsService {
  constructor(
    @InjectModel(OrderRequest.name) private orderModel: Model<OrderRequest>,
    @InjectConnection() private connection: Connection,
    private itemsService: ItemsService,
    private inventoriesService: InventoriesService,
    private auditService: AuditService,
  ) {}

  async createStandardOrder(
    createOrderDto: CreateStandardOrderDto,
    resellerId: string,
    resellerCompanyId: string,
  ): Promise<OrderRequest> {
    // Validate items and inventory access
    await this.validateOrderItems(createOrderDto.items, resellerId);

    const order = new this.orderModel({
      ...createOrderDto,
      orderType: OrderType.Standard,
      status: OrderStatus.Pending,
      resellerId,
      sourceInventoryId: createOrderDto.sourceInventoryId,
      targetInventoryId: null, // Will be set when creating reseller inventory
      requestDate: new Date(),
    });
    await order.save();

    await this.auditService.createAuditRecord({
      entityType: 'OrderRequest',
      entityId: order.id,
      action: 'CREATE',
      actorId: resellerId,
      metadata: { 
        orderType: OrderType.Standard,
        itemCount: order.items.length,
      },
    });

    return order;
  }

  async createDevolutionOrder(
    createOrderDto: CreateDevolutionOrderDto,
    resellerId: string,
  ): Promise<OrderRequest> {
    const order = new this.orderModel({
      ...createOrderDto,
      orderType: OrderType.Devolution,
      status: OrderStatus.Pending,
      resellerId,
      sourceInventoryId: createOrderDto.sourceInventoryId, // Reseller inventory
      targetInventoryId: createOrderDto.targetInventoryId, // Company inventory
      requestDate: new Date(),
    });
    await order.save();

    await this.auditService.createAuditRecord({
      entityType: 'OrderRequest',
      entityId: order.id,
      action: 'CREATE',
      actorId: resellerId,
      metadata: { 
        orderType: OrderType.Devolution,
        itemCount: order.items.length,
      },
    });

    return order;
  }

  async getOrderById(
    orderId: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<OrderRequest> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Authorization check
    if (actorRole === Role.Reseller && order.resellerId !== actorId) {
      throw new ForbiddenException('Access denied to this order');
    }

    // For company users, verify company ownership via inventory
    if (actorRole !== Role.MasterAdmin && actorRole !== Role.Reseller) {
      const inventory = await this.inventoriesService.getInventoryById(
        order.sourceInventoryId,
        actorId,
        actorRole,
        actorCompanyId,
      );
    }

    return order;
  }

  async getOrdersByCompany(companyId: string, status?: OrderStatus): Promise<OrderRequest[]> {
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Find orders where source inventory belongs to company
    const inventories = await this.inventoriesService.getInventoriesByCompany(companyId, Role.CompanyAdmin, companyId);
    const inventoryIds = inventories.map(inv => inv.id);

    query.sourceInventoryId = { $in: inventoryIds };

    return this.orderModel.find(query).exec();
  }

  async getOrdersByReseller(resellerId: string, status?: OrderStatus): Promise<OrderRequest[]> {
    const query: any = { resellerId };
    if (status) {
      query.status = status;
    }

    return this.orderModel.find(query).exec();
  }

  async approveOrder(
    orderId: string,
    targetInventoryId: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<OrderRequest> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status !== OrderStatus.Pending) {
      throw new BadRequestException('Order is not in pending status');
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorRole !== Role.CompanyAdmin && actorRole !== Role.Employer) {
      throw new ForbiddenException('Insufficient permissions to approve orders');
    }

    // Use transaction for atomic item transfer
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Execute item transfer
      await this.executeItemTransfer(order.items, targetInventoryId, actorId, session);

      // Update order status
      order.status = OrderStatus.Approved;
      order.approvalDate = new Date();
      order.targetInventoryId = targetInventoryId;
      await order.save({ session });

      await session.commitTransaction();

      await this.auditService.createAuditRecord({
        entityType: 'OrderRequest',
        entityId: order.id,
        action: 'APPROVE',
        actorId,
        metadata: { 
          orderType: order.orderType,
          itemCount: order.items.length,
          targetInventoryId,
        },
      });

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async rejectOrder(
    orderId: string,
    reason: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<OrderRequest> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status !== OrderStatus.Pending) {
      throw new BadRequestException('Order is not in pending status');
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorRole !== Role.CompanyAdmin && actorRole !== Role.Employer) {
      throw new ForbiddenException('Insufficient permissions to reject orders');
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
    }

    order.status = OrderStatus.Rejected;
    order.rejectionReason = reason;
    order.approvalDate = new Date(); // Same field used for rejection date
    await order.save();

    await this.auditService.createAuditRecord({
      entityType: 'OrderRequest',
      entityId: order.id,
      action: 'REJECT',
      actorId,
      metadata: { 
        orderType: order.orderType,
        reason,
      },
    });

    return order;
  }

  async validateOrderItems(itemIds: string[], resellerId: string): Promise<void> {
    for (const itemId of itemIds) {
      const item = await this.itemsService.getItemById(itemId, resellerId, Role.Reseller, null);
      if (!item) {
        throw new BadRequestException(`Item ${itemId} not found or not accessible`);
      }
    }
  }

  async executeItemTransfer(
    itemIds: string[],
    targetInventoryId: string,
    actorId: string,
    session: any,
  ): Promise<void> {
    for (const itemId of itemIds) {
      await this.itemsService.moveItemBetweenInventories(
        itemId,
        targetInventoryId,
        actorId,
      );
    }
  }
}
```

### Enums
```typescript
// order-requests/enums/order.enums.ts
export enum OrderType {
  Standard = 'Standard',
  Devolution = 'Devolution',
}

export enum OrderStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}
```

## Testing Requirements
- Test create standard order
- Test create devolution order
- Test approve order (atomic transfer)
- Test reject order with reason
- Test transaction rollback on failure
- Test authorization checks
- Test audit records

## Documentation Requirements
- Document order flows (standard vs devolution)
- Document approval process
- Document transaction handling
- Add API examples

## Related Files
- `src/order-requests/order-requests.service.ts` (create)
- `src/order-requests/order-requests.controller.ts` (create)
- `src/order-requests/dto/*.dto.ts` (create)
- `src/order-requests/enums/order.enums.ts` (create)
- `src/order-requests/order-requests.module.ts` (create)

## Notes
- Transactions ensure data consistency
- Email notifications will be added in Phase 4
- Consider adding order cancellation by reseller
- Consider adding order history tracking
