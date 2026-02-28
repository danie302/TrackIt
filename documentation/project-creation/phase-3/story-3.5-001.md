# Story 3.5-001: Item Service

## Metadata
- **Category:** Business Logic
- **Priority:** High
- **Estimated Effort:** 6 hours
- **Dependencies:** Story 1.5-001, Story 2.4-001, Story 3.4-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement Item service with CRUD operations, globally unique serial numbers, category filtering, and inventory transfer support.

## Tasks
1. Create ItemService with dependency injection
2. Implement addItem() with serial uniqueness validation
3. Implement getItemById() with access checks
4. Implement getItemsByInventory() with category filtering
5. Implement updateItem() with validation
6. Implement deleteItem() with authorization
7. Implement validateSerialUniqueness() globally
8. Implement moveItemBetweenInventories() for order approval
9. Add price validation (positive values)
10. Write unit and integration tests

## Acceptance Criteria
- Serial numbers globally unique across all companies
- Prices must be positive
- Filter items by category
- moveItemBetweenInventories() used by order service
- Proper authorization checks
- All operations audited

## Technical Notes

### Item Service Implementation
```typescript
// items/items.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuditService } from '../audit/audit.service';
import { InventoriesService } from '../inventories/inventories.service';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<Item>,
    private inventoriesService: InventoriesService,
    private auditService: AuditService,
  ) {}

  async addItem(createItemDto: CreateItemDto, actorId: string, actorRole: Role, actorCompanyId: string): Promise<Item> {
    // Validate serial uniqueness globally
    await this.validateSerialUniqueness(createItemDto.serial);

    // Validate prices
    if (createItemDto.price <= 0 || createItemDto.retailPrice <= 0) {
      throw new BadRequestException('Prices must be positive values');
    }

    // Verify inventory access
    const inventory = await this.inventoriesService.getInventoryById(
      createItemDto.inventoryId,
      actorId,
      actorRole,
      actorCompanyId,
    );

    const item = new this.itemModel(createItemDto);
    await item.save();

    await this.auditService.createAuditRecord({
      entityType: 'Item',
      entityId: item.id,
      action: 'CREATE',
      actorId,
      metadata: { 
        serial: item.serial,
        name: item.name,
        inventoryId: item.inventoryId,
      },
    });

    return item;
  }

  async getItemById(
    itemId: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<Item> {
    const item = await this.itemModel.findById(itemId).populate('inventoryId').exec();

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Check inventory access
    const inventory = await this.inventoriesService.getInventoryById(
      item.inventoryId.toString(),
      actorId,
      actorRole,
      actorCompanyId,
    );

    return item;
  }

  async getItemsByInventory(
    inventoryId: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
    categoryFilter?: string[],
  ): Promise<Item[]> {
    // Verify inventory access
    await this.inventoriesService.getInventoryById(inventoryId, actorId, actorRole, actorCompanyId);

    const query: any = { inventoryId };

    // Apply category filter if provided
    if (categoryFilter && categoryFilter.length > 0) {
      query.categories = { $in: categoryFilter };
    }

    return this.itemModel.find(query).exec();
  }

  async updateItem(
    itemId: string,
    updateItemDto: UpdateItemDto,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<Item> {
    const item = await this.itemModel.findById(itemId).populate('inventoryId').exec();

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Verify inventory access
    await this.inventoriesService.getInventoryById(
      item.inventoryId.toString(),
      actorId,
      actorRole,
      actorCompanyId,
    );

    // Validate serial uniqueness if changed
    if (updateItemDto.serial && updateItemDto.serial !== item.serial) {
      await this.validateSerialUniqueness(updateItemDto.serial);
    }

    // Validate prices
    if (updateItemDto.price !== undefined && updateItemDto.price <= 0) {
      throw new BadRequestException('Price must be a positive value');
    }
    if (updateItemDto.retailPrice !== undefined && updateItemDto.retailPrice <= 0) {
      throw new BadRequestException('Retail price must be a positive value');
    }

    Object.assign(item, updateItemDto);
    await item.save();

    await this.auditService.createAuditRecord({
      entityType: 'Item',
      entityId: item.id,
      action: 'UPDATE',
      actorId,
      metadata: { changes: updateItemDto },
    });

    return item;
  }

  async deleteItem(
    itemId: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<void> {
    const item = await this.itemModel.findById(itemId).populate('inventoryId').exec();

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Verify inventory access
    await this.inventoriesService.getInventoryById(
      item.inventoryId.toString(),
      actorId,
      actorRole,
      actorCompanyId,
    );

    // Only Employer and above can delete items
    if (actorRole === Role.Reseller) {
      throw new ForbiddenException('Resellers cannot delete items');
    }

    await this.itemModel.findByIdAndDelete(itemId).exec();

    await this.auditService.createAuditRecord({
      entityType: 'Item',
      entityId: item.id,
      action: 'DELETE',
      actorId,
      metadata: { serial: item.serial, name: item.name },
    });
  }

  async validateSerialUniqueness(serial: string): Promise<void> {
    const existingItem = await this.itemModel.findOne({ serial }).exec();
    if (existingItem) {
      throw new ConflictException(`Item with serial number '${serial}' already exists`);
    }
  }

  async moveItemBetweenInventories(
    itemId: string,
    targetInventoryId: string,
    actorId: string,
  ): Promise<Item> {
    const item = await this.itemModel.findById(itemId).exec();

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    const sourceInventoryId = item.inventoryId;
    item.inventoryId = targetInventoryId;
    await item.save();

    await this.auditService.createAuditRecord({
      entityType: 'Item',
      entityId: item.id,
      action: 'TRANSFER',
      actorId,
      metadata: {
        serial: item.serial,
        sourceInventoryId,
        targetInventoryId,
      },
    });

    return item;
  }
}
```

### DTOs
```typescript
// items/dto/create-item.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ example: 'Laptop Dell XPS 15' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Dell' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'DELL-XPS-12345' })
  @IsString()
  @IsNotEmpty()
  serial: string;

  @ApiProperty({ example: 1200.00 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0.01)
  retailPrice: number;

  @ApiProperty({ example: ['507f1f77bcf86cd799439011'] })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  @IsNotEmpty()
  inventoryId: string;
}
```

## Testing Requirements
- Test serial number global uniqueness
- Test price validation (positive values)
- Test category filtering
- Test item transfer between inventories
- Test authorization checks
- Test audit records for all operations

## Documentation Requirements
- Document serial number uniqueness
- Document item transfer flow
- Add API examples
- Document category filtering

## Related Files
- `src/items/items.service.ts` (create)
- `src/items/items.controller.ts` (create)
- `src/items/dto/*.dto.ts` (create)
- `src/items/items.module.ts` (create)

## Notes
- Serial numbers are globally unique (critical requirement)
- Item transfers are atomic operations
- Consider adding item images
- Consider adding item status (available, reserved, sold)
