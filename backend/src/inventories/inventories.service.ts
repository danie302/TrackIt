import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InventoryDocument } from './schemas/inventory.schema';
import { UserRole } from '../users/schemas/user.schema';
import {
  normalizeLimit,
  paginateSkip,
  toPaginatedResult,
  type PaginatedResult,
} from '../common/pagination.dto';

export interface CreateInventoryDto {
  name: string;
  companyId: string;
  isResellerInventory: boolean;
  resellerId?: string;
  categories?: string[];
}

export interface UpdateInventoryDto {
  name?: string;
  categories?: Types.ObjectId[];
}

@Injectable()
export class InventoriesService {
  constructor(
    @InjectModel('Inventory') private inventoryModel: Model<InventoryDocument>,
  ) {}

  async createInventory(dto: CreateInventoryDto): Promise<InventoryDocument> {
    if (dto.isResellerInventory && !dto.resellerId) {
      throw new BadRequestException('resellerId is required for reseller inventory');
    }
    return this.inventoryModel.create({
      name: dto.name,
      companyId: new Types.ObjectId(dto.companyId),
      isResellerInventory: dto.isResellerInventory,
      resellerId: dto.resellerId ? new Types.ObjectId(dto.resellerId) : undefined,
      categories: (dto.categories ?? []).map((id) => new Types.ObjectId(id)),
      whitelist: [],
    });
  }

  async getInventoryById(id: string): Promise<InventoryDocument> {
    const inv = await this.inventoryModel.findById(id).exec();
    if (!inv) {
      throw new NotFoundException('Inventory not found');
    }
    return inv;
  }

  async checkInventoryAccess(
    inventoryId: string,
    userId: string,
    userRole: UserRole,
    userCompanyId?: Types.ObjectId,
  ): Promise<boolean> {
    const inv = await this.inventoryModel.findById(inventoryId).exec();
    if (!inv) return false;
    if (userRole === UserRole.MASTER_ADMIN) return true;
    if (inv.isResellerInventory) {
      return inv.resellerId?.toString() === userId;
    }
    return inv.companyId.toString() === userCompanyId?.toString();
  }

  async getInventoryByIdWithAccess(
    id: string,
    userId: string,
    userRole: UserRole,
    userCompanyId?: Types.ObjectId,
  ): Promise<InventoryDocument> {
    const inv = await this.getInventoryById(id);
    const allowed = await this.checkInventoryAccess(
      id,
      userId,
      userRole,
      userCompanyId,
    );
    if (!allowed) {
      throw new ForbiddenException('Access denied to this inventory');
    }
    return inv;
  }

  async getInventoriesByCompany(
    companyId: string,
    page = 1,
    limit = 10,
    companyOnly = true,
  ): Promise<PaginatedResult<InventoryDocument>> {
    const l = normalizeLimit(limit);
    const filter: Record<string, unknown> = { companyId: new Types.ObjectId(companyId) };
    if (companyOnly) {
      filter.isResellerInventory = false;
    }
    const [data, total] = await Promise.all([
      this.inventoryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.inventoryModel.countDocuments(filter).exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async getResellerInventories(resellerId: string): Promise<InventoryDocument[]> {
    return this.inventoryModel
      .find({ resellerId: new Types.ObjectId(resellerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getWhitelistedInventoriesForReseller(
    resellerId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<InventoryDocument>> {
    const l = normalizeLimit(limit);
    const filter = {
      isResellerInventory: false,
      whitelist: new Types.ObjectId(resellerId),
    };
    const [data, total] = await Promise.all([
      this.inventoryModel
        .find(filter)
        .sort({ name: 1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.inventoryModel.countDocuments(filter).exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async updateInventory(
    id: string,
    dto: UpdateInventoryDto,
  ): Promise<InventoryDocument> {
    const inv = await this.inventoryModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!inv) {
      throw new NotFoundException('Inventory not found');
    }
    return inv;
  }

  async deleteInventory(id: string): Promise<void> {
    const inv = await this.getInventoryById(id);
    const ItemModel = this.inventoryModel.db.model('Item');
    const itemCount = await ItemModel.countDocuments({
      inventoryId: inv._id,
    }).exec();
    if (itemCount > 0) {
      throw new BadRequestException(
        'Cannot delete inventory that contains items',
      );
    }
    const result = await this.inventoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Inventory not found');
    }
  }

  async addResellerToWhitelist(
    inventoryId: string,
    resellerId: string,
  ): Promise<InventoryDocument> {
    const inv = await this.getInventoryById(inventoryId);
    if (inv.isResellerInventory) {
      throw new BadRequestException('Cannot whitelist on reseller inventory');
    }
    const rid = new Types.ObjectId(resellerId);
    if (inv.whitelist.some((id) => id.equals(rid))) {
      return inv;
    }
    const updated = await this.inventoryModel
      .findByIdAndUpdate(
        inventoryId,
        { $addToSet: { whitelist: rid } },
        { new: true },
      )
      .exec();
    return updated!;
  }

  async removeResellerFromWhitelist(
    inventoryId: string,
    resellerId: string,
  ): Promise<InventoryDocument> {
    const updated = await this.inventoryModel
      .findByIdAndUpdate(
        inventoryId,
        { $pull: { whitelist: new Types.ObjectId(resellerId) } },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Inventory not found');
    }
    return updated;
  }
}
