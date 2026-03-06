import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument, UserRole } from './schemas/user.schema';
import { AuditsService } from '../audits/audits.service';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';
import {
  normalizeLimit,
  paginateSkip,
  toPaginatedResult,
  type PaginatedResult,
} from '../common/pagination.dto';

export interface CreateUserDto {
  name: string;
  email: string;
  username: string;
  password: string;
  cel: string;
  dni: string;
  typeOfDni: string;
  role: UserRole;
  companyId?: Types.ObjectId;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  username?: string;
  cel?: string;
  dni?: string;
  typeOfDni?: string;
  role?: UserRole;
  companyId?: Types.ObjectId;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private auditsService: AuditsService,
  ) {}

  async createUser(dto: CreateUserDto, actorId: string): Promise<UserDocument> {
    const existingEmail = await this.userModel.findOne({ email: dto.email.trim().toLowerCase() }).exec();
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await this.userModel.findOne({ username: dto.username }).exec();
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.trim().toLowerCase(),
      username: dto.username,
      password: dto.password, // Password will be hashed by the pre-save hook
      cel: dto.cel,
      dni: dto.dni,
      typeOfDni: dto.typeOfDni,
      role: dto.role,
      companyId: dto.companyId,
      isActive: dto.isActive ?? true,
    });

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.USER,
      entityId: user._id,
      action: AuditAction.CREATE,
      actor: new Types.ObjectId(actorId),
      description: `Created user: ${user.name} (${user.username})`,
      companyId: user.companyId,
      metadata: {
        role: user.role,
      },
    });

    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const result = await this.userModel
      .updateOne(
        { _id: userId },
        { $set: { password: hashedPassword } },
      )
      .exec();
    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async getUsersByCompany(
    companyId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<UserDocument>> {
    const l = normalizeLimit(limit);
    const [data, total] = await Promise.all([
      this.userModel
        .find({ companyId })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.userModel.countDocuments({ companyId }).exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async updateUser(
    id: string,
    updates: Partial<{ name: string; email: string; username: string; cel: string; dni: string }>,
    actorId: string,
  ): Promise<UserDocument> {
    const oldUser = await this.userModel.findById(id).exec();
    if (!oldUser) {
      throw new NotFoundException('User not found');
    }

    if (updates.email !== undefined) {
      const existing = await this.userModel
        .findOne({ email: updates.email.trim().toLowerCase(), _id: { $ne: id } })
        .exec();
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }
    if (updates.username !== undefined) {
      const existing = await this.userModel
        .findOne({ username: updates.username, _id: { $ne: id } })
        .exec();
      if (existing) {
        throw new ConflictException('Username already in use');
      }
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.USER,
      entityId: user._id,
      action: AuditAction.UPDATE,
      actor: new Types.ObjectId(actorId),
      description: `Updated user: ${user.name} (${user.username})`,
      companyId: user.companyId,
      metadata: {
        changes: updates,
      },
    });

    return user;
  }

  async deactivateUser(id: string, actorId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.USER,
      entityId: user._id,
      action: AuditAction.DEACTIVATE,
      actor: new Types.ObjectId(actorId),
      description: `Deactivated user: ${user.name} (${user.username})`,
      companyId: user.companyId,
    });

    return user;
  }

  checkRoleHierarchy(creatorRole: UserRole, targetRole: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
      [UserRole.MASTER_ADMIN]: 4,
      [UserRole.COMPANY_ADMIN]: 3,
      [UserRole.EMPLOYER]: 2,
      [UserRole.RESELLER]: 1,
    };
    return hierarchy[creatorRole] >= hierarchy[targetRole];
  }
}
