import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ItemsService } from './items.service';
import { AuditsService } from '../audits/audits.service';
import { InventoriesService } from '../inventories/inventories.service';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';

function createMockModel() {
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
  };
}

const mockAuditsService = {
  createAuditRecord: jest.fn().mockResolvedValue({}),
};

const mockInventoriesService = {
  getInventoryById: jest.fn(),
};

describe('ItemsService', () => {
  let service: ItemsService;
  let mockModel: ReturnType<typeof createMockModel>;

  const actorId = new Types.ObjectId().toHexString();
  const itemId = new Types.ObjectId().toHexString();
  const inventoryId = new Types.ObjectId().toHexString();
  const companyId = new Types.ObjectId().toHexString();

  const fakeInventory = {
    _id: new Types.ObjectId(inventoryId),
    name: 'Test Inv',
    companyId: new Types.ObjectId(companyId),
  };

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: getModelToken('Item'), useValue: mockModel },
        { provide: AuditsService, useValue: mockAuditsService },
        { provide: InventoriesService, useValue: mockInventoriesService },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    const dto = {
      name: 'Laptop',
      brand: 'Dell',
      serial: 'SN001',
      price: 1000,
      retailPrice: 1200,
      inventoryId,
    };

    it('throws BadRequestException if price is negative', async () => {
      await expect(
        service.addItem({ ...dto, price: -1 }, actorId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.addItem({ ...dto, price: -1 }, actorId),
      ).rejects.toThrow('Prices must be positive');
    });

    it('throws BadRequestException if retailPrice is negative', async () => {
      await expect(
        service.addItem({ ...dto, retailPrice: -5 }, actorId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException if serial already exists', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: itemId, serial: dto.serial }),
      });

      await expect(service.addItem(dto, actorId)).rejects.toThrow(ConflictException);
      await expect(service.addItem(dto, actorId)).rejects.toThrow(
        `Item with serial '${dto.serial}' already exists`,
      );
    });

    it('creates item, calls getInventoryById for companyId, creates audit on success', async () => {
      const createdItem = {
        _id: new Types.ObjectId(),
        name: dto.name,
        brand: dto.brand,
        serial: dto.serial,
        inventoryId: new Types.ObjectId(inventoryId),
      };
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.create.mockResolvedValue(createdItem);
      mockInventoriesService.getInventoryById.mockResolvedValue(fakeInventory);

      const result = await service.addItem(dto, actorId);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ serial: dto.serial.trim() }),
      );
      expect(mockInventoriesService.getInventoryById).toHaveBeenCalledWith(inventoryId);
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: EntityType.ITEM,
          action: AuditAction.CREATE,
          companyId: fakeInventory.companyId,
        }),
      );
      expect(result).toBe(createdItem);
    });

    it('trims serial before checking uniqueness', async () => {
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.create.mockResolvedValue({ _id: new Types.ObjectId(), serial: 'SN001', inventoryId: new Types.ObjectId() });
      mockInventoriesService.getInventoryById.mockResolvedValue(fakeInventory);

      await service.addItem({ ...dto, serial: '  SN001  ' }, actorId);

      expect(mockModel.findOne).toHaveBeenCalledWith({ serial: 'SN001' });
    });
  });

  describe('getItemById', () => {
    it('throws NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.getItemById(itemId)).rejects.toThrow(NotFoundException);
      await expect(service.getItemById(itemId)).rejects.toThrow('Item not found');
    });

    it('returns item if found', async () => {
      const item = { _id: itemId, name: 'Laptop' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(item) });

      const result = await service.getItemById(itemId);
      expect(result).toBe(item);
    });
  });

  describe('getItemsByInventory', () => {
    it('returns paginated result', async () => {
      const fakeItems = [{ _id: new Types.ObjectId() }];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeItems),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getItemsByInventory(inventoryId, 1, 10);

      expect(result.data).toBe(fakeItems);
      expect(result.total).toBe(1);
    });

    it('applies category filter when categoryId is provided', async () => {
      const categoryId = new Types.ObjectId().toHexString();
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.getItemsByInventory(inventoryId, 1, 10, categoryId);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: expect.any(Types.ObjectId),
        }),
      );
    });

    it('does not apply category filter when categoryId is not provided', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.getItemsByInventory(inventoryId);

      const callArg = mockModel.find.mock.calls[0][0];
      expect(callArg).not.toHaveProperty('categories');
    });
  });

  describe('updateItem', () => {
    it('throws ConflictException if new serial conflicts', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      });

      await expect(
        service.updateItem(itemId, { serial: 'CONFLICT' }, actorId),
      ).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException if price < 0', async () => {
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateItem(itemId, { price: -10 }, actorId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateItem(itemId, { price: -10 }, actorId),
      ).rejects.toThrow('Price must be positive');
    });

    it('throws BadRequestException if retailPrice < 0', async () => {
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateItem(itemId, { retailPrice: -1 }, actorId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateItem(itemId, { retailPrice: -1 }, actorId),
      ).rejects.toThrow('Retail price must be positive');
    });

    it('throws NotFoundException if item not found', async () => {
      // No serial conflict, no price issue, but item not found
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateItem(itemId, { name: 'Updated' }, actorId),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates item and creates audit on success', async () => {
      const oldItem = {
        _id: new Types.ObjectId(itemId),
        name: 'Old Laptop',
        inventoryId: new Types.ObjectId(inventoryId),
      };
      const updatedItem = { ...oldItem, name: 'New Laptop' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(oldItem) });
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedItem) });
      mockInventoriesService.getInventoryById.mockResolvedValue(fakeInventory);

      const result = await service.updateItem(itemId, { name: 'New Laptop' }, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        itemId,
        { $set: { name: 'New Laptop' } },
        { new: true },
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.UPDATE }),
      );
      expect(result).toBe(updatedItem);
    });
  });

  describe('deleteItem', () => {
    it('throws NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.deleteItem(itemId, actorId)).rejects.toThrow(NotFoundException);
    });

    it('deletes and creates audit on success', async () => {
      const item = {
        _id: new Types.ObjectId(itemId),
        name: 'Laptop',
        serial: 'SN001',
        brand: 'Dell',
        inventoryId: new Types.ObjectId(inventoryId),
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(item) });
      mockModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
      mockInventoriesService.getInventoryById.mockResolvedValue(fakeInventory);

      await service.deleteItem(itemId, actorId);

      expect(mockModel.deleteOne).toHaveBeenCalledWith({ _id: itemId });
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.DELETE }),
      );
    });
  });

  describe('moveItemBetweenInventories', () => {
    it('moves item to new inventory', async () => {
      const targetInventoryId = new Types.ObjectId().toHexString();
      const item = {
        _id: new Types.ObjectId(itemId),
        name: 'Laptop',
        serial: 'SN001',
        inventoryId: new Types.ObjectId(inventoryId),
      };
      const updatedItem = { ...item, inventoryId: new Types.ObjectId(targetInventoryId) };
      const targetInventory = {
        _id: new Types.ObjectId(targetInventoryId),
        name: 'Target Inv',
        companyId: new Types.ObjectId(companyId),
      };

      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(item) });
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedItem) });
      mockInventoriesService.getInventoryById
        .mockResolvedValueOnce(fakeInventory)   // old inventory
        .mockResolvedValueOnce(targetInventory); // new inventory

      const result = await service.moveItemBetweenInventories(itemId, targetInventoryId, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        itemId,
        { $set: { inventoryId: expect.any(Types.ObjectId) } },
        { new: true },
      );
      expect(result).toBe(updatedItem);
    });

    it('creates audit with MOVE action and metadata', async () => {
      const targetInventoryId = new Types.ObjectId().toHexString();
      const item = {
        _id: new Types.ObjectId(itemId),
        name: 'Laptop',
        serial: 'SN001',
        inventoryId: new Types.ObjectId(inventoryId),
      };
      const updatedItem = { ...item, name: 'Laptop', serial: 'SN001', inventoryId: new Types.ObjectId(targetInventoryId) };
      const targetInventory = {
        _id: new Types.ObjectId(targetInventoryId),
        name: 'Target Inv',
        companyId: new Types.ObjectId(companyId),
      };

      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(item) });
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedItem) });
      mockInventoriesService.getInventoryById
        .mockResolvedValueOnce(fakeInventory)
        .mockResolvedValueOnce(targetInventory);

      await service.moveItemBetweenInventories(itemId, targetInventoryId, actorId);

      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.MOVE,
          metadata: expect.objectContaining({
            fromInventoryId: expect.any(String),
            toInventoryId: expect.any(String),
          }),
        }),
      );
    });
  });
});
