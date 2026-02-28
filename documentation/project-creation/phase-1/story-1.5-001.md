# Story 1.5-001: Implement Item Mongoose Schema

## Metadata
- **Category:** Backend
- **Priority:** Critical
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 1.3-001, Story 1.4-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create the Item model with global serial number uniqueness constraint for tracking individual inventory items.

## Tasks
1. Create `backend/src/items/schemas/item.schema.ts`
2. Define schema with fields:
   - name (String, required)
   - brand (String, required)
   - serial (String, required, globally unique)
   - price (Number, required, positive)
   - retailPrice (Number, required, positive)
   - inventoryId (ObjectId, required, ref: Inventory)
   - categories (Array of ObjectId, ref: Category)
   - createdAt (Date, auto-generated)
   - updatedAt (Date, auto-generated)
3. Add validation: serial globally unique, prices positive
4. Create unique index on serial field (GLOBAL)
5. Create index on inventoryId for query performance
6. Create index on categories for filtering
7. Add reference to Inventory model
8. Add pre-save hook to validate serial uniqueness
9. Add price validation (must be positive numbers)
10. Create TypeScript interfaces
11. Export schema and model

## Acceptance Criteria
- Serial number uniqueness is enforced GLOBALLY across all items
- Prices are validated as positive numbers (> 0)
- Inventory reference works correctly with populate
- Categories array can store multiple category IDs
- Indexes are created on serial, inventoryId, and categories
- Schema prevents duplicate serial numbers
- Price validation prevents negative or zero values

## Technical Notes
```typescript
@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({ required: true, minlength: 2, maxlength: 50 })
  brand: string;

  @Prop({ required: true, unique: true, index: true })
  serial: string;

  @Prop({ required: true, min: 0.01 })
  price: number;

  @Prop({ required: true, min: 0.01 })
  retailPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'Inventory', required: true, index: true })
  inventoryId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [], index: true })
  categories: Types.ObjectId[];
}

export const ItemSchema = SchemaFactory.createForClass(Item);

// Ensure serial uniqueness validation
ItemSchema.pre('save', async function(next) {
  if (this.isModified('serial')) {
    const existing = await this.constructor.findOne({ serial: this.serial });
    if (existing && existing._id.toString() !== this._id.toString()) {
      next(new Error('Serial number must be globally unique'));
    }
  }
  next();
});

export type ItemDocument = Item & Document;
```

## Testing Requirements
- Test serial number global uniqueness
- Test price validation (positive numbers only)
- Test retailPrice validation
- Test inventory reference
- Test categories array operations
- Test index creation

## Documentation Requirements
- Document serial number uniqueness requirement
- Document price fields (purchase vs retail)

## Related Files
- `backend/src/items/schemas/item.schema.ts` (create)
- `backend/src/items/items.module.ts` (update)

## Notes
- Serial numbers are GLOBALLY unique (not per inventory or company)
- Price = purchase/cost price
- RetailPrice = selling price to customers
- Items can belong to multiple categories for flexible organization
- Serial numbers are critical for audit trail and item tracking
