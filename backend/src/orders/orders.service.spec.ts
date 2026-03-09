import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service';
import { InventoriesService } from '../inventories/inventories.service';
import { ItemsService } from '../items/items.service';
import { AuditsService } from '../audits/audits.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { OrderStatus, OrderType } from './schemas/order-request.schema';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';

function createMockModel() {
  const itemFindByIdExec = jest.fn();
  return {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }),
    findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
    findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    deleteOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
    db: {
      model: jest.fn().mockReturnValue({
        findById: jest.fn().mockReturnValue({ exec: itemFindByIdExec }),
      }),
    },
    _itemFindByIdExec: itemFindByIdExec,
  };
}

const mockInventoriesService = { getInventoryById: jest.fn() };
const mockItemsService = { moveItemBetweenInventories: jest.fn() };
const mockAuditsService = { createAuditRecord: jest.fn().mockResolvedValue({}) };
const mockEmailService = {
  sendOrderApprovedEmail: jest.fn().mockResolvedValue(undefined),
  sendOrderRejectedEmail: jest.fn().mockResolvedValue(undefined),
};
const mockUsersService = { findById: jest.fn() };

describe('OrdersService', () => {
  let service: OrdersService;
  let mockModel: ReturnType<typeof createMockModel>;

  const actorId = new Types.ObjectId().toHexString();
  const companyId = new Types.ObjectId().toHexString();
  const orderId = new Types.ObjectId().toHexString();
  const companyInventoryId = new Types.ObjectId().toHexString();
  const resellerInventoryId = new Types.ObjectId().toHexString();
  const itemId1 = new Types.ObjectId().toHexString();
  const itemId2 = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken('OrderRequest'), useValue: mockModel },
        { provide: InventoriesService, useValue: mockInventoriesService },
        { provide: ItemsService, useValue: mockItemsService },
        { provide: AuditsService, useValue: mockAuditsService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function makeItemFindById(inventoryId: string) {
    return jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        inventoryId: { toString: () => inventoryId },
      }),
    });
  }

  describe('createStandardOrder', () => {
    const dto = {
      creatorId: actorId,
      companyId,
      companyInventoryId,
      resellerInventoryId,
      itemIds: [itemId1, itemId2],
    };

    it('validates items are in the source inventory', async () => {
      // Item is in a DIFFERENT inventory → should throw
      mockModel.db.model.mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(itemId1),
            inventoryId: { toString: () => new Types.ObjectId().toHexString() }, // wrong inv
          }),
        }),
      });

      await expect(service.createStandardOrder(dto, actorId)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when item not found during validation', async () => {
      mockModel.db.model.mockReturnValue({
        findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      });

      await expect(service.createStandardOrder(dto, actorId)).rejects.toThrow(BadRequestException);
      await expect(service.createStandardOrder(dto, actorId)).rejects.toThrow(
        `Item ${itemId1} not found`,
      );
    });

    it('creates order with type STANDARD and status PENDING', async () => {
      mockModel.db.model.mockReturnValue({
        findById: makeItemFindById(companyInventoryId),
      });
      const createdOrder = {
        _id: new Types.ObjectId(),
        orderType: OrderType.STANDARD,
        status: OrderStatus.PENDING,
        companyId: new Types.ObjectId(companyId),
        items: dto.itemIds.map((id) => new Types.ObjectId(id)),
      };
      mockModel.create.mockResolvedValue(createdOrder);

      const result = await service.createStandardOrder(dto, actorId);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: OrderType.STANDARD,
          status: OrderStatus.PENDING,
        }),
      );
      expect(result).toBe(createdOrder);
    });

    it('creates audit record', async () => {
      mockModel.db.model.mockReturnValue({
        findById: makeItemFindById(companyInventoryId),
      });
      const createdOrder = {
        _id: new Types.ObjectId(),
        orderType: OrderType.STANDARD,
        status: OrderStatus.PENDING,
        companyId: new Types.ObjectId(companyId),
        items: dto.itemIds.map((id) => new Types.ObjectId(id)),
      };
      mockModel.create.mockResolvedValue(createdOrder);

      await service.createStandardOrder(dto, actorId);

      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: EntityType.ORDER_REQUEST,
          action: AuditAction.CREATE,
        }),
      );
    });
  });

  describe('createDevolutionOrder', () => {
    const dto = {
      creatorId: actorId,
      companyId,
      resellerInventoryId,
      companyInventoryId,
      itemIds: [itemId1],
      devolutionReason: 'Defective product',
    };

    it('validates items are in reseller inventory', async () => {
      mockModel.db.model.mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(itemId1),
            inventoryId: { toString: () => new Types.ObjectId().toHexString() }, // wrong inv
          }),
        }),
      });

      await expect(service.createDevolutionOrder(dto, actorId)).rejects.toThrow(BadRequestException);
    });

    it('creates order with type DEVOLUTION and PENDING status', async () => {
      mockModel.db.model.mockReturnValue({
        findById: makeItemFindById(resellerInventoryId),
      });
      const createdOrder = {
        _id: new Types.ObjectId(),
        orderType: OrderType.DEVOLUTION,
        status: OrderStatus.PENDING,
        companyId: new Types.ObjectId(companyId),
        devolutionReason: dto.devolutionReason,
        items: [new Types.ObjectId(itemId1)],
      };
      mockModel.create.mockResolvedValue(createdOrder);

      const result = await service.createDevolutionOrder(dto, actorId);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderType: OrderType.DEVOLUTION,
          status: OrderStatus.PENDING,
          devolutionReason: dto.devolutionReason,
        }),
      );
      expect(result).toBe(createdOrder);
    });

    it('creates audit record', async () => {
      mockModel.db.model.mockReturnValue({
        findById: makeItemFindById(resellerInventoryId),
      });
      const createdOrder = {
        _id: new Types.ObjectId(),
        orderType: OrderType.DEVOLUTION,
        status: OrderStatus.PENDING,
        companyId: new Types.ObjectId(companyId),
        devolutionReason: dto.devolutionReason,
        items: [new Types.ObjectId(itemId1)],
      };
      mockModel.create.mockResolvedValue(createdOrder);

      await service.createDevolutionOrder(dto, actorId);

      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: EntityType.ORDER_REQUEST,
          action: AuditAction.CREATE,
        }),
      );
    });
  });

  describe('getOrderById', () => {
    it('throws NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.getOrderById(orderId)).rejects.toThrow(NotFoundException);
      await expect(service.getOrderById(orderId)).rejects.toThrow('Order not found');
    });

    it('returns order if found', async () => {
      const order = { _id: orderId, status: OrderStatus.PENDING };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });

      const result = await service.getOrderById(orderId);
      expect(result).toBe(order);
    });
  });

  describe('getOrdersByCompany', () => {
    it('returns paginated result filtered by companyId', async () => {
      const fakeOrders = [{ _id: new Types.ObjectId() }];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeOrders),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getOrdersByCompany(companyId, 1, 10);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: expect.any(Types.ObjectId) }),
      );
      expect(result.data).toBe(fakeOrders);
      expect(result.total).toBe(1);
    });

    it('applies status filter when provided', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.getOrdersByCompany(companyId, 1, 10, OrderStatus.PENDING);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.PENDING }),
      );
    });
  });

  describe('getOrdersByReseller', () => {
    it('returns paginated result filtered by creator (resellerId)', async () => {
      const resellerId = new Types.ObjectId().toHexString();
      const fakeOrders = [{ _id: new Types.ObjectId() }];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeOrders),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getOrdersByReseller(resellerId, 1, 10);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ creator: expect.any(Types.ObjectId) }),
      );
      expect(result.data).toBe(fakeOrders);
    });
  });

  describe('approveOrder', () => {
    function makePendingOrder(itemIds: string[]) {
      return {
        _id: new Types.ObjectId(orderId),
        status: OrderStatus.PENDING,
        orderType: OrderType.STANDARD,
        companyId: new Types.ObjectId(companyId),
        creator: new Types.ObjectId(actorId),
        targetInventoryId: new Types.ObjectId(resellerInventoryId),
        items: itemIds.map((id) => ({ toString: () => id })),
      };
    }

    it('throws BadRequestException if order is not PENDING', async () => {
      const approvedOrder = { ...makePendingOrder([]), status: OrderStatus.APPROVED };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(approvedOrder) });

      await expect(service.approveOrder(orderId, actorId)).rejects.toThrow(BadRequestException);
      await expect(service.approveOrder(orderId, actorId)).rejects.toThrow('Order is not pending');
    });

    it('calls moveItemBetweenInventories for each item', async () => {
      const order = makePendingOrder([itemId1, itemId2]);
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
      mockItemsService.moveItemBetweenInventories.mockResolvedValue({});
      const updatedOrder = { ...order, status: OrderStatus.APPROVED };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedOrder) });
      mockUsersService.findById.mockResolvedValue(null);

      await service.approveOrder(orderId, actorId);

      expect(mockItemsService.moveItemBetweenInventories).toHaveBeenCalledTimes(2);
      expect(mockItemsService.moveItemBetweenInventories).toHaveBeenCalledWith(
        itemId1,
        resellerInventoryId,
        actorId,
      );
      expect(mockItemsService.moveItemBetweenInventories).toHaveBeenCalledWith(
        itemId2,
        resellerInventoryId,
        actorId,
      );
    });

    it('updates order status to APPROVED', async () => {
      const order = makePendingOrder([itemId1]);
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
      mockItemsService.moveItemBetweenInventories.mockResolvedValue({});
      const updatedOrder = { ...order, status: OrderStatus.APPROVED };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedOrder) });
      mockUsersService.findById.mockResolvedValue(null);

      const result = await service.approveOrder(orderId, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        expect.objectContaining({
          $set: expect.objectContaining({ status: OrderStatus.APPROVED }),
        }),
        { new: true },
      );
      expect(result).toBe(updatedOrder);
    });

    it('creates audit with APPROVE action', async () => {
      const order = makePendingOrder([itemId1]);
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
      mockItemsService.moveItemBetweenInventories.mockResolvedValue({});
      const updatedOrder = { ...order, status: OrderStatus.APPROVED };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedOrder) });
      mockUsersService.findById.mockResolvedValue(null);

      await service.approveOrder(orderId, actorId);

      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.APPROVE }),
      );
    });

    it('fires email notification non-blocking (does not throw if email fails)', async () => {
      const order = makePendingOrder([itemId1]);
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
      mockItemsService.moveItemBetweenInventories.mockResolvedValue({});
      const updatedOrder = { ...order, status: OrderStatus.APPROVED };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedOrder) });

      const creator = { email: 'creator@example.com' };
      mockUsersService.findById.mockResolvedValue(creator);
      mockEmailService.sendOrderApprovedEmail.mockRejectedValue(new Error('smtp down'));

      // Should not throw even if email fails
      await expect(service.approveOrder(orderId, actorId)).resolves.toBeDefined();
    });
  });

  describe('rejectOrder', () => {
    function makePendingOrder() {
      return {
        _id: new Types.ObjectId(orderId),
        status: OrderStatus.PENDING,
        orderType: OrderType.STANDARD,
        companyId: new Types.ObjectId(companyId),
        creator: new Types.ObjectId(actorId),
        items: [{ toString: () => itemId1 }],
      };
    }

    it('throws BadRequestException if reason is empty', async () => {
      await expect(service.rejectOrder(orderId, actorId, '')).rejects.toThrow(BadRequestException);
      await expect(service.rejectOrder(orderId, actorId, '   ')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if reason is empty string', async () => {
      await expect(service.rejectOrder(orderId, actorId, '')).rejects.toThrow(
        'Rejection reason is required',
      );
    });

    it('throws BadRequestException if order is not PENDING', async () => {
      const approvedOrder = { ...makePendingOrder(), status: OrderStatus.APPROVED };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(approvedOrder) });

      await expect(service.rejectOrder(orderId, actorId, 'Reason')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.rejectOrder(orderId, actorId, 'Reason')).rejects.toThrow(
        'Order is not pending',
      );
    });

    it('updates order status to REJECTED with rejectionReason', async () => {
      const order = makePendingOrder();
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
      const updatedOrder = { ...order, status: OrderStatus.REJECTED, rejectionReason: 'Out of stock' };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedOrder) });
      mockUsersService.findById.mockResolvedValue(null);

      const result = await service.rejectOrder(orderId, actorId, 'Out of stock');

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        expect.objectContaining({
          $set: expect.objectContaining({
            status: OrderStatus.REJECTED,
            rejectionReason: 'Out of stock',
          }),
        }),
        { new: true },
      );
      expect(result).toBe(updatedOrder);
    });

    it('creates audit with REJECT action', async () => {
      const order = makePendingOrder();
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
      const updatedOrder = { ...order, status: OrderStatus.REJECTED };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedOrder) });
      mockUsersService.findById.mockResolvedValue(null);

      await service.rejectOrder(orderId, actorId, 'Damaged');

      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.REJECT,
          metadata: expect.objectContaining({ rejectionReason: 'Damaged' }),
        }),
      );
    });

    it('fires email notification non-blocking (does not throw if email fails)', async () => {
      const order = makePendingOrder();
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
      const updatedOrder = { ...order, status: OrderStatus.REJECTED };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedOrder) });

      const creator = { email: 'creator@example.com' };
      mockUsersService.findById.mockResolvedValue(creator);
      mockEmailService.sendOrderRejectedEmail.mockRejectedValue(new Error('smtp down'));

      await expect(service.rejectOrder(orderId, actorId, 'Bad items')).resolves.toBeDefined();
    });

    it('includes rejectionReason in audit metadata', async () => {
      const order = makePendingOrder();
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(order) });
      const updatedOrder = { ...order, status: OrderStatus.REJECTED };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedOrder) });
      mockUsersService.findById.mockResolvedValue(null);

      const reason = 'Items are damaged';
      await service.rejectOrder(orderId, actorId, reason);

      const auditCall = mockAuditsService.createAuditRecord.mock.calls[0][0];
      expect(auditCall.metadata.rejectionReason).toBe(reason);
    });
  });
});
