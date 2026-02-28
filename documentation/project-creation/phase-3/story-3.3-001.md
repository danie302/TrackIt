# Story 3.3-001: Category Service

## Metadata
- **Category:** Business Logic
- **Priority:** Medium
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 1.3-001, Story 2.4-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement Category service with CRUD operations and usage validation. Categories are unique per company and cannot be deleted if in use by items.

## Tasks
1. Create CategoryService with dependency injection
2. Implement createCategory() with uniqueness check per company
3. Implement getCategoriesByCompany() with filtering
4. Implement updateCategory() with authorization
5. Implement deleteCategory() with usage check
6. Implement checkCategoryUsage() helper
7. Add pagination support
8. Write unit and integration tests

## Acceptance Criteria
- Categories unique per company (not globally)
- Cannot delete category if in use by items
- Only Company Admin and Employer can create categories
- Proper authorization checks
- All operations audited
- Clear error messages

## Technical Notes

### Category Service Implementation
```typescript
// categories/categories.service.ts
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel('Item') private itemModel: Model<any>,
    private auditService: AuditService,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto, actorId: string, companyId: string): Promise<Category> {
    // Check uniqueness within company
    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name,
      companyId,
    }).exec();

    if (existingCategory) {
      throw new ConflictException(`Category '${createCategoryDto.name}' already exists in this company`);
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      companyId,
    });
    await category.save();

    await this.auditService.createAuditRecord({
      entityType: 'Category',
      entityId: category.id,
      action: 'CREATE',
      actorId,
      metadata: { name: category.name, companyId },
    });

    return category;
  }

  async getCategoriesByCompany(companyId: string, page: number = 1, limit: number = 50): Promise<{
    categories: Category[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      this.categoryModel.find({ companyId }).skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments({ companyId }).exec(),
    ]);

    return {
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
    actorId: string,
    companyId: string,
  ): Promise<Category> {
    const category = await this.categoryModel.findById(categoryId).exec();

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    if (category.companyId !== companyId) {
      throw new BadRequestException('Category does not belong to your company');
    }

    // Check name uniqueness if changed
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryModel.findOne({
        name: updateCategoryDto.name,
        companyId,
      }).exec();

      if (existingCategory) {
        throw new ConflictException(`Category '${updateCategoryDto.name}' already exists in this company`);
      }
    }

    Object.assign(category, updateCategoryDto);
    await category.save();

    await this.auditService.createAuditRecord({
      entityType: 'Category',
      entityId: category.id,
      action: 'UPDATE',
      actorId,
      metadata: { changes: updateCategoryDto },
    });

    return category;
  }

  async deleteCategory(categoryId: string, actorId: string, companyId: string): Promise<void> {
    const category = await this.categoryModel.findById(categoryId).exec();

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    if (category.companyId !== companyId) {
      throw new BadRequestException('Category does not belong to your company');
    }

    // Check if category is in use
    const isInUse = await this.checkCategoryUsage(categoryId);
    if (isInUse) {
      throw new BadRequestException('Cannot delete category that is in use by items');
    }

    await this.categoryModel.findByIdAndDelete(categoryId).exec();

    await this.auditService.createAuditRecord({
      entityType: 'Category',
      entityId: category.id,
      action: 'DELETE',
      actorId,
      metadata: { name: category.name },
    });
  }

  async checkCategoryUsage(categoryId: string): Promise<boolean> {
    const count = await this.itemModel.countDocuments({
      categories: categoryId,
    }).exec();

    return count > 0;
  }
}
```

### DTOs
```typescript
// categories/dto/create-category.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

// categories/dto/update-category.dto.ts
export class UpdateCategoryDto {
  @ApiProperty({ example: 'Electronics & Accessories' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

## Testing Requirements
- Test category uniqueness per company
- Test cannot delete category in use
- Test can delete unused category
- Test authorization checks
- Test audit records created
- Test pagination

## Documentation Requirements
- Document category management API
- Document usage validation rules
- Add examples

## Related Files
- `src/categories/categories.service.ts` (create)
- `src/categories/categories.controller.ts` (create)
- `src/categories/dto/*.dto.ts` (create)
- `src/categories/categories.module.ts` (create)

## Notes
- Categories are company-scoped, not global
- Consider adding category hierarchy (parent/child)
- Consider adding category descriptions
