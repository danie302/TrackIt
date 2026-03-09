import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';
import { AuditsService } from '../audits/audits.service';
import { EmailService } from '../email/email.service';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';

function createMockModel() {
  return {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }),
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }),
    findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }),
    deleteOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    updateOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    countDocuments: jest.fn().mockReturnValue({ exec: jest.fn() }),
  };
}

const mockAuditsService = {
  createAuditRecord: jest.fn().mockResolvedValue({}),
};

const mockEmailService = {
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendUserDeactivationEmail: jest.fn().mockResolvedValue(undefined),
};

describe('UsersService', () => {
  let service: UsersService;
  let mockModel: ReturnType<typeof createMockModel>;

  const actorId = new Types.ObjectId().toHexString();
  const userId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken('User'), useValue: mockModel },
        { provide: AuditsService, useValue: mockAuditsService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const dto = {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'secret',
      cel: '1234567890',
      dni: '123456',
      typeOfDni: 'CC',
      role: UserRole.EMPLOYER,
    };

    it('throws ConflictException if email already exists', async () => {
      mockModel.findOne
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: userId }) });

      await expect(service.createUser(dto, actorId)).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException with correct message if email already exists', async () => {
      mockModel.findOne
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: userId }) });

      await expect(service.createUser(dto, actorId)).rejects.toThrow('Email already in use');
    });

    it('throws ConflictException if username already exists', async () => {
      mockModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: userId }) });

      await expect(service.createUser(dto, actorId)).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException with correct message if username already exists', async () => {
      mockModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: userId }) });

      await expect(service.createUser(dto, actorId)).rejects.toThrow('Username already in use');
    });

    it('creates user, calls createAuditRecord and sendWelcomeEmail on success', async () => {
      const createdUser = {
        _id: new Types.ObjectId(),
        name: dto.name,
        email: dto.email.toLowerCase(),
        username: dto.username,
        role: dto.role,
        companyId: undefined,
      };
      mockModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.create.mockResolvedValue(createdUser);

      const result = await service.createUser(dto, actorId);

      expect(mockModel.create).toHaveBeenCalled();
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: EntityType.USER,
          action: AuditAction.CREATE,
        }),
      );
      expect(result).toBe(createdUser);
    });

    it('swallows sendWelcomeEmail errors (fire-and-forget)', async () => {
      const createdUser = {
        _id: new Types.ObjectId(),
        name: dto.name,
        email: dto.email.toLowerCase(),
        username: dto.username,
        role: dto.role,
        companyId: undefined,
      };
      mockModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      mockModel.create.mockResolvedValue(createdUser);
      mockEmailService.sendWelcomeEmail.mockRejectedValue(new Error('email error'));

      await expect(service.createUser(dto, actorId)).resolves.toBe(createdUser);
    });
  });

  describe('findById', () => {
    it('returns null if user not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.findById(userId);
      expect(result).toBeNull();
    });

    it('returns user document if found', async () => {
      const user = { _id: userId, name: 'Alice' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

      const result = await service.findById(userId);
      expect(result).toBe(user);
    });
  });

  describe('findByEmail', () => {
    it('returns user by lowercase email', async () => {
      const user = { _id: userId, email: 'alice@example.com' };
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

      const result = await service.findByEmail('ALICE@example.com');
      expect(result).toBe(user);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        email: 'alice@example.com',
      });
    });

    it('returns null when email not found', async () => {
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.findByEmail('nobody@example.com');
      expect(result).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('calls updateOne with hashed password', async () => {
      mockModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ matchedCount: 1 }),
      });

      await service.updatePassword(userId, 'hashedpassword');

      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $set: { password: 'hashedpassword' } },
      );
    });

    it('throws NotFoundException if user not found (matchedCount 0)', async () => {
      mockModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ matchedCount: 0 }),
      });

      await expect(service.updatePassword(userId, 'hash')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsersByCompany', () => {
    it('returns paginated result', async () => {
      const fakeUsers = [{ _id: new Types.ObjectId() }];
      mockModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fakeUsers),
      });
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.getUsersByCompany('company-id', 1, 10);

      expect(result.data).toBe(fakeUsers);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('updateUser', () => {
    it('throws NotFoundException if user not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.updateUser(userId, { name: 'New' }, actorId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException if new email already used by another user', async () => {
      const existingUser = { _id: userId, name: 'Old' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingUser) });
      mockModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ _id: 'other-user' }),
      });

      await expect(
        service.updateUser(userId, { email: 'taken@example.com' }, actorId),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if new username already used by another user', async () => {
      const existingUser = { _id: userId, name: 'Old' };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingUser) });
      // email check returns null, username check returns conflict
      mockModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ _id: 'other-user' }) });

      await expect(
        service.updateUser(userId, { email: 'free@example.com', username: 'taken' }, actorId),
      ).rejects.toThrow(ConflictException);
    });

    it('calls findByIdAndUpdate and auditsService on success', async () => {
      const existingUser = { _id: new Types.ObjectId(), name: 'Old' };
      const updatedUser = {
        _id: existingUser._id,
        name: 'New',
        username: 'newuser',
        companyId: undefined,
      };
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingUser) });
      mockModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.updateUser(userId, { name: 'New' }, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: { name: 'New' } },
        { new: true },
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.UPDATE }),
      );
      expect(result).toBe(updatedUser);
    });
  });

  describe('deactivateUser', () => {
    it('throws NotFoundException if user not found', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deactivateUser(userId, actorId)).rejects.toThrow(NotFoundException);
    });

    it('sets isActive false, creates audit, calls sendUserDeactivationEmail', async () => {
      const deactivatedUser = {
        _id: new Types.ObjectId(),
        name: 'Bob',
        email: 'bob@example.com',
        username: 'bob',
        companyId: undefined,
      };
      mockModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(deactivatedUser),
      });

      const result = await service.deactivateUser(userId, actorId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $set: { isActive: false } },
        { new: true },
      );
      expect(mockAuditsService.createAuditRecord).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.DEACTIVATE }),
      );
      expect(result).toBe(deactivatedUser);
    });

    it('swallows sendUserDeactivationEmail errors', async () => {
      const user = {
        _id: new Types.ObjectId(),
        name: 'Eve',
        email: 'eve@example.com',
        username: 'eve',
        companyId: undefined,
      };
      mockModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(user),
      });
      mockEmailService.sendUserDeactivationEmail.mockRejectedValue(new Error('smtp down'));

      await expect(service.deactivateUser(userId, actorId)).resolves.toBe(user);
    });
  });

  describe('checkRoleHierarchy', () => {
    it('MasterAdmin >= MasterAdmin returns true', () => {
      expect(service.checkRoleHierarchy(UserRole.MASTER_ADMIN, UserRole.MASTER_ADMIN)).toBe(true);
    });

    it('MasterAdmin >= CompanyAdmin returns true', () => {
      expect(service.checkRoleHierarchy(UserRole.MASTER_ADMIN, UserRole.COMPANY_ADMIN)).toBe(true);
    });

    it('MasterAdmin >= Employer returns true', () => {
      expect(service.checkRoleHierarchy(UserRole.MASTER_ADMIN, UserRole.EMPLOYER)).toBe(true);
    });

    it('MasterAdmin >= Reseller returns true', () => {
      expect(service.checkRoleHierarchy(UserRole.MASTER_ADMIN, UserRole.RESELLER)).toBe(true);
    });

    it('CompanyAdmin >= CompanyAdmin returns true', () => {
      expect(service.checkRoleHierarchy(UserRole.COMPANY_ADMIN, UserRole.COMPANY_ADMIN)).toBe(true);
    });

    it('CompanyAdmin >= Employer returns true', () => {
      expect(service.checkRoleHierarchy(UserRole.COMPANY_ADMIN, UserRole.EMPLOYER)).toBe(true);
    });

    it('CompanyAdmin >= Reseller returns true', () => {
      expect(service.checkRoleHierarchy(UserRole.COMPANY_ADMIN, UserRole.RESELLER)).toBe(true);
    });

    it('Reseller < CompanyAdmin returns false', () => {
      expect(service.checkRoleHierarchy(UserRole.RESELLER, UserRole.COMPANY_ADMIN)).toBe(false);
    });

    it('Reseller < MasterAdmin returns false', () => {
      expect(service.checkRoleHierarchy(UserRole.RESELLER, UserRole.MASTER_ADMIN)).toBe(false);
    });

    it('Employer < CompanyAdmin returns false', () => {
      expect(service.checkRoleHierarchy(UserRole.EMPLOYER, UserRole.COMPANY_ADMIN)).toBe(false);
    });

    it('Employer >= Reseller returns true', () => {
      expect(service.checkRoleHierarchy(UserRole.EMPLOYER, UserRole.RESELLER)).toBe(true);
    });
  });
});
