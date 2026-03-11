import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  OrderRequestDocument,
  OrderStatus,
  OrderType,
} from './schemas/order-request.schema';
import { InventoriesService } from '../inventories/inventories.service';
import { ItemsService } from '../items/items.service';
import { AuditsService } from '../audits/audits.service';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';
import {
  normalizeLimit,
  paginateSkip,
  toPaginatedResult,
  type PaginatedResult,
} from '../common/pagination.dto';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

export interface CreateStandardOrderDto {
  creatorId: string;
  companyId: string;
  companyInventoryId: string;
  resellerInventoryId: string;
  itemIds: string[];
}

export interface CreateDevolutionOrderDto {
  creatorId: string;
  companyId: string;
  resellerInventoryId: string;
  companyInventoryId: string;
  itemIds: string[];
  devolutionReason: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('OrderRequest') private orderModel: Model<OrderRequestDocument>,
    private inventoriesService: InventoriesService,
    private itemsService: ItemsService,
    private auditsService: AuditsService,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  async createStandardOrder(
    dto: CreateStandardOrderDto,
    actorId: string,
  ): Promise<OrderRequestDocument> {
    await this.validateOrderItems(
      dto.itemIds,
      dto.companyInventoryId,
      'source',
    );
    const order = await this.orderModel.create({
      orderType: OrderType.STANDARD,
      status: OrderStatus.PENDING,
      creator: new Types.ObjectId(dto.creatorId),
      companyId: new Types.ObjectId(dto.companyId),
      sourceInventoryId: new Types.ObjectId(dto.companyInventoryId),
      targetInventoryId: new Types.ObjectId(dto.resellerInventoryId),
      items: dto.itemIds.map((id) => new Types.ObjectId(id)),
    });
    const [sourceInv, targetInv] = await Promise.all([
      this.inventoriesService.getInventoryById(dto.companyInventoryId).catch(() => null),
      this.inventoriesService.getInventoryById(dto.resellerInventoryId).catch(() => null),
    ]);
    await this.auditsService.createAuditRecord({
      entityType: EntityType.ORDER_REQUEST,
      entityId: order._id as Types.ObjectId,
      action: AuditAction.CREATE,
      actor: new Types.ObjectId(actorId),
      description: `Standard order created with ${dto.itemIds.length} item(s)`,
      companyId: order.companyId,
      metadata: {
        orderType: 'Standard',
        itemCount: dto.itemIds.length,
        sourceInventoryId: dto.companyInventoryId,
        sourceInventoryName: sourceInv?.name,
        targetInventoryId: dto.resellerInventoryId,
        targetInventoryName: targetInv?.name,
      },
    });
    return order;
  }

  async createDevolutionOrder(
    dto: CreateDevolutionOrderDto,
    actorId: string,
  ): Promise<OrderRequestDocument> {
    await this.validateOrderItems(
      dto.itemIds,
      dto.resellerInventoryId,
      'source',
    );
    const order = await this.orderModel.create({
      orderType: OrderType.DEVOLUTION,
      status: OrderStatus.PENDING,
      creator: new Types.ObjectId(dto.creatorId),
      companyId: new Types.ObjectId(dto.companyId),
      sourceInventoryId: new Types.ObjectId(dto.resellerInventoryId),
      targetInventoryId: new Types.ObjectId(dto.companyInventoryId),
      items: dto.itemIds.map((id) => new Types.ObjectId(id)),
      devolutionReason: dto.devolutionReason,
    });
    const [sourceInv, targetInv] = await Promise.all([
      this.inventoriesService.getInventoryById(dto.resellerInventoryId).catch(() => null),
      this.inventoriesService.getInventoryById(dto.companyInventoryId).catch(() => null),
    ]);
    await this.auditsService.createAuditRecord({
      entityType: EntityType.ORDER_REQUEST,
      entityId: order._id as Types.ObjectId,
      action: AuditAction.CREATE,
      actor: new Types.ObjectId(actorId),
      description: `Devolution order created: ${dto.devolutionReason}`,
      companyId: order.companyId,
      metadata: {
        orderType: 'Devolution',
        itemCount: dto.itemIds.length,
        devolutionReason: dto.devolutionReason,
        sourceInventoryId: dto.resellerInventoryId,
        sourceInventoryName: sourceInv?.name,
        targetInventoryId: dto.companyInventoryId,
        targetInventoryName: targetInv?.name,
      },
    });
    return order;
  }

  private async validateOrderItems(
    itemIds: string[],
    inventoryId: string,
    _role: string,
  ): Promise<void> {
    const ItemModel = this.orderModel.db.model('Item');
    for (const id of itemIds) {
      const item = await ItemModel.findById(id).exec();
      if (!item) {
        throw new BadRequestException(`Item ${id} not found`);
      }
      if (item.inventoryId.toString() !== inventoryId) {
        throw new BadRequestException(
          `Item ${id} is not in the specified inventory`,
        );
      }
    }
  }

  async getOrderById(id: string): Promise<OrderRequestDocument> {
    const order = await this.orderModel.findById(id).populate('creator', 'name email').exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getOrdersByCompany(
    companyId: string,
    page = 1,
    limit = 10,
    status?: OrderStatus,
  ): Promise<PaginatedResult<OrderRequestDocument>> {
    const l = normalizeLimit(limit);
    const filter: Record<string, unknown> = { companyId: new Types.ObjectId(companyId) };
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async getOrdersByReseller(
    resellerId: string,
    page = 1,
    limit = 10,
    status?: OrderStatus,
    orderType?: OrderType,
  ): Promise<PaginatedResult<OrderRequestDocument>> {
    const l = normalizeLimit(limit);
    const filter: Record<string, unknown> = { creator: new Types.ObjectId(resellerId) };
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;
    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async approveOrder(
    orderId: string,
    approvedBy: string,
  ): Promise<OrderRequestDocument> {
    const order = await this.getOrderById(orderId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }
    for (const itemId of order.items) {
      await this.itemsService.moveItemBetweenInventories(
        itemId.toString(),
        order.targetInventoryId.toString(),
        approvedBy,
      );
    }
    const updated = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $set: {
            status: OrderStatus.APPROVED,
            approvedBy: new Types.ObjectId(approvedBy),
            approvedAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();
    await this.auditsService.createAuditRecord({
      entityType: EntityType.ORDER_REQUEST,
      entityId: order._id as Types.ObjectId,
      action: AuditAction.APPROVE,
      actor: new Types.ObjectId(approvedBy),
      description: 'Order approved',
      companyId: order.companyId,
      metadata: {
        orderType: order.orderType,
        itemCount: order.items.length,
      },
    });

    void this.notifyCreator(order.creator.toString(), {
      orderId: String(order._id),
      orderType: order.orderType as 'Standard' | 'Devolution',
      itemCount: order.items.length,
    }, 'approved');

    return updated!;
  }

  async rejectOrder(
    orderId: string,
    rejectedBy: string,
    reason: string,
  ): Promise<OrderRequestDocument> {
    if (!reason?.trim()) {
      throw new BadRequestException('Rejection reason is required');
    }
    const order = await this.getOrderById(orderId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }
    const updated = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $set: {
            status: OrderStatus.REJECTED,
            rejectionReason: reason.trim(),
            approvedBy: new Types.ObjectId(rejectedBy),
            approvedAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();
    await this.auditsService.createAuditRecord({
      entityType: EntityType.ORDER_REQUEST,
      entityId: order._id as Types.ObjectId,
      action: AuditAction.REJECT,
      actor: new Types.ObjectId(rejectedBy),
      description: `Order rejected: ${reason.trim()}`,
      metadata: { rejectionReason: reason.trim() },
      companyId: order.companyId,
    });

    void this.notifyCreator(order.creator.toString(), {
      orderId: String(order._id),
      orderType: order.orderType as 'Standard' | 'Devolution',
      itemCount: order.items.length,
      rejectionReason: reason.trim(),
    }, 'rejected');

    return updated!;
  }

  private async notifyCreator(
    creatorId: string,
    ctx: Parameters<EmailService['sendOrderApprovedEmail']>[1],
    outcome: 'approved' | 'rejected',
  ): Promise<void> {
    try {
      const creator = await this.usersService.findById(creatorId);
      if (!creator) return;
      if (outcome === 'approved') {
        await this.emailService.sendOrderApprovedEmail(creator.email, ctx);
      } else {
        await this.emailService.sendOrderRejectedEmail(creator.email, ctx);
      }
    } catch {
      // email failures must not affect order processing
    }
  }
}
