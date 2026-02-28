# Story 4.3-001: Integrate Email Notifications with Order Service

## Metadata
- **Category:** Email & Notifications
- **Priority:** High
- **Estimated Effort:** 2 hours
- **Dependencies:** Story 4.2-001, Story 3.6-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Integrate email notification service with order request service to send automatic emails on order approval/rejection. Emails sent asynchronously and failures don't block order processing.

## Tasks
1. Import EmailService into OrderRequestsService
2. Add email notification to approveOrder() method
3. Add email notification to rejectOrder() method
4. Ensure emails sent asynchronously (non-blocking)
5. Add try-catch to prevent email failures from breaking orders
6. Update OrderRequestsModule to import EmailModule
7. Write integration tests for email sending
8. Test email failures don't affect order processing

## Acceptance Criteria
- Order approval triggers email notification
- Order rejection triggers email notification
- Devolution approval triggers email notification
- Devolution rejection triggers email notification
- Emails sent ASYNCHRONOUSLY (non-blocking)
- Order processing completes even if email fails
- Email failures logged but don't cause order failures
- Integration tests verify email sending

## Technical Notes

### Updated Order Request Service
```typescript
// order-requests/order-requests.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { OrderRequest } from './schemas/order-request.schema';
import { AuditService } from '../audit/audit.service';
import { ItemsService } from '../items/items.service';
import { InventoriesService } from '../inventories/inventories.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
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
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

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

      // Send email notification asynchronously
      this.sendOrderApprovalNotification(order).catch(error => {
        // Log error but don't throw - email failures shouldn't affect order processing
        console.error('Failed to send order approval email:', error);
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
    order.approvalDate = new Date();
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

    // Send email notification asynchronously
    this.sendOrderRejectionNotification(order, reason).catch(error => {
      console.error('Failed to send order rejection email:', error);
    });

    return order;
  }

  private async sendOrderApprovalNotification(order: OrderRequest): Promise<void> {
    try {
      // Get reseller details
      const reseller = await this.usersService.findById(order.resellerId);
      if (!reseller) {
        throw new Error('Reseller not found');
      }

      // Get company name from inventory
      const inventory = await this.inventoriesService.getInventoryById(
        order.sourceInventoryId,
        reseller.id,
        reseller.role,
        reseller.companyId,
      );

      const orderData = {
        ...order.toObject(),
        companyName: inventory.companyId, // Would need to fetch actual company name
      };

      if (order.orderType === OrderType.Standard) {
        await this.emailService.sendOrderApprovalEmail(orderData, reseller);
      } else if (order.orderType === OrderType.Devolution) {
        await this.emailService.sendDevolutionApprovalEmail(orderData, reseller);
      }
    } catch (error) {
      // Log but don't throw
      console.error('Error in sendOrderApprovalNotification:', error);
    }
  }

  private async sendOrderRejectionNotification(order: OrderRequest, reason: string): Promise<void> {
    try {
      // Get reseller details
      const reseller = await this.usersService.findById(order.resellerId);
      if (!reseller) {
        throw new Error('Reseller not found');
      }

      // Get company name from inventory
      const inventory = await this.inventoriesService.getInventoryById(
        order.sourceInventoryId,
        reseller.id,
        reseller.role,
        reseller.companyId,
      );

      const orderData = {
        ...order.toObject(),
        companyName: inventory.companyId,
      };

      if (order.orderType === OrderType.Standard) {
        await this.emailService.sendOrderRejectionEmail(orderData, reseller, reason);
      } else if (order.orderType === OrderType.Devolution) {
        await this.emailService.sendDevolutionRejectionEmail(orderData, reseller, reason);
      }
    } catch (error) {
      console.error('Error in sendOrderRejectionNotification:', error);
    }
  }

  // ... rest of the service methods
}
```

### Updated Module
```typescript
// order-requests/order-requests.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderRequestsService } from './order-requests.service';
import { OrderRequestsController } from './order-requests.controller';
import { OrderRequest, OrderRequestSchema } from './schemas/order-request.schema';
import { ItemsModule } from '../items/items.module';
import { InventoriesModule } from '../inventories/inventories.module';
import { AuditModule } from '../audit/audit.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderRequest.name, schema: OrderRequestSchema },
    ]),
    ItemsModule,
    InventoriesModule,
    AuditModule,
    EmailModule,
    UsersModule,
  ],
  controllers: [OrderRequestsController],
  providers: [OrderRequestsService],
  exports: [OrderRequestsService],
})
export class OrderRequestsModule {}
```

## Testing Requirements
- Test order approval sends email
- Test order rejection sends email  
- Test devolution approval sends email
- Test devolution rejection sends email
- Test order succeeds even if email fails
- Test email sent asynchronously (non-blocking)
- Test correct email template used for each order type
- Mock EmailService for unit tests

## Documentation Requirements
- Document email integration points
- Document async behavior
- Document error handling strategy
- Update order service API documentation

## Related Files
- `src/order-requests/order-requests.service.ts` (update)
- `src/order-requests/order-requests.module.ts` (update)
- `src/order-requests/order-requests.service.spec.ts` (update tests)

## Notes
- Emails sent in fire-and-forget mode (async)
- Email failures logged but don't affect order processing
- Consider adding email notification preferences per user
- Consider adding email digest for multiple orders
- Future: Add in-app notifications in addition to emails
- Future: Add webhook notifications for external integrations
