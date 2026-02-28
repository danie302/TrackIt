# Story 1.3-001: Implement Category Mongoose Schema

## Metadata
- **Category:** Backend
- **Priority:** High
- **Estimated Effort:** 2 hours
- **Dependencies:** Story 0.3-001, Story 1.1-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create the Category model for organizing inventory items with company-specific categorization.

## Tasks
1. Create `backend/src/categories/schemas/category.schema.ts`
2. Define schema with fields:
   - name (String, required)
   - companyId (ObjectId, required, ref: Company)
   - createdAt (Date, auto-generated)
   - updatedAt (Date, auto-generated)
3. Add validation rules:
   - name: minimum 2 characters, maximum 50 characters
   - companyId: required, must reference valid company
4. Create compound unique index on (companyId + name)
5. Add timestamps plugin
6. Add reference to Company model with populate support
7. Create TypeScript interfaces
8. Export schema and model

## Acceptance Criteria
- Schema enforces unique category names per company
- Same category name can exist in different companies
- Company reference works correctly with populate
- Compound unique index (companyId, name) is created in MongoDB
- Timestamps are auto-generated
- Schema validation prevents invalid data

## Technical Notes
```typescript
@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, minlength: 2, maxlength: 50 })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Compound unique index
CategorySchema.index({ companyId: 1, name: 1 }, { unique: true });

export type CategoryDocument = Category & Document;
```

## Testing Requirements
- Unit tests: Schema validation rules
- Test compound unique index (companyId + name)
- Test that same name works for different companies
- Test company reference population

## Documentation Requirements
- Add JSDoc comments to schema
- Document the compound unique constraint

## Related Files
- `backend/src/categories/schemas/category.schema.ts` (create)
- `backend/src/categories/categories.module.ts` (update)

## Notes
- Categories are company-specific for organization flexibility
- Compound index ensures uniqueness within company scope only
- Categories will be used to filter items in inventories
