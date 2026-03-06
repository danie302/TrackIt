import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument, UserRole } from './schemas/user.schema';
import {
  normalizeLimit,
  paginateSkip,
  toPaginatedResult,
  type PaginatedResult,
} from '../common/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

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
  ): Promise<UserDocument> {
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
    return user;
  }

  async deactivateUser(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
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
