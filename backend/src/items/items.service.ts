import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ItemDocument } from './schemas/item.schema';
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
  ) {}

  async addItem(dto: CreateItemDto): Promise<ItemDocument> {
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
    return this.itemModel.create({
      ...dto,
      serial: dto.serial.trim(),
      inventoryId: new Types.ObjectId(dto.inventoryId),
      categories: (dto.categories ?? []).map((id) => new Types.ObjectId(id)),
    });
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

  async updateItem(id: string, dto: UpdateItemDto): Promise<ItemDocument> {
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
    const item = await this.itemModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async deleteItem(id: string): Promise<void> {
    const result = await this.itemModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Item not found');
    }
  }

  async moveItemBetweenInventories(
    itemId: string,
    targetInventoryId: string,
  ): Promise<ItemDocument> {
    const item = await this.getItemById(itemId);
    const updated = await this.itemModel
      .findByIdAndUpdate(
        itemId,
        { $set: { inventoryId: new Types.ObjectId(targetInventoryId) } },
        { new: true },
      )
      .exec();
    return updated!;
  }
}
