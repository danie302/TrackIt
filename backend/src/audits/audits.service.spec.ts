import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AuditsService } from './audits.service';
import { EntityType, AuditAction } from './schemas/audit.schema';

function createMockModel() {
  const execMock = jest.fn();
  const chainMock = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: execMock,
  };
  return {
    create: jest.fn(),
    find: jest.fn().mockReturnValue(chainMock),
    countDocuments: jest.fn().mockReturnValue({ exec: execMock }),
    findById: jest.fn().mockReturnValue({ exec: execMock }),
    findOne: jest.fn().mockReturnValue({ exec: execMock }),
    findByIdAndUpdate: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), exec: execMock }),
    deleteOne: jest.fn().mockReturnValue({ exec: execMock }),
    updateOne: jest.fn().mockReturnValue({ exec: execMock }),
    _execMock: execMock,
    _chainMock: chainMock,
  };
}

describe('AuditsService', () => {
  let service: AuditsService;
  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditsService,
        {
          provide: getModelToken('Audit'),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AuditsService>(AuditsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAuditRecord', () => {
    it('calls model.create with the provided dto', async () => {
      const dto = {
        entityType: EntityType.USER,
        entityId: new Types.ObjectId(),
        action: AuditAction.CREATE,
        actor: new Types.ObjectId(),
        description: 'Created user: Test',
        companyId: new Types.ObjectId(),
      };
      const created = { ...dto, _id: new Types.ObjectId() };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createAuditRecord(dto);

      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });

    it('returns the created audit record', async () => {
      const record = { _id: new Types.ObjectId(), description: 'test' };
      mockModel.create.mockResolvedValue(record);

      const result = await service.createAuditRecord({
        entityType: EntityType.ITEM,
        entityId: new Types.ObjectId(),
        action: AuditAction.UPDATE,
        actor: new Types.ObjectId(),
        description: 'test',
      });

      expect(result).toBe(record);
    });
  });

  describe('getAuditsByEntity', () => {
    it('calls find with entityType and ObjectId-converted entityId', async () => {
      const entityId = new Types.ObjectId().toHexString();
      const fakeData = [{ _id: new Types.ObjectId() }];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeData),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getAuditsByEntity(EntityType.ITEM, entityId, 1, 10);

      expect(mockModel.find).toHaveBeenCalledWith({
        entityType: EntityType.ITEM,
        entityId: expect.any(Types.ObjectId),
      });
      expect(result.data).toBe(fakeData);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('calls countDocuments with entityType and ObjectId filter', async () => {
      const entityId = new Types.ObjectId().toHexString();

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(5) });

      const result = await service.getAuditsByEntity(EntityType.USER, entityId, 1, 10);

      expect(mockModel.countDocuments).toHaveBeenCalledWith({
        entityType: EntityType.USER,
        entityId: expect.any(Types.ObjectId),
      });
      expect(result.total).toBe(5);
    });

    it('uses normalized limit and returns correct totalPages', async () => {
      const entityId = new Types.ObjectId().toHexString();

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(20) });

      // Passing invalid limit 7 → normalizes to 10
      const result = await service.getAuditsByEntity(EntityType.ITEM, entityId, 2, 7);

      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('getAuditsByActor', () => {
    it('calls find with actor ObjectId filter', async () => {
      const actorId = new Types.ObjectId().toHexString();
      const fakeData = [{ _id: new Types.ObjectId() }];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeData),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getAuditsByActor(actorId, 1, 10);

      expect(mockModel.find).toHaveBeenCalledWith({
        actor: expect.any(Types.ObjectId),
      });
      expect(result.data).toBe(fakeData);
    });

    it('calls countDocuments with actor filter', async () => {
      const actorId = new Types.ObjectId().toHexString();

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(3) });

      const result = await service.getAuditsByActor(actorId);

      expect(mockModel.countDocuments).toHaveBeenCalledWith({
        actor: expect.any(Types.ObjectId),
      });
      expect(result.total).toBe(3);
    });
  });

  describe('getAuditsByCompany', () => {
    it('calls find with companyId filter', async () => {
      const companyId = new Types.ObjectId().toHexString();

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.getAuditsByCompany(companyId);

      expect(mockModel.find).toHaveBeenCalledWith({
        companyId: expect.any(Types.ObjectId),
      });
    });

    it('adds action filter when action is provided', async () => {
      const companyId = new Types.ObjectId().toHexString();

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.getAuditsByCompany(companyId, 1, 10, AuditAction.CREATE);

      expect(mockModel.find).toHaveBeenCalledWith({
        companyId: expect.any(Types.ObjectId),
        action: AuditAction.CREATE,
      });
    });

    it('does not add action filter when action is not provided', async () => {
      const companyId = new Types.ObjectId().toHexString();

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.getAuditsByCompany(companyId);

      const findCallArg = mockModel.find.mock.calls[0][0];
      expect(findCallArg).not.toHaveProperty('action');
    });
  });

  describe('getItemAuditTrail', () => {
    it('delegates to getAuditsByEntity with EntityType.ITEM', async () => {
      const itemId = new Types.ObjectId().toHexString();
      const fakeData = [{ _id: new Types.ObjectId() }];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeData),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });

      const result = await service.getItemAuditTrail(itemId, 1, 10);

      expect(mockModel.find).toHaveBeenCalledWith({
        entityType: EntityType.ITEM,
        entityId: expect.any(Types.ObjectId),
      });
      expect(result.data).toBe(fakeData);
      expect(result.total).toBe(2);
    });

    it('passes page and limit through to getAuditsByEntity', async () => {
      const itemId = new Types.ObjectId().toHexString();

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      const result = await service.getItemAuditTrail(itemId, 3, 20);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
    });
  });
});
