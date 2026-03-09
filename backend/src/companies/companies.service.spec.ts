import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CompaniesService } from './companies.service';
import { AuditsService } from '../audits/audits.service';
import { UsersService } from '../users/users.service';
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
    collection: {
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
    },
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

const mockUsersService = {
  getUsersByCompany: jest.fn(),
  countUsersByCompanyIds: jest.fn(),
};

describe('CompaniesService', () => {
  let service: CompaniesService;
  let mockModel: ReturnType<typeof createMockModel>;

  const actorId = new Types.ObjectId().toHexString();
  const companyId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: getModelToken('Company'), useValue: mockModel },
        { provide: AuditsService, useValue: mockAuditsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    const dto = { name: 'ACME Corp', nit: '123456789' };

    it('throws ConflictException if NIT already exists', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: companyId, nit: dto.nit }),
      });

      await expect(service.createCompany(dto, actorId)).rejects.toThrow(ConflictException);
      await expect(service.createCompany(dto, actorId)).rejects.toThrow(
        'Company with this NIT already exists',
      );
    });

    it('creates company and creates audit record on success', async () => {
      const created = { _id: new Types.ObjectId(), name: dto.name, nit: dto.nit };
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.create.mockResolvedValue(created);

      const result = await service.createCompany(dto, actorId);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ nit: dto.nit.trim() }),
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: EntityType.COMPANY,
          action: AuditAction.CREATE,
        }),
      );
      expect(result).toBe(created);
    });

    it('trims NIT before saving', async () => {
      const dtoWithSpaces = { name: 'ACME', nit: '  123  ' };
      const created = { _id: new Types.ObjectId(), name: 'ACME', nit: '123' };
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.create.mockResolvedValue(created);

      await service.createCompany(dtoWithSpaces, actorId);

      expect(mockModel.findOne).toHaveBeenCalledWith({ nit: '123' });
    });
  });

  describe('getCompanyById', () => {
    it('throws NotFoundException if company not found', async () => {
      mockModel.collection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      await expect(service.getCompanyById(companyId)).rejects.toThrow(NotFoundException);
      await expect(service.getCompanyById(companyId)).rejects.toThrow('Company not found');
    });

    it('returns company if found', async () => {
      const company = { _id: new Types.ObjectId(), name: 'ACME' };
      mockModel.collection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([company]),
      });
      mockUsersService.countUsersByCompanyIds.mockResolvedValue({
        [company._id.toString()]: 2,
      });

      const result = await service.getCompanyById(companyId);
      expect(result).toBe(company);
      expect((result as any).userCount).toBe(2);
    });
  });

  describe('getAllCompanies', () => {
    it('returns paginated result', async () => {
      const c1 = { _id: new Types.ObjectId() };
      const fakeCompanies = [c1];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeCompanies),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
      mockUsersService.countUsersByCompanyIds.mockResolvedValue({
        [c1._id.toString()]: 3,
      });

      const result = await service.getAllCompanies(1, 10);

      expect(result.data).toHaveLength(1);
      expect((result.data as any)[0]._id).toEqual(c1._id);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect((result.data as any)[0].userCount).toBe(3);
    });
  });

  describe('updateCompany', () => {
    it('throws NotFoundException if company not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.updateCompany(companyId, { name: 'New' }, actorId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if new NIT already used by another company', async () => {
      const existingCompany = { _id: companyId, name: 'Old Corp' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingCompany) });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'other-company', nit: '999' }),
      });

      await expect(
        service.updateCompany(companyId, { nit: '999' }, actorId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.updateCompany(companyId, { nit: '999' }, actorId),
      ).rejects.toThrow('Company with this NIT already exists');
    });

    it('updates company and creates audit on success', async () => {
      const existingCompany = { _id: new Types.ObjectId(), name: 'Old Corp' };
      const updatedCompany = { _id: existingCompany._id, name: 'New Corp' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingCompany) });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCompany),
      });

      const result = await service.updateCompany(companyId, { name: 'New Corp' }, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        companyId,
        { $set: { name: 'New Corp' } },
        { new: true },
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.UPDATE }),
      );
      expect(result).toBe(updatedCompany);
    });

    it('skips NIT conflict check when nit is not in dto', async () => {
      const existingCompany = { _id: new Types.ObjectId(), name: 'Old' };
      const updatedCompany = { _id: existingCompany._id, name: 'New' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingCompany) });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCompany),
      });

      await service.updateCompany(companyId, { name: 'New' }, actorId);

      // findOne should NOT be called for NIT check
      expect(mockModel.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getCompanyUsers', () => {
    it('delegates to usersService.getUsersByCompany', async () => {
      const paginatedResult = { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      mockUsersService.getUsersByCompany.mockResolvedValue(paginatedResult);

      const result = await service.getCompanyUsers(companyId, 1, 10);

      expect(mockUsersService.getUsersByCompany).toHaveBeenCalledWith(companyId, 1, 10, undefined);
      expect(result).toBe(paginatedResult);
    });
  });
});
