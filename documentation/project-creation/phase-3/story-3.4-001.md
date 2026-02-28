# Story 3.4-001: Inventory Service

## Metadata
- **Category:** Business Logic
- **Priority:** High
- **Estimated Effort:** 6 hours
- **Dependencies:** Story 1.4-001, Story 2.4-001, Story 3.2-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Implement Inventory service with CRUD operations, whitelist management, and reseller access control. Resellers only see whitelisted inventories.

## Tasks
1. Create InventoryService with dependency injection
2. Implement createInventory() for company and reseller inventories
3. Implement getInventoryById() with access checks
4. Implement getInventoriesByCompany() 
5. Implement getResellerInventories() for whitelisted access
6. Implement updateInventory() with authorization
7. Implement deleteInventory() with item check
8. Implement addResellerToWhitelist()
9. Implement removeResellerFromWhitelist()
10. Implement checkInventoryAccess() helper
11. Write unit and integration tests

## Acceptance Criteria
- Resellers see only whitelisted inventories
- Cannot delete inventory with items
- Whitelist only accepts reseller user IDs
- Company and reseller inventories supported
- Proper authorization checks
- All operations audited

## Technical Notes

### Inventory Service Implementation
```typescript
// inventories/inventories.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory } from './schemas/inventory.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AuditService } from '../audit/audit.service';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class InventoriesService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel('Item') private itemModel: Model<any>,
    @InjectModel('User') private userModel: Model<any>,
    private auditService: AuditService,
  ) {}

  async createInventory(createInventoryDto: CreateInventoryDto, actorId: string, companyId: string): Promise<Inventory> {
    const inventory = new this.inventoryModel({
      ...createInventoryDto,
      companyId,
      whitelist: [],
    });
    await inventory.save();

    await this.auditService.createAuditRecord({
      entityType: 'Inventory',
      entityId: inventory.id,
      action: 'CREATE',
      actorId,
      metadata: { name: inventory.name, companyId },
    });

    return inventory;
  }

  async getInventoryById(
    inventoryId: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<Inventory> {
    const inventory = await this.inventoryModel.findById(inventoryId).exec();

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
    }

    // Check access
    const hasAccess = await this.checkInventoryAccess(inventory, actorId, actorRole, actorCompanyId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this inventory');
    }

    return inventory;
  }

  async getInventoriesByCompany(companyId: string, actorRole: Role, actorCompanyId: string): Promise<Inventory[]> {
    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== companyId) {
      throw new ForbiddenException('Access denied to this company inventories');
    }

    return this.inventoryModel.find({ companyId }).exec();
  }

  async getResellerInventories(resellerId: string): Promise<Inventory[]> {
    return this.inventoryModel.find({
      whitelist: resellerId,
    }).exec();
  }

  async updateInventory(
    inventoryId: string,
    updateInventoryDto: UpdateInventoryDto,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<Inventory> {
    const inventory = await this.inventoryModel.findById(inventoryId).exec();

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== inventory.companyId) {
      throw new ForbiddenException('Access denied to update this inventory');
    }

    Object.assign(inventory, updateInventoryDto);
    await inventory.save();

    await this.auditService.createAuditRecord({
      entityType: 'Inventory',
      entityId: inventory.id,
      action: 'UPDATE',
      actorId,
      metadata: { changes: updateInventoryDto },
    });

    return inventory;
  }

  async deleteInventory(
    inventoryId: string,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<void> {
    const inventory = await this.inventoryModel.findById(inventoryId).exec();

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
    }

    // Authorization check
    if (actorRole !== Role.MasterAdmin && actorCompanyId !== inventory.companyId) {
      throw new ForbiddenException('Access denied to delete this inventory');
    }

    // Check for items
    const itemCount = await this.itemModel.countDocuments({ inventoryId }).exec();
    if (itemCount > 0) {
      throw new BadRequestException('Cannot delete inventory that contains items');
    }

    await this.inventoryModel.findByIdAndDelete(inventoryId).exec();

    await this.auditService.createAuditRecord({
      entityType: 'Inventory',
      entityId: inventory.id,
      action: 'DELETE',
      actorId,
      metadata: { name: inventory.name },
    });
  }

  async addResellerToWhitelist(
    inventoryId: string,
    resellerId: string,
    actorId: string,
    actorCompanyId: string,
  ): Promise<Inventory> {
    const inventory = await this.inventoryModel.findById(inventoryId).exec();

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
    }

    if (inventory.companyId !== actorCompanyId) {
      throw new ForbiddenException('Access denied to modify this inventory');
    }

    // Verify reseller exists and has Reseller role
    const reseller = await this.userModel.findById(resellerId).exec();
    if (!reseller || reseller.role !== Role.Reseller) {
      throw new BadRequestException('Invalid reseller ID');
    }

    // Add to whitelist if not already present
    if (!inventory.whitelist.includes(resellerId)) {
      inventory.whitelist.push(resellerId);
      await inventory.save();

      await this.auditService.createAuditRecord({
        entityType: 'Inventory',
        entityId: inventory.id,
        action: 'UPDATE',
        actorId,
        metadata: { action: 'add_reseller_to_whitelist', resellerId },
      });
    }

    return inventory;
  }

  async removeResellerFromWhitelist(
    inventoryId: string,
    resellerId: string,
    actorId: string,
    actorCompanyId: string,
  ): Promise<Inventory> {
    const inventory = await this.inventoryModel.findById(inventoryId).exec();

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
    }

    if (inventory.companyId !== actorCompanyId) {
      throw new ForbiddenException('Access denied to modify this inventory');
    }

    inventory.whitelist = inventory.whitelist.filter(id => id !== resellerId);
    await inventory.save();

    await this.auditService.createAuditRecord({
      entityType: 'Inventory',
      entityId: inventory.id,
      action: 'UPDATE',
      actorId,
      metadata: { action: 'remove_reseller_from_whitelist', resellerId },
    });

    return inventory;
  }

  async checkInventoryAccess(
    inventory: Inventory,
    actorId: string,
    actorRole: Role,
    actorCompanyId: string,
  ): Promise<boolean> {
    // Master Admin has access to all
    if (actorRole === Role.MasterAdmin) {
      return true;
    }

    // Resellers only see whitelisted inventories
    if (actorRole === Role.Reseller) {
      return inventory.whitelist.includes(actorId);
    }

    // Other roles: must be same company
    return inventory.companyId === actorCompanyId;
  }
}
```

## Testing Requirements
- Test create inventory
- Test reseller sees only whitelisted inventories
- Test cannot delete inventory with items
- Test whitelist management
- Test access control
- Test audit records

## Documentation Requirements
- Document whitelist management
- Document access control rules
- Add API examples

## Related Files
- `src/inventories/inventories.service.ts` (create)
- `src/inventories/inventories.controller.ts` (create)
- `src/inventories/dto/*.dto.ts` (create)
- `src/inventories/inventories.module.ts` (create)

## Notes
- Whitelist is critical for reseller access control
- Consider adding inventory capacity limits
- Consider adding inventory location tracking
