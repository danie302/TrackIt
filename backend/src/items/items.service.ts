import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ItemDocument } from './schemas/item.schema';
import { AuditsService } from '../audits/audits.service';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';
import { InventoriesService } from '../inventories/inventories.service';
import { UserRole } from '../users/schemas/user.schema';
import {
  normalizeLimit,
  paginateSkip,
  toPaginatedResult,
  type PaginatedResult,
} from '../common/pagination.dto';

export interface CreateItemDto {
  name: string;
  brand: string;
  serial: string;
  price: number;
  retailPrice: number;
  inventoryId: string;
  categories?: string[];
}

export interface UpdateItemDto {
  name?: string;
  brand?: string;
  serial?: string;
  price?: number;
  retailPrice?: number;
  categories?: Types.ObjectId[];
}

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel('Item') private itemModel: Model<ItemDocument>,
    private auditsService: AuditsService,
    private inventoriesService: InventoriesService,
  ) {}

  async addItem(dto: CreateItemDto, actorId: string): Promise<ItemDocument> {
    if (dto.price < 0 || dto.retailPrice < 0) {
      throw new BadRequestException('Prices must be positive');
    }
    const existing = await this.itemModel
      .findOne({ serial: dto.serial.trim() })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Item with serial '${dto.serial}' already exists`,
      );
    }
    const item = await this.itemModel.create({
      ...dto,
      serial: dto.serial.trim(),
      inventoryId: new Types.ObjectId(dto.inventoryId),
      categories: (dto.categories ?? []).map((id) => new Types.ObjectId(id)),
    });

    // Get the inventory to find the company ID for audit
    const inventory = await this.inventoriesService.getInventoryById(dto.inventoryId);

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.ITEM,
      entityId: item._id,
      action: AuditAction.CREATE,
      actor: new Types.ObjectId(actorId),
      description: `Added item: ${item.name} (Serial: ${item.serial})`,
      companyId: inventory.companyId,
      metadata: {
        inventoryId: item.inventoryId,
        serial: item.serial,
        brand: item.brand,
      },
    });

    return item;
  }

  async getItemById(id: string): Promise<ItemDocument> {
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async getItemsByInventory(
    inventoryId: string,
    page = 1,
    limit = 10,
    categoryId?: string,
  ): Promise<PaginatedResult<ItemDocument>> {
    const l = normalizeLimit(limit);
    const filter: Record<string, unknown> = {
      inventoryId: new Types.ObjectId(inventoryId),
    };
    if (categoryId) {
      filter.categories = new Types.ObjectId(categoryId);
    }
    const [data, total] = await Promise.all([
      this.itemModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.itemModel.countDocuments(filter).exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async updateItem(id: string, dto: UpdateItemDto, actorId: string): Promise<ItemDocument> {
    if (dto.serial !== undefined) {
      const existing = await this.itemModel
        .findOne({ serial: dto.serial.trim(), _id: { $ne: id } })
        .exec();
      if (existing) {
        throw new ConflictException(
          `Item with serial '${dto.serial}' already exists`,
        );
      }
    }
    if (dto.price !== undefined && dto.price < 0) {
      throw new BadRequestException('Price must be positive');
    }
    if (dto.retailPrice !== undefined && dto.retailPrice < 0) {
      throw new BadRequestException('Retail price must be positive');
    }

    const oldItem = await this.itemModel.findById(id).exec();
    if (!oldItem) {
      throw new NotFoundException('Item not found');
    }

    const item = await this.itemModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Get the inventory to find the company ID for audit
    const inventory = await this.inventoriesService.getInventoryById(item.inventoryId.toString());

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.ITEM,
      entityId: item._id,
      action: AuditAction.UPDATE,
      actor: new Types.ObjectId(actorId),
      description: `Updated item: ${item.name} (Serial: ${item.serial})`,
      companyId: inventory.companyId,
      metadata: {
        changes: dto,
      },
    });

    return item;
  }

  async deleteItem(id: string, actorId: string): Promise<void> {
    const item = await this.itemModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const result = await this.itemModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Item not found');
    }

    // Get the inventory to find the company ID for audit
    const inventory = await this.inventoriesService.getInventoryById(item.inventoryId.toString());

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.ITEM,
      entityId: item._id,
      action: AuditAction.DELETE,
      actor: new Types.ObjectId(actorId),
      description: `Deleted item: ${item.name} (Serial: ${item.serial})`,
      companyId: inventory.companyId,
      metadata: {
        serial: item.serial,
        brand: item.brand,
      },
    });
  }

  async moveItemBetweenInventories(
    itemId: string,
    targetInventoryId: string,
    actorId: string,
  ): Promise<ItemDocument> {
    const item = await this.getItemById(itemId);

    // Get the inventories to find the company ID for audit
    const oldInventory = await this.inventoriesService.getInventoryById(item.inventoryId.toString());
    const newInventory = await this.inventoriesService.getInventoryById(targetInventoryId);

    const updated = await this.itemModel
      .findByIdAndUpdate(
        itemId,
        { $set: { inventoryId: new Types.ObjectId(targetInventoryId) } },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Item not found');
    }

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.ITEM,
      entityId: updated._id,
      action: AuditAction.MOVE,
      actor: new Types.ObjectId(actorId),
      description: `Moved item: ${updated.name} (Serial: ${updated.serial})`,
      companyId: newInventory.companyId,
      metadata: {
        serial: updated.serial,
        fromInventoryId: oldInventory._id.toString(),
        fromInventoryName: oldInventory.name,
        toInventoryId: newInventory._id.toString(),
        toInventoryName: newInventory.name,
      },
    });

    return updated;
  }
}
