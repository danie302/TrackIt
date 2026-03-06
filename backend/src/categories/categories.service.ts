import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CategoryDocument } from './schemas/category.schema';
import { AuditsService } from '../audits/audits.service';
import { EntityType, AuditAction } from '../audits/schemas/audit.schema';
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
    private auditsService: AuditsService,
  ) {}

  private get itemModel(): Model<unknown> {
    return this.categoryModel.db.model('Item') as Model<unknown>;
  }

  async createCategory(dto: CreateCategoryDto, actorId: string): Promise<CategoryDocument> {
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
    const category = await this.categoryModel.create({
      name: dto.name.trim(),
      companyId: new Types.ObjectId(dto.companyId),
    });

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.CATEGORY,
      entityId: category._id,
      action: AuditAction.CREATE,
      actor: new Types.ObjectId(actorId),
      description: `Created category: ${category.name}`,
      companyId: category.companyId,
    });

    return category;
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
    actorId: string,
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
    if (!updated) {
      throw new NotFoundException('Category not found');
    }

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.CATEGORY,
      entityId: updated._id,
      action: AuditAction.UPDATE,
      actor: new Types.ObjectId(actorId),
      description: `Updated category: ${updated.name}`,
      companyId: updated.companyId,
      metadata: {
        changes: dto,
      },
    });

    return updated;
  }

  async checkCategoryUsage(categoryId: string): Promise<boolean> {
    const count = await this.itemModel
      .countDocuments({
        categories: new Types.ObjectId(categoryId),
      })
      .exec();
    return count > 0;
  }

  async deleteCategory(id: string, actorId: string): Promise<void> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }

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

    // Create audit record
    await this.auditsService.createAuditRecord({
      entityType: EntityType.CATEGORY,
      entityId: category._id,
      action: AuditAction.DELETE,
      actor: new Types.ObjectId(actorId),
      description: `Deleted category: ${category.name}`,
      companyId: category.companyId,
    });
  }
}
