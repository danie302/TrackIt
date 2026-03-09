import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoriesService } from './categories.service';
import { AuditsService } from '../audits/audits.service';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';

function createMockModel() {
  const itemCountDocExec = jest.fn();
  const itemFindOneExec = jest.fn();
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
        findOne: jest.fn().mockReturnValue({ exec: itemFindOneExec }),
        countDocuments: jest.fn().mockReturnValue({ exec: itemCountDocExec }),
      }),
    },
    _itemCountDocExec: itemCountDocExec,
    _itemFindOneExec: itemFindOneExec,
  };
}

const mockAuditsService = {
  createAuditRecord: jest.fn().mockResolvedValue({}),
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockModel: ReturnType<typeof createMockModel>;

  const actorId = new Types.ObjectId().toHexString();
  const companyId = new Types.ObjectId().toHexString();
  const categoryId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getModelToken('Category'), useValue: mockModel },
        { provide: AuditsService, useValue: mockAuditsService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    const dto = { name: 'Electronics', companyId };

    it('throws ConflictException if name exists in same company', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: categoryId, name: dto.name }),
      });

      await expect(service.createCategory(dto, actorId)).rejects.toThrow(ConflictException);
      await expect(service.createCategory(dto, actorId)).rejects.toThrow(
        'Category with this name already exists for this company',
      );
    });

    it('creates category and audit on success', async () => {
      const created = {
        _id: new Types.ObjectId(),
        name: dto.name,
        companyId: new Types.ObjectId(companyId),
      };
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.create.mockResolvedValue(created);

      const result = await service.createCategory(dto, actorId);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: dto.name.trim() }),
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: EntityType.CATEGORY,
          action: AuditAction.CREATE,
        }),
      );
      expect(result).toBe(created);
    });

    it('trims the category name', async () => {
      const dtoWithSpace = { name: '  Electronics  ', companyId };
      const created = { _id: new Types.ObjectId(), name: 'Electronics', companyId: new Types.ObjectId(companyId) };
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.create.mockResolvedValue(created);

      await service.createCategory(dtoWithSpace, actorId);

      expect(mockModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Electronics' }),
      );
    });
  });

  describe('getCategoriesByCompany', () => {
    it('returns paginated result filtered by companyId', async () => {
      const fakeCategories = [{ _id: new Types.ObjectId(), name: 'Electronics' }];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeCategories),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getCategoriesByCompany(companyId, 1, 10);

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: expect.any(Types.ObjectId) }),
      );
      expect(result.data).toBe(fakeCategories);
      expect(result.total).toBe(1);
    });
  });

  describe('getCategoryById', () => {
    it('throws NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.getCategoryById(categoryId)).rejects.toThrow(NotFoundException);
      await expect(service.getCategoryById(categoryId)).rejects.toThrow('Category not found');
    });

    it('returns category if found', async () => {
      const category = { _id: categoryId, name: 'Electronics' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(category) });

      const result = await service.getCategoryById(categoryId);
      expect(result).toBe(category);
    });
  });

  describe('updateCategory', () => {
    it('throws NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateCategory(categoryId, { name: 'New' }, actorId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if new name conflicts with existing category', async () => {
      const existing = { _id: new Types.ObjectId(categoryId), companyId: new Types.ObjectId(companyId) };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), name: 'Conflict' }),
      });

      await expect(
        service.updateCategory(categoryId, { name: 'Conflict' }, actorId),
      ).rejects.toThrow(ConflictException);
    });

    it('updates category and creates audit on success', async () => {
      const existing = { _id: new Types.ObjectId(categoryId), companyId: new Types.ObjectId(companyId) };
      const updated = { _id: existing._id, name: 'New Name', companyId: existing.companyId };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      const result = await service.updateCategory(categoryId, { name: 'New Name' }, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        categoryId,
        { $set: { name: 'New Name' } },
        { new: true },
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.UPDATE }),
      );
      expect(result).toBe(updated);
    });

    it('skips name conflict check when name is not in dto', async () => {
      // updateCategory with empty dto (no name)
      const existing = { _id: new Types.ObjectId(categoryId), companyId: new Types.ObjectId(companyId) };
      const updated = { ...existing, name: 'Same' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      await service.updateCategory(categoryId, {}, actorId);

      expect(mockModel.findOne).not.toHaveBeenCalled();
    });
  });

  describe('checkCategoryUsage', () => {
    it('returns true if items use the category', async () => {
      mockModel.db.model.mockReturnValue({
        countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(3) }),
      });

      const result = await service.checkCategoryUsage(categoryId);
      expect(result).toBe(true);
    });

    it('returns false if no items use the category', async () => {
      mockModel.db.model.mockReturnValue({
        countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      });

      const result = await service.checkCategoryUsage(categoryId);
      expect(result).toBe(false);
    });

    it('passes the correct categoryId as ObjectId to countDocuments', async () => {
      const countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });
      mockModel.db.model.mockReturnValue({ countDocuments });

      await service.checkCategoryUsage(categoryId);

      expect(countDocuments).toHaveBeenCalledWith({
        categories: expect.any(Types.ObjectId),
      });
    });
  });

  describe('deleteCategory', () => {
    it('throws NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.deleteCategory(categoryId, actorId)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if category is in use', async () => {
      const category = {
        _id: new Types.ObjectId(categoryId),
        name: 'Electronics',
        companyId: new Types.ObjectId(companyId),
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(category) });
      mockModel.db.model.mockReturnValue({
        countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
      });

      await expect(service.deleteCategory(categoryId, actorId)).rejects.toThrow(BadRequestException);
      await expect(service.deleteCategory(categoryId, actorId)).rejects.toThrow(
        'Cannot delete category that is assigned to items',
      );
    });

    it('deletes category and creates audit on success', async () => {
      const category = {
        _id: new Types.ObjectId(categoryId),
        name: 'Electronics',
        companyId: new Types.ObjectId(companyId),
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(category) });
      mockModel.db.model.mockReturnValue({
        countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      });
      mockModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });

      await service.deleteCategory(categoryId, actorId);

      expect(mockModel.deleteOne).toHaveBeenCalledWith({ _id: categoryId });
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.DELETE }),
      );
    });
  });
});
