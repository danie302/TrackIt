import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { InventoriesService } from './inventories.service';
import { AuditsService } from '../audits/audits.service';
import { UserRole } from '../users/schemas/user.schema';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';

function createMockModel() {
  const itemCountExec = jest.fn();
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
    updateOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
    db: {
      model: jest.fn().mockReturnValue({
        countDocuments: jest.fn().mockReturnValue({ exec: itemCountExec }),
      }),
    },
    _itemCountExec: itemCountExec,
  };
}

const mockAuditsService = {
  createAuditRecord: jest.fn().mockResolvedValue({}),
};

describe('InventoriesService', () => {
  let service: InventoriesService;
  let mockModel: ReturnType<typeof createMockModel>;

  const actorId = new Types.ObjectId().toHexString();
  const companyId = new Types.ObjectId().toHexString();
  const inventoryId = new Types.ObjectId().toHexString();
  const resellerId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoriesService,
        { provide: getModelToken('Inventory'), useValue: mockModel },
        { provide: AuditsService, useValue: mockAuditsService },
      ],
    }).compile();

    service = module.get<InventoriesService>(InventoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventory', () => {
    it('throws BadRequestException if isResellerInventory=true but no resellerId', async () => {
      const dto = {
        name: 'Reseller Inv',
        companyId,
        isResellerInventory: true,
      };

      await expect(service.createInventory(dto, actorId)).rejects.toThrow(BadRequestException);
      await expect(service.createInventory(dto, actorId)).rejects.toThrow(
        'resellerId is required for reseller inventory',
      );
    });

    it('creates correctly for company inventory', async () => {
      const dto = { name: 'Main Warehouse', companyId, isResellerInventory: false };
      const created = {
        _id: new Types.ObjectId(),
        name: dto.name,
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: false,
      };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createInventory(dto, actorId);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          isResellerInventory: false,
          whitelist: [],
        }),
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: EntityType.INVENTORY,
          action: AuditAction.CREATE,
        }),
      );
      expect(result).toBe(created);
    });

    it('creates correctly for reseller inventory', async () => {
      const dto = {
        name: 'Reseller Inv',
        companyId,
        isResellerInventory: true,
        resellerId,
      };
      const created = {
        _id: new Types.ObjectId(),
        name: dto.name,
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: true,
        resellerId: new Types.ObjectId(resellerId),
      };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createInventory(dto, actorId);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isResellerInventory: true,
          resellerId: expect.any(Types.ObjectId),
        }),
      );
      expect(result).toBe(created);
    });
  });

  describe('getInventoryById', () => {
    it('throws NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.getInventoryById(inventoryId)).rejects.toThrow(NotFoundException);
      await expect(service.getInventoryById(inventoryId)).rejects.toThrow('Inventory not found');
    });

    it('returns inventory if found', async () => {
      const inv = { _id: inventoryId, name: 'Main' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      const result = await service.getInventoryById(inventoryId);
      expect(result).toBe(inv);
    });
  });

  describe('checkInventoryAccess', () => {
    it('returns false if inventory not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.checkInventoryAccess(
        inventoryId,
        actorId,
        UserRole.EMPLOYER,
      );
      expect(result).toBe(false);
    });

    it('MasterAdmin always returns true', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: false,
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      const result = await service.checkInventoryAccess(
        inventoryId,
        actorId,
        UserRole.MASTER_ADMIN,
      );
      expect(result).toBe(true);
    });

    it('returns true for non-reseller inventory when companyId matches', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: false,
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      const result = await service.checkInventoryAccess(
        inventoryId,
        actorId,
        UserRole.COMPANY_ADMIN,
        new Types.ObjectId(companyId),
      );
      expect(result).toBe(true);
    });

    it('returns false for non-reseller inventory when companyId does not match', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: false,
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      const result = await service.checkInventoryAccess(
        inventoryId,
        actorId,
        UserRole.COMPANY_ADMIN,
        new Types.ObjectId(), // different companyId
      );
      expect(result).toBe(false);
    });

    it('returns true for reseller inventory when resellerId matches userId', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: true,
        resellerId: { toString: () => resellerId },
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      const result = await service.checkInventoryAccess(
        inventoryId,
        resellerId,
        UserRole.RESELLER,
      );
      expect(result).toBe(true);
    });

    it('returns false for reseller inventory when resellerId does not match userId', async () => {
      const differentUserId = new Types.ObjectId().toHexString();
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: true,
        resellerId: { toString: () => resellerId },
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      const result = await service.checkInventoryAccess(
        inventoryId,
        differentUserId,
        UserRole.RESELLER,
      );
      expect(result).toBe(false);
    });
  });

  describe('updateInventory', () => {
    it('throws NotFoundException if not found on first findById', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateInventory(inventoryId, { name: 'New' }, actorId),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates and creates audit on success', async () => {
      const oldInv = { _id: new Types.ObjectId(inventoryId), name: 'Old', companyId: new Types.ObjectId(companyId) };
      const updatedInv = { ...oldInv, name: 'New' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(oldInv) });
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedInv) });

      const result = await service.updateInventory(inventoryId, { name: 'New' }, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        inventoryId,
        { $set: { name: 'New' } },
        { new: true },
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.UPDATE }),
      );
      expect(result).toBe(updatedInv);
    });
  });

  describe('deleteInventory', () => {
    it('throws BadRequestException if inventory has items', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        name: 'Full',
        companyId: new Types.ObjectId(companyId),
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });
      mockModel.db.model.mockReturnValue({
        countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(5) }),
      });

      await expect(service.deleteInventory(inventoryId, actorId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.deleteInventory(inventoryId, actorId)).rejects.toThrow(
        'Cannot delete inventory that contains items',
      );
    });

    it('deletes and creates audit on success', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        name: 'Empty',
        companyId: new Types.ObjectId(companyId),
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });
      mockModel.db.model.mockReturnValue({
        countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      });
      mockModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });

      await service.deleteInventory(inventoryId, actorId);

      expect(mockModel.deleteOne).toHaveBeenCalledWith({ _id: inventoryId });
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.DELETE }),
      );
    });
  });

  describe('addResellerToWhitelist', () => {
    it('throws BadRequestException if inventory is a reseller inventory', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        name: 'Reseller Inv',
        isResellerInventory: true,
        whitelist: [],
        companyId: new Types.ObjectId(companyId),
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      await expect(
        service.addResellerToWhitelist(inventoryId, resellerId, actorId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.addResellerToWhitelist(inventoryId, resellerId, actorId),
      ).rejects.toThrow('Cannot whitelist on reseller inventory');
    });

    it('returns existing inventory if reseller is already whitelisted', async () => {
      const resellerObjId = new Types.ObjectId(resellerId);
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        name: 'Company Inv',
        isResellerInventory: false,
        whitelist: [{ equals: (id: Types.ObjectId) => id.equals(resellerObjId) }],
        companyId: new Types.ObjectId(companyId),
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      const result = await service.addResellerToWhitelist(inventoryId, resellerId, actorId);

      expect(mockModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result).toBe(inv);
    });

    it('adds to whitelist and creates audit if not already whitelisted', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        name: 'Company Inv',
        isResellerInventory: false,
        whitelist: [],
        companyId: new Types.ObjectId(companyId),
      };
      const updated = { ...inv, whitelist: [new Types.ObjectId(resellerId)] };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      const result = await service.addResellerToWhitelist(inventoryId, resellerId, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        inventoryId,
        { $addToSet: { whitelist: expect.any(Types.ObjectId) } },
        { new: true },
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ action: 'add_to_whitelist' }),
        }),
      );
      expect(result).toBe(updated);
    });
  });

  describe('removeResellerFromWhitelist', () => {
    it('throws NotFoundException if inventory not found', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.removeResellerFromWhitelist(inventoryId, resellerId, actorId),
      ).rejects.toThrow(NotFoundException);
    });

    it('removes from whitelist and creates audit', async () => {
      const updated = {
        _id: new Types.ObjectId(inventoryId),
        name: 'Company Inv',
        whitelist: [],
        companyId: new Types.ObjectId(companyId),
      };
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      const result = await service.removeResellerFromWhitelist(inventoryId, resellerId, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        inventoryId,
        { $pull: { whitelist: expect.any(Types.ObjectId) } },
        { new: true },
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ action: 'remove_from_whitelist' }),
        }),
      );
      expect(result).toBe(updated);
    });
  });

  describe('getInventoryByIdWithAccess', () => {
    it('throws ForbiddenException if user does not have access', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: false,
      };
      // findById returns inventory on first call (getInventoryById), then same inv for access check
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      // User's companyId doesn't match
      await expect(
        service.getInventoryByIdWithAccess(
          inventoryId,
          actorId,
          UserRole.COMPANY_ADMIN,
          new Types.ObjectId(), // different companyId
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns inventory when user has access', async () => {
      const inv = {
        _id: new Types.ObjectId(inventoryId),
        companyId: new Types.ObjectId(companyId),
        isResellerInventory: false,
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(inv) });

      const result = await service.getInventoryByIdWithAccess(
        inventoryId,
        actorId,
        UserRole.MASTER_ADMIN,
      );

      expect(result).toBe(inv);
    });
  });

  describe('getInventoriesByCompany', () => {
    it('returns paginated result with companyOnly filter by default', async () => {
      const fakeInvs = [{ _id: new Types.ObjectId() }];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeInvs),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getInventoriesByCompany(companyId, 1, 10, true);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ isResellerInventory: false }),
      );
      expect(result.data).toBe(fakeInvs);
      expect(result.total).toBe(1);
    });

    it('returns all inventories when companyOnly is false', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.getInventoriesByCompany(companyId, 1, 10, false);

      const callArg = mockModel.find.mock.calls[0][0];
      expect(callArg).not.toHaveProperty('isResellerInventory');
    });
  });

  describe('getResellerInventories', () => {
    it('returns inventories for a given reseller', async () => {
      const fakeInvs = [{ _id: new Types.ObjectId(), resellerId: new Types.ObjectId(resellerId) }];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeInvs),
      });

      const result = await service.getResellerInventories(resellerId);

      expect(mockModel.find).toHaveBeenCalledWith({
        resellerId: expect.any(Types.ObjectId),
      });
      expect(result).toBe(fakeInvs);
    });
  });

  describe('getWhitelistedInventoriesForReseller', () => {
    it('returns paginated inventories whitelisted for reseller', async () => {
      const fakeInvs = [{ _id: new Types.ObjectId() }];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeInvs),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getWhitelistedInventoriesForReseller(resellerId, 1, 10);

      expect(mockModel.find).toHaveBeenCalledWith({
        isResellerInventory: false,
        whitelist: expect.any(Types.ObjectId),
      });
      expect(result.data).toBe(fakeInvs);
    });
  });
});
