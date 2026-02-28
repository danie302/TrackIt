# Story 1.4-001: Implement Inventory Mongoose Schema

## Metadata
- **Category:** Backend
- **Priority:** Critical
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 1.1-001, Story 1.2-001, Story 1.3-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create the Inventory model with support for both company and reseller inventories, including whitelist management.

## Tasks
1. Create `backend/src/inventories/schemas/inventory.schema.ts`
2. Define schema with fields:
   - name (String, required)
   - companyId (ObjectId, required, ref: Company)
   - resellerId (ObjectId, optional, ref: User)
   - isResellerInventory (Boolean, default: false)
   - categories (Array of ObjectId, ref: Category)
   - whitelist (Array of ObjectId, ref: User - reseller users)
   - createdAt (Date, auto-generated)
   - updatedAt (Date, auto-generated)
3. Add validation: resellerId required if isResellerInventory is true
4. Create indexes on companyId, resellerId, isResellerInventory
5. Add references to Company, User (reseller), and Category models
6. Create virtual for whitelist user details
7. Add custom validation method
8. Create TypeScript interfaces
9. Export schema and model

## Acceptance Criteria
- Schema validates reseller inventory rules correctly
- Whitelist stores array of user IDs (reseller role only)
- References populate correctly (company, reseller, categories)
- Indexes are created on all specified fields
- Virtual fields work for whitelist details
- Custom validation ensures resellerId present for reseller inventories

## Technical Notes
```typescript
@Schema({ timestamps: true })
export class Inventory {
  @Prop({ required: true, minlength: 3, maxlength: 100 })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  resellerId?: Types.ObjectId;

  @Prop({ default: false, index: true })
  isResellerInventory: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  categories: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  whitelist: Types.ObjectId[];
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Custom validation
InventorySchema.pre('save', function(next) {
  if (this.isResellerInventory && !this.resellerId) {
    next(new Error('resellerId is required for reseller inventories'));
  }
  next();
});

export type InventoryDocument = Inventory & Document;
```

## Testing Requirements
- Test reseller inventory validation (resellerId required)
- Test company inventory (resellerId optional)
- Test whitelist array operations
- Test category references
- Test indexes are created

## Documentation Requirements
- Document inventory types (company vs reseller)
- Document whitelist functionality

## Related Files
- `backend/src/inventories/schemas/inventory.schema.ts` (create)
- `backend/src/inventories/inventories.module.ts` (update)

## Notes
- Company inventories: isResellerInventory=false, no resellerId
- Reseller inventories: isResellerInventory=true, resellerId required
- Whitelist controls which resellers can see company inventory
- Categories help organize items within inventory
