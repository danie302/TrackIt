import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CategoryDocument } from './schemas/category.schema';
import {
  normalizeLimit,
  paginateSkip,
  toPaginatedResult,
  type PaginatedResult,
} from '../common/pagination.dto';

export interface CreateCategoryDto {
  name: string;
  companyId: string;
}

export interface UpdateCategoryDto {
  name?: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<CategoryDocument>,
  ) {}

  private get itemModel(): Model<unknown> {
    return this.categoryModel.db.model('Item') as Model<unknown>;
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const existing = await this.categoryModel
      .findOne({
        companyId: new Types.ObjectId(dto.companyId),
        name: dto.name.trim(),
      })
      .exec();
    if (existing) {
      throw new ConflictException(
        'Category with this name already exists for this company',
      );
    }
    return this.categoryModel.create({
      name: dto.name.trim(),
      companyId: new Types.ObjectId(dto.companyId),
    });
  }

  async getCategoriesByCompany(
    companyId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<CategoryDocument>> {
    const l = normalizeLimit(limit);
    const [data, total] = await Promise.all([
      this.categoryModel
        .find({ companyId: new Types.ObjectId(companyId) })
        .sort({ name: 1 })
        .skip(paginateSkip(page, l))
        .limit(l)
        .exec(),
      this.categoryModel
        .countDocuments({ companyId: new Types.ObjectId(companyId) })
        .exec(),
    ]);
    return toPaginatedResult(data, total, page, l);
  }

  async getCategoryById(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (dto.name !== undefined) {
      const existing = await this.categoryModel
        .findOne({
          companyId: category.companyId,
          name: dto.name.trim(),
          _id: { $ne: id },
        })
        .exec();
      if (existing) {
        throw new ConflictException(
          'Category with this name already exists for this company',
        );
      }
    }
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    return updated!;
  }

  async checkCategoryUsage(categoryId: string): Promise<boolean> {
    const count = await this.itemModel
      .countDocuments({
        categories: new Types.ObjectId(categoryId),
      })
      .exec();
    return count > 0;
  }

  async deleteCategory(id: string): Promise<void> {
    const inUse = await this.checkCategoryUsage(id);
    if (inUse) {
      throw new BadRequestException(
        'Cannot delete category that is assigned to items',
      );
    }
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Category not found');
    }
  }
}
